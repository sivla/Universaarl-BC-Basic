import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const evidenceRoot = path.resolve('evidence/playthru-environment-baseline');
const businessCentralHost = 'businesscentral.dynamics.com';
const businessCentralProtocol = 'https:';
const businessCentralPort = 443;
const readOnlyMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
const allowedResourceTypes = new Set(['document', 'script', 'stylesheet', 'image', 'font', 'xhr', 'fetch']);
const allowedRequestClassList = [...readOnlyMethods].flatMap((method) => [...allowedResourceTypes].map((resourceType) => `${method}:${resourceType}`)).sort();
const allowedQueryKeys = new Set(['page']);
const persistedTargetId = '[redacted-target-id]';
const persistedTenant = '[redacted-tenant]';
const persistedBasePath = '/[redacted-tenant]/playthru';
const evidenceSchemaVersion = 2;
const verifiedTargetBindings = new WeakMap();
const readOnlyGuardStates = new WeakMap();
const legacyManifestContracts = new Map([
  ['run-1', {
    path: path.resolve(evidenceRoot, 'run-1/manifest.json'),
    sha256: '04a099f0830c7a234c6a834ff2455d2cfa51a11d76bee76831efff77ff13a3e4'
  }],
  ['run-2', {
    path: path.resolve(evidenceRoot, 'run-2/manifest.json'),
    sha256: '490df612a29de17e8c3506fe9e08ef3df580f6dc0a41704b773b9da05471762e'
  }]
]);

export function sanitizeText(value) {
  if (value === null || value === undefined) return value;
  return String(value)
    .replace(/https?:\/\/[^\s<>"']+/gi, (url) => sanitizeUrl(url))
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, '[redacted-guid]')
    .replace(/\bUABC-BC-TARGET-[A-Z0-9-]+\b/g, persistedTargetId)
    .replace(/\b(?:hmac-)?sha256:[0-9a-f]{64}\b/gi, '[redacted-fingerprint]')
    .replace(/\b(?:hex|base64|base64url):[A-Za-z0-9+/_=-]{32,}\b/g, '[redacted-key-material]')
    .replace(/\btenant-[a-z0-9-]{16,80}\b/gi, persistedTenant)
    .replace(/(access_token|id_token|refresh_token|code)=([^&\s]+)/gi, '$1=[redacted]')
    .replace(/[\uE000-\uF8FF]/g, '')
    .trim();
}

export function validateBaseUrl(raw) {
  if (!raw) throw new Error('BC_BASE_URL ist lokal erforderlich und darf nicht versioniert werden.');
  let url;
  let segments;
  try {
    url = new URL(raw);
    segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    throw new Error('BC_BASE_URL ist syntaktisch ungueltig.');
  }
  if (url.protocol !== businessCentralProtocol) throw new Error('BC_BASE_URL muss HTTPS verwenden.');
  if (url.hostname !== businessCentralHost) throw new Error('BC_BASE_URL muss auf Business Central zeigen.');
  if ((url.port || String(businessCentralPort)) !== String(businessCentralPort)) throw new Error('BC_BASE_URL muss den effektiven HTTPS-Port 443 verwenden.');
  if (url.username || url.password || url.hash) throw new Error('BC_BASE_URL darf keine Zugangsdaten oder Fragmente enthalten.');
  if (segments.length !== 2 || segments[1]?.toLowerCase() !== 'playthru') throw new Error('BC_BASE_URL muss exakt auf den Tenant-/playthru-Basispfad zeigen.');
  if (!/^[A-Za-z0-9-]{2,80}$/.test(segments[0])) throw new Error('Die konfigurierte BC-Zielbindung enthaelt kein gueltiges Tenantsegment.');
  if (url.searchParams.has('company')) throw new Error('BC_BASE_URL darf keinen company-Parameter enthalten; ein Mandantenwechsel ist nicht autorisiert.');
  for (const key of url.searchParams.keys()) {
    if (!allowedQueryKeys.has(key)) throw new Error('BC_BASE_URL enthaelt eine nicht freigegebene Queryklasse.');
  }
  return url;
}

function targetTuple(raw) {
  const url = validateBaseUrl(raw);
  const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const tenantSegment = segments[0];
  const basePath = `/${encodeURIComponent(tenantSegment)}/playthru`;
  return {
    protocol: businessCentralProtocol,
    host: url.hostname.toLowerCase(),
    port: businessCentralPort,
    tenantSegment,
    environment: 'playthru',
    basePath,
    normalized: `protocol=${businessCentralProtocol}|host=${url.hostname.toLowerCase()}|port=${businessCentralPort}|tenant=${tenantSegment}|environment=playthru|basePath=${basePath}`
  };
}

function hasEnoughEntropy(value) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) return true;
  const unique = new Set(value.toLowerCase()).size;
  return value.length >= 28 && /[a-z]/i.test(value) && /\d/.test(value) && unique >= 12;
}

function sameFingerprint(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function validateTargetId(value) {
  if (typeof value !== 'string' || !/^UABC-BC-TARGET-[A-Z0-9][A-Z0-9-]{1,22}[A-Z0-9]$/.test(value)) {
    throw new Error('BC-Ziel-ID ist ungueltig: erforderlich ist eine kurze technische ID im Format UABC-BC-TARGET-[A-Z0-9-].');
  }
  const suffix = value.slice('UABC-BC-TARGET-'.length);
  if (/HTTP|BUSINESSCENTRAL|TENANT|SECRET|TOKEN|PASSWORD|FINGERPRINT|GUID|URL/.test(suffix)) {
    throw new Error('BC-Ziel-ID ist ungueltig: URL-, Tenant- oder Secret-Muster sind verboten.');
  }
  if (new Set(suffix).size < 3 || /^(.{1,12})\1+$/.test(suffix)) {
    throw new Error('BC-Ziel-ID ist ungueltig: einheitliche oder wiederholte Werte sind verboten.');
  }
  if (suffix.length >= 16 && /[A-Z]/.test(suffix) && /\d/.test(suffix) && new Set(suffix).size >= 12) {
    throw new Error('BC-Ziel-ID ist ungueltig: hochentropische freie Werte duerfen nicht persistiert werden.');
  }
  return value;
}

function validateEvidenceRunId(value) {
  if (typeof value !== 'string' || !/^[a-z][a-z0-9-]{2,47}$/.test(value)) throw new Error('EvidenceRun-ID muss eine kurze technische Kleinbuchstaben-ID sein.');
  if (/https?|tenant|secret|token|target|fingerprint|hmac/i.test(value)) throw new Error('EvidenceRun-ID darf keine Ziel-, URL-, Tenant- oder Secretsemantik tragen.');
  if ((value.length >= 24 && new Set(value).size >= 14) || /^(.{1,12})\1+$/.test(value)) throw new Error('EvidenceRun-ID darf kein hochentropischer oder wiederholter freier Wert sein.');
  return value;
}

function decodeHmacSecret(value) {
  if (typeof value !== 'string') throw new Error('BC-Zielbindung erfordert dekodierbares lokales HMAC-Schluesselmaterial.');
  let decoded;
  if (/^hex:[0-9a-f]+$/i.test(value) && (value.length - 4) % 2 === 0) decoded = Buffer.from(value.slice(4), 'hex');
  else if (/^base64:[A-Za-z0-9+/]+={0,2}$/.test(value)) decoded = Buffer.from(value.slice(7), 'base64');
  else if (/^base64url:[A-Za-z0-9_-]+$/.test(value)) decoded = Buffer.from(value.slice(10), 'base64url');
  else throw new Error('BC-Zielbindung erfordert HMAC-Schluesselmaterial mit expliziter hex-, base64- oder base64url-Kodierung.');
  if (decoded.length < 32 || decoded.length > 128) {
    throw new Error('BC-Zielbindung erfordert dekodiertes lokales HMAC-Schluesselmaterial mit 32 bis 128 Byte.');
  }
  if (new Set(decoded).size < 12) throw new Error('BC-Zielbindung lehnt einheitliches oder strukturell schwaches HMAC-Schluesselmaterial ab.');
  for (let size = 1; size <= Math.floor(decoded.length / 2); size += 1) {
    if (decoded.length % size !== 0) continue;
    const pattern = decoded.subarray(0, size);
    let repeated = true;
    for (let offset = size; offset < decoded.length; offset += size) {
      if (!decoded.subarray(offset, offset + size).equals(pattern)) { repeated = false; break; }
    }
    if (repeated) throw new Error('BC-Zielbindung lehnt wiederholtes HMAC-Schluesselmaterial ab.');
  }
  return decoded;
}

export function computeTargetFingerprint(raw, options = {}) {
  const tuple = targetTuple(raw);
  const hmacSecret = options.hmacSecret ?? '';
  if (hmacSecret) {
    const key = decodeHmacSecret(hmacSecret);
    return `hmac-sha256:${crypto.createHmac('sha256', key).update(tuple.normalized).digest('hex')}`;
  }
  if (!hasEnoughEntropy(tuple.tenantSegment)) {
    throw new Error('BC-Zielbindung verweigert nackten Hash fuer ein nicht ausreichend hochentropisches Tenantsegment; lokales HMAC-Geheimnis erforderlich.');
  }
  return `sha256:${crypto.createHash('sha256').update(tuple.normalized).digest('hex')}`;
}

export function verifyTargetBinding(raw, env = process.env) {
  const targetId = validateTargetId(env.BC_TARGET_ID);
  const expectedFingerprint = env.BC_TARGET_FINGERPRINT;
  if (!expectedFingerprint) {
    throw new Error('BC-Zielbindung fehlt: BC_TARGET_ID und BC_TARGET_FINGERPRINT muessen lokal gesetzt sein.');
  }
  const actualFingerprint = computeTargetFingerprint(raw, { hmacSecret: env.BC_TARGET_HMAC_SECRET });
  if (!sameFingerprint(actualFingerprint, expectedFingerprint)) {
    throw new Error('BC-Zielbindung stimmt nicht mit dem lokal erwarteten Fingerprint ueberein.');
  }
  const tuple = targetTuple(raw);
  const binding = Object.freeze({
    targetId: persistedTargetId,
    verified: true,
    fingerprintAlgorithm: actualFingerprint.split(':')[0],
    protocol: tuple.protocol,
    host: tuple.host,
    port: tuple.port,
    environment: tuple.environment,
    tenant: persistedTenant,
    basePath: persistedBasePath
  });
  verifiedTargetBindings.set(binding, { targetId, fingerprint: actualFingerprint, boundary: tuple });
  return binding;
}

function bindingState(targetBinding) {
  const state = targetBinding && verifiedTargetBindings.get(targetBinding);
  if (!state) throw new Error('Die BC-Zielgrenze ist nicht durch die aktuelle Modulinstanz verifiziert.');
  return state;
}

function publicTargetBinding(targetBinding) {
  bindingState(targetBinding);
  return normalize(targetBinding);
}

export function guardedClientState(rawUrl, expectedCompany = undefined, targetBinding) {
  const { boundary } = bindingState(targetBinding);
  let url;
  let segments;
  try {
    url = new URL(rawUrl);
    segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    throw new Error('Navigation hat eine syntaktisch ungueltige und deshalb blockierte URL geliefert.');
  }
  const effectivePort = Number(url.port || (url.protocol === businessCentralProtocol ? businessCentralPort : 0));
  if (
    url.protocol !== boundary.protocol
    || url.hostname.toLowerCase() !== boundary.host
    || effectivePort !== boundary.port
    || segments.length !== 2
    || segments[0] !== boundary.tenantSegment
    || segments[1]?.toLowerCase() !== boundary.environment
    || Boolean(url.username || url.password || url.hash)
  ) {
    throw new Error(`Navigation hat die autorisierte playthru-Grenze verlassen: ${sanitizeUrl(rawUrl)}`);
  }
  for (const key of url.searchParams.keys()) {
    if (!allowedQueryKeys.has(key) && key !== 'company') throw new Error('Navigation hat eine nicht freigegebene Queryklasse geliefert.');
  }
  const company = url.searchParams.get('company');
  if (expectedCompany && company && company !== expectedCompany) throw new Error('Der aktive Mandant hat sich waehrend der read-only Baseline geaendert.');
  return { company, redactedUrl: sanitizeUrl(rawUrl) };
}

export function sanitizeUrl(raw) {
  try {
    const url = new URL(raw);
    const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const environmentIndex = segments.findIndex((segment) => segment.toLowerCase() === 'playthru');
    const safePath = environmentIndex >= 0 ? '/[tenant]/playthru' : '/[redacted-path]';
    const queryKeys = [...url.searchParams.keys()];
    const safeQuery = queryKeys.length === 0
      ? ''
      : queryKeys.every((key) => key === 'page')
        ? '?page=[redacted]'
        : '?[redacted-query]';
    const safeHost = url.hostname.toLowerCase() === businessCentralHost ? businessCentralHost : '[redacted-host]';
    const safePort = url.port ? ':[redacted-port]' : '';
    return `${url.protocol}//${safeHost}${safePort}${safePath}${safeQuery}`;
  } catch {
    return '[invalid-url]';
  }
}

function requestBoundaryDecision(boundary, request) {
  const method = String(request.method ?? '').toUpperCase();
  const resourceType = request.resourceType ?? 'unknown';
  let url;
  try { url = new URL(request.url); }
  catch { return 'Request-URL ist ungueltig'; }
  let segments;
  try { segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent); }
  catch { return 'Request-Pfad ist syntaktisch ungueltig'; }
  const effectivePort = Number(url.port || (url.protocol === businessCentralProtocol ? businessCentralPort : 0));
  const bodyPresent = request.hasBody === true
    || (request.body !== undefined && request.body !== null && request.body !== '')
    || (request.postData !== undefined && request.postData !== null && request.postData !== '');
  if (url.protocol === 'ws:' || url.protocol === 'wss:' || resourceType === 'websocket') return 'WebSocket ist fuer Baseline-Evidence nicht erlaubt';
  if (request.serviceWorker === true) return 'Service-Worker-Bypass ist fuer Baseline-Evidence nicht erlaubt';
  if (url.protocol !== boundary.protocol) return 'Protokoll liegt ausserhalb der verifizierten HTTPS-Zielgrenze';
  if (url.hostname.toLowerCase() !== boundary.host) return 'Host liegt ausserhalb der verifizierten Zielgrenze';
  if (effectivePort !== boundary.port) return 'Port liegt ausserhalb der verifizierten Zielgrenze';
  if (url.username || url.password || url.hash) return 'Zugangsdaten oder Fragmente sind in Guard-Requests verboten';
  if (segments.length !== 2 || segments[0] !== boundary.tenantSegment || segments[1]?.toLowerCase() !== boundary.environment) return 'Pfad liegt ausserhalb des exakten verifizierten Tenant-/Environment-Basispfads';
  if (!readOnlyMethods.has(method)) return 'Methode ist nicht explizit als read-only freigegeben';
  if (bodyPresent) return 'Requestbody ist im read-only Baseline-Guard verboten';
  if (!allowedResourceTypes.has(resourceType)) return 'Ressourcenklasse ist nicht explizit fuer read-only Baseline-Evidence freigegeben';
  for (const key of url.searchParams.keys()) {
    if (!allowedQueryKeys.has(key)) return 'Queryklasse ist nicht explizit fuer read-only Baseline-Evidence freigegeben';
  }
  return null;
}

export function createReadOnlyNetworkGuard(targetBinding) {
  const targetState = bindingState(targetBinding);
  const state = {
    targetBinding,
    targetState,
    installed: false,
    blockedRequests: [],
    observedBusinessCentralRequests: 0,
    allowedRequests: 0,
    observedRequestClasses: new Set()
  };
  const guard = Object.freeze({
    inspect(request) {
      const method = String(request.method ?? '').toUpperCase();
      const resourceType = request.resourceType ?? 'unknown';
      state.observedRequestClasses.add(`${method}:${resourceType}`);
      state.observedBusinessCentralRequests += 1;
      const blockReason = requestBoundaryDecision(targetState.boundary, { ...request, method, resourceType });
      if (!blockReason) {
        state.allowedRequests += 1;
        return { action: 'allow', reason: 'explizit zielgebundene read-only Requestklasse' };
      }
      const blocked = {
        method,
        url: sanitizeUrl(request.url),
        resourceType,
        reason: blockReason
      };
      state.blockedRequests.push(blocked);
      return { action: 'block', reason: blocked.reason, blocked };
    },
    summary() {
      return guardSummary(state);
    }
  });
  readOnlyGuardStates.set(guard, state);
  return guard;
}

export async function installReadOnlyNetworkGuard(context, targetBinding) {
  if (!context || typeof context.route !== 'function' || typeof context.routeWebSocket !== 'function' || typeof context.serviceWorkers !== 'function') {
    throw new Error('Nur-Lese-Guard kann ohne HTTP-, WebSocket- und Service-Worker-API nicht fehlersicher installiert werden.');
  }
  if (context.serviceWorkers().length !== 0) throw new Error('Nur-Lese-Guard verweigert einen Kontext mit bereits aktiven Service Workern.');
  const guard = createReadOnlyNetworkGuard(targetBinding);
  const state = readOnlyGuardStates.get(guard);
  await context.route('**/*', async (route) => {
    const request = route.request();
    const decision = guard.inspect({
      method: request.method(),
      url: request.url(),
      resourceType: request.resourceType(),
      postData: request.postData(),
      serviceWorker: Boolean(request.serviceWorker?.())
    });
    if (decision.action === 'block') await route.abort('blockedbyclient');
    else await route.continue();
  });
  await context.routeWebSocket('**/*', async (webSocketRoute) => {
    guard.inspect({ method: 'GET', url: webSocketRoute.url(), resourceType: 'websocket' });
    await webSocketRoute.close({ code: 1008, reason: 'WebSocket im Nur-Lese-Nachweis blockiert.' });
  });
  state.installed = true;
  return guard;
}

function guardSummary(state) {
  return {
    mode: 'businesscentral-network-read-only-fail-closed',
    installation: { httpRoute: true, webSocketRoute: true, serviceWorkers: 'block' },
    observedBusinessCentralRequests: state.observedBusinessCentralRequests,
    allowedRequests: state.allowedRequests,
    observedRequestClasses: [...state.observedRequestClasses].sort(),
    allowedRequestClasses: [...allowedRequestClassList],
    blockedMutationAttempts: state.blockedRequests.length,
    blockedRequests: normalize(state.blockedRequests),
    targetBinding: publicTargetBinding(state.targetBinding),
    targetBoundaryVerified: true,
    limit: 'Der Guard klassifiziert Methoden konservativ; nicht eindeutig read-only klassifizierbare Business-Central-Requests werden vor der Ausfuehrung blockiert.'
  };
}

function installedGuardSummary(guard, targetBinding) {
  const state = guard && readOnlyGuardStates.get(guard);
  if (!state || state.installed !== true) throw new Error('Manifestabschluss erfordert das moduleigene, vollstaendig installierte Nur-Lese-Guard-Objekt.');
  bindingState(targetBinding);
  if (state.targetBinding !== targetBinding || state.targetState.targetId !== verifiedTargetBindings.get(targetBinding).targetId) {
    throw new Error('Nur-Lese-Guard und verifizierte BC-Zielbindung gehoeren nicht zum selben Ziel.');
  }
  return validateReadOnlyGuardSummary(guardSummary(state), publicTargetBinding(targetBinding));
}

function validatePersistedTargetBinding(binding, label = 'targetBinding') {
  if (!binding || typeof binding !== 'object' || Array.isArray(binding)) throw new Error(`${label} fehlt oder ist nicht strukturiert.`);
  const expectedKeys = ['basePath', 'environment', 'fingerprintAlgorithm', 'host', 'port', 'protocol', 'targetId', 'tenant', 'verified'];
  if (JSON.stringify(Object.keys(binding).sort()) !== JSON.stringify(expectedKeys)) throw new Error(`${label} enthaelt unerlaubte oder fehlende Felder.`);
  if (
    binding.targetId !== persistedTargetId
    || binding.verified !== true
    || !['sha256', 'hmac-sha256'].includes(binding.fingerprintAlgorithm)
    || binding.protocol !== businessCentralProtocol
    || binding.host !== businessCentralHost
    || binding.port !== businessCentralPort
    || binding.environment !== 'playthru'
    || binding.tenant !== persistedTenant
    || binding.basePath !== persistedBasePath
  ) throw new Error(`${label} ist nicht vollstaendig redigiert oder nicht exakt an HTTPS, Port 443 und playthru gebunden.`);
  const serialized = JSON.stringify(binding);
  if (/hmac-sha256:[0-9a-f]{64}|sha256:[0-9a-f]{64}|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i.test(serialized)) {
    throw new Error(`${label} enthaelt nicht persistierbare Ziel- oder Fingerprintdaten.`);
  }
  return normalize(binding);
}

export function validateReadOnlyGuardSummary(summary, expectedBinding = null) {
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) throw new Error('Validierter Nur-Lese-Guard-Summary ist fuer Manifestabschluss erforderlich.');
  const expectedKeys = ['allowedRequestClasses', 'allowedRequests', 'blockedMutationAttempts', 'blockedRequests', 'installation', 'limit', 'mode', 'observedBusinessCentralRequests', 'observedRequestClasses', 'targetBinding', 'targetBoundaryVerified'];
  if (JSON.stringify(Object.keys(summary).sort()) !== JSON.stringify(expectedKeys)) throw new Error('Nur-Lese-Guard-Summary enthaelt unerlaubte oder fehlende Felder.');
  if (summary.mode !== 'businesscentral-network-read-only-fail-closed') throw new Error('Nur-Lese-Guard-Summary hat einen ungueltigen Modus.');
  if (summary.targetBoundaryVerified !== true) throw new Error('Nur-Lese-Guard-Summary hat keine gueltige Zielbindung.');
  if (summary.installation?.httpRoute !== true || summary.installation?.webSocketRoute !== true || summary.installation?.serviceWorkers !== 'block') {
    throw new Error('Nur-Lese-Guard-Summary weist die vollstaendige HTTP-/WebSocket-/Service-Worker-Installation nicht nach.');
  }
  if (JSON.stringify(Object.keys(summary.installation).sort()) !== JSON.stringify(['httpRoute', 'serviceWorkers', 'webSocketRoute'])) throw new Error('Nur-Lese-Guard-Summary enthaelt eine ungueltige Installationsprojektion.');
  const persistedBinding = validatePersistedTargetBinding(summary.targetBinding, 'Nur-Lese-Guard targetBinding');
  if (expectedBinding && JSON.stringify(persistedBinding) !== JSON.stringify(normalize(expectedBinding))) throw new Error('Nur-Lese-Guard-Summary ist nicht an die Manifest-Zielbindung gebunden.');
  for (const field of ['observedBusinessCentralRequests', 'allowedRequests', 'blockedMutationAttempts']) {
    if (!Number.isInteger(summary[field]) || summary[field] < 0) throw new Error('Nur-Lese-Guard-Summary enthaelt ungueltige Zaehler.');
  }
  if (!Array.isArray(summary.observedRequestClasses) || !Array.isArray(summary.allowedRequestClasses) || !Array.isArray(summary.blockedRequests)) {
    throw new Error('Nur-Lese-Guard-Summary enthaelt keine strukturierten Requestklassen.');
  }
  if (JSON.stringify([...summary.allowedRequestClasses].sort()) !== JSON.stringify(allowedRequestClassList)) throw new Error('Nur-Lese-Guard-Summary hat den festen Nur-Lese-Klassenvertrag veraendert.');
  if (!summary.observedRequestClasses.every((item) => typeof item === 'string') || new Set(summary.observedRequestClasses).size !== summary.observedRequestClasses.length) throw new Error('Nur-Lese-Guard-Summary enthaelt ungueltige oder doppelte beobachtete Requestklassen.');
  for (const request of summary.blockedRequests) {
    if (!request || typeof request !== 'object' || typeof request.reason !== 'string' || typeof request.url !== 'string') throw new Error('Nur-Lese-Guard-Summary enthaelt ungueltige blockierte Requests.');
    if (JSON.stringify(Object.keys(request).sort()) !== JSON.stringify(['method', 'reason', 'resourceType', 'url'])) throw new Error('Nur-Lese-Guard-Summary enthaelt unerlaubte Requestfelder.');
    if (/UABC-BC-TARGET-[A-Z0-9-]+|hmac-sha256:[0-9a-f]{64}|sha256:[0-9a-f]{64}|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i.test(JSON.stringify(request))) {
      throw new Error('Nur-Lese-Guard-Summary enthaelt nicht redigierte Ziel- oder Fingerprintdaten.');
    }
  }
  if (summary.blockedMutationAttempts !== summary.blockedRequests.length || summary.observedBusinessCentralRequests !== summary.allowedRequests + summary.blockedRequests.length) {
    throw new Error('Nur-Lese-Guard-Summary enthaelt inkonsistente oder manipulierte Zaehler.');
  }
  return normalize(summary);
}

async function clipForLabels(surface, labels) {
  return surface.evaluate((wanted) => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    const candidates = Array.from(document.querySelectorAll('label,span,div')).filter((element) => {
      if (!visible(element) || element.childElementCount > 4) return false;
      const text = (element.textContent ?? '').trim();
      return wanted.some((label) => text === label || text.startsWith(`${label}:`));
    });
    const label = candidates[0];
    if (!label) return null;
    let container = label;
    for (let depth = 0; depth < 4 && container.parentElement; depth += 1) {
      const parent = container.parentElement;
      const rect = parent.getBoundingClientRect();
      if (rect.width <= 900 && rect.height <= 300) container = parent;
      else break;
    }
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, rect.x - 20);
    const y = Math.max(0, rect.y - 20);
    return { x, y, width: Math.min(innerWidth - x, rect.width + 40), height: Math.min(innerHeight - y, rect.height + 40) };
  }, labels);
}

export async function takeEvidenceScreenshot(page, outputPath, options = {}) {
  const surface = options.surface ?? page;
  const mask = [
    page.locator('button[aria-label*="Account manager"], button[aria-label*="Konto-Manager"], button[aria-label*="Kontomanager"], a[href^="mailto:"]'),
    surface.locator('button[aria-label*="Account manager"], button[aria-label*="Konto-Manager"], button[aria-label*="Kontomanager"], a[href^="mailto:"]')
  ];
  const clip = options.labels?.length ? await clipForLabels(surface, options.labels) : options.clip;
  await page.screenshot({ path: outputPath, fullPage: false, clip: clip ?? undefined, mask, maskColor: '#000000' });
}

export async function readLabeledValues(page, labels) {
  const result = await page.evaluate((wanted) => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    const output = {};
    const elements = Array.from(document.querySelectorAll('label,span,div')).slice(0, 5000);
    for (const label of wanted) {
      const element = elements.find((candidate) => visible(candidate) && candidate.childElementCount <= 4 && (candidate.textContent ?? '').trim().replace(/:$/, '') === label);
      if (!element) continue;
      let container = element.parentElement;
      for (let depth = 0; depth < 3 && container; depth += 1, container = container.parentElement) {
        const input = container.querySelector('input,textarea,[role="textbox"],[role="combobox"]');
        const value = input?.value ?? input?.getAttribute('value') ?? input?.getAttribute('aria-label');
        if (value && value !== label) { output[label] = value; break; }
        const text = (container.textContent ?? '').split('\n').map((part) => part.trim()).filter(Boolean).filter((part) => part !== label);
        if (text.length) { output[label] = text.slice(0, 3).join(' | '); break; }
      }
    }
    return output;
  }, labels);
  return Object.fromEntries(Object.entries(result).map(([key, value]) => [key, sanitizeText(value)]));
}

export async function readVisibleSurface(page, headings) {
  const surface = await page.evaluate((wanted) => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    const containers = Array.from(document.querySelectorAll('[role="dialog"],[role="region"],aside,.ms-nav-layout-content')).filter(visible);
    const selected = containers.find((element) => wanted.some((heading) => (element.textContent ?? '').includes(heading)));
    if (!selected) return null;
    return (selected.innerText ?? selected.textContent ?? '').split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 200);
  }, headings);
  return surface?.map(sanitizeText) ?? null;
}

export async function readCompanyTree(page) {
  const pane = page.getByRole('dialog', { name: /Available Companies|Verfügbare (Mandanten|Unternehmen)/i });
  if (await pane.count() !== 1) return null;
  const itemLocators = pane.getByRole('treeitem');
  const items = [];
  for (let index = 0; index < await itemLocators.count(); index += 1) {
    const item = itemLocators.nth(index);
    if (!await item.isVisible()) continue;
    const structure = await item.evaluate((element) => {
      const explicitLevel = Number(element.getAttribute('aria-level') ?? 0);
      const level = explicitLevel || (element.parentElement?.closest('[role="group"]') ? 2 : 1);
      const clone = element.cloneNode(true);
      clone.querySelectorAll('[role="group"],button').forEach((child) => child.remove());
      return { level, name: (clone.textContent ?? '').replace(/\s+/g, ' ').trim() };
    });
    items.push({
      level: structure.level,
      name: (await item.getAttribute('aria-label') ?? structure.name).replace(/\s+/g, ' ').trim()
    });
  }
  const tree = [];
  let currentEnvironment = null;
  for (const item of items) {
    if (item.level === 1) {
      currentEnvironment = { name: item.name, companies: [] };
      tree.push(currentEnvironment);
    } else if (item.level === 2 && currentEnvironment) {
      currentEnvironment.companies.push({ name: item.name });
    }
  }
  return tree.map((environment) => ({
    name: sanitizeText(environment.name),
    companies: environment.companies.map((company) => ({ name: sanitizeText(company.name) }))
  }));
}

export async function readVisibleExtensionCards(page) {
  const cards = await page.evaluate(() => {
    const visibleIntersection = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none') return false;
      const rect = element.getBoundingClientRect();
      let left = Math.max(0, rect.left);
      let top = Math.max(0, rect.top);
      let right = Math.min(innerWidth, rect.right);
      let bottom = Math.min(innerHeight, rect.bottom);
      for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
        const ancestorStyle = getComputedStyle(ancestor);
        if (/(auto|scroll|hidden|clip)/.test(`${ancestorStyle.overflow} ${ancestorStyle.overflowX} ${ancestorStyle.overflowY}`)) {
          const ancestorRect = ancestor.getBoundingClientRect();
          left = Math.max(left, ancestorRect.left);
          top = Math.max(top, ancestorRect.top);
          right = Math.min(right, ancestorRect.right);
          bottom = Math.min(bottom, ancestorRect.bottom);
        }
      }
      return right > left && bottom > top;
    };
    const heading = Array.from(document.querySelectorAll('h1,h2,[role="heading"]')).filter(visibleIntersection)
      .find((element) => /Installierte Erweiterungen|Installed Extensions|Erweiterungsverwaltung/i.test(element.textContent ?? ''));
    const root = heading?.closest('form') ?? heading?.closest('main') ?? document;
    return Array.from(root.querySelectorAll('[role="gridcell"]')).map((card) => {
      const nameElement = card.querySelector('[aria-label^="Name:"]');
      const publisherElement = card.querySelector('[aria-label^="Herausgeber:"],[aria-label^="Publisher:"]');
      if (!visibleIntersection(nameElement) || !visibleIntersection(publisherElement)) return null;
      return {
        name: (nameElement?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        publisher: (publisherElement?.textContent ?? '').replace(/\s+/g, ' ').trim() || null
      };
    }).filter((item) => item?.name && item?.publisher);
  });
  const unique = new Map();
  for (const card of cards) unique.set(card.name, { name: sanitizeText(card.name), publisher: sanitizeText(card.publisher) });
  return [...unique.values()].sort((left, right) => left.name.localeCompare(right.name));
}

export async function readVisibleRows(page, limit = 200, headings = []) {
  const rows = await page.evaluate(({ maxRows, wantedHeadings }) => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.bottom > 0 && rect.left < innerWidth && rect.top < innerHeight && style.visibility !== 'hidden' && style.display !== 'none';
    };
    const heading = Array.from(document.querySelectorAll('h1,h2,[role="heading"]')).filter(visible).filter((element) => wantedHeadings.some((wanted) => (element.textContent ?? '').includes(wanted))).at(-1);
    const root = heading?.closest('form') ?? heading?.closest('main') ?? document;
    return Array.from(root.querySelectorAll('[role="row"],tr'))
      .map((row) => (row.innerText ?? row.textContent ?? '').split('\n').map((part) => part.trim()).filter(Boolean).join(' | '))
      .filter(Boolean)
      .slice(0, maxRows);
  }, { maxRows: limit, wantedHeadings: headings });
  return [...new Set(rows.map(sanitizeText))].sort();
}

export class EvidenceRun {
  constructor(runId, options = {}) {
    this.runId = validateEvidenceRunId(runId);
    this.durable = options.durable === true;
    this.targetBinding = options.targetBinding ?? null;
    this.outputDir = this.durable ? path.join(evidenceRoot, runId) : path.resolve('.tmp/playwright-evidence', runId);
    this.events = [];
    this.executionContext = {
      workDate: { status: 'unknown', value: null, scope: 'user-run-context', evidenceStep: 'ENV-03', reason: 'Noch nicht gelesen.' },
      timeZone: { status: 'unknown', value: null, scope: 'user-run-context', evidenceStep: 'ENV-03', reason: 'Noch nicht gelesen.' }
    };
    this.facts = {
      environment: { status: 'unknown', value: null },
      activeCompany: { status: 'unknown', value: null },
      accessibleCompanies: { status: 'unknown', value: [] },
      universaarlTargetCompanies: { status: 'unknown', value: [] },
      version: { status: 'unknown', value: null },
      build: { status: 'unknown', value: null },
      language: { status: 'unknown', value: null },
      region: { status: 'unknown', value: null },
      localization: { status: 'unknown', value: null },
      experience: { status: 'unknown', value: null },
      extensions: { status: 'unknown', value: [] },
      featureManagement: { status: 'unknown', value: [] }
    };
    fs.mkdirSync(this.outputDir, { recursive: true });
  }

  setFact(name, status, value, evidenceStep, reason = null) {
    this.facts[name] = { status, value, evidenceStep, reason };
  }

  setExecutionContext(name, status, value, evidenceStep, reason = null) {
    this.executionContext[name] = { status, value, scope: 'user-run-context', evidenceStep, reason };
  }

  async step(page, stepId, state, options = {}) {
    const screenshot = `${stepId.toLowerCase()}.png`;
    await takeEvidenceScreenshot(page, path.join(this.outputDir, screenshot), options);
    const currentUrl = options.surface?.url() ?? page.url();
    const client = guardedClientState(currentUrl, options.expectedCompany, options.targetBinding ?? this.targetBinding);
    this.events.push({ runId: this.runId, stepId, at: new Date().toISOString(), url: client.redactedUrl, title: sanitizeText(await page.title()), state, screenshot });
    return screenshot;
  }

  finish(meta = {}) {
    if (Object.hasOwn(meta, 'writesPerformed')) throw new Error('writesPerformed darf nicht frei geliefert werden; der Wert wird ausschliesslich aus dem validierten Nur-Lese-Guard abgeleitet.');
    const allowedMeta = new Set(['readOnlyGuard', 'targetBinding', 'playwrightVersion', 'rawTrace', 'rawVideo', 'companySwitchPerformed']);
    const unknownMeta = Object.keys(meta).filter((key) => !allowedMeta.has(key));
    if (unknownMeta.length) throw new Error('Manifestabschluss lehnt nicht freigegebene Metadatenfelder ab.');
    const { readOnlyGuard = null, targetBinding = this.targetBinding, ...rest } = meta;
    const validatedGuard = installedGuardSummary(readOnlyGuard, targetBinding);
    const persistedBinding = publicTargetBinding(targetBinding);
    const targetState = bindingState(targetBinding);
    const normalizedFacts = normalize(sanitizeEvidenceValue(this.facts, targetState));
    const safeRest = sanitizeEvidenceValue(rest, targetState);
    const manifestWritesPerformed = validatedGuard.blockedMutationAttempts > 0;
    const safeEvents = sanitizeEvidenceValue(this.events, targetState);
    fs.writeFileSync(path.join(this.outputDir, 'manifest.json'), `${JSON.stringify({ schemaVersion: evidenceSchemaVersion, runId: this.runId, testId: 'UABC-SCN-ENV-001..007', generatedAt: new Date().toISOString(), ...safeRest, targetBinding: persistedBinding, readOnlyGuard: validatedGuard, writesPerformed: manifestWritesPerformed, executionContext: normalize(sanitizeEvidenceValue(this.executionContext, targetState)), facts: normalizedFacts, steps: safeEvents.map(({ at, ...event }) => event) }, null, 2)}\n`);
    fs.writeFileSync(path.join(this.outputDir, 'events.jsonl'), `${safeEvents.map((event) => JSON.stringify(event)).join('\n')}\n`);
  }
}

function sanitizeEvidenceValue(value, targetState) {
  if (Array.isArray(value)) return value.map((item) => sanitizeEvidenceValue(item, targetState));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeEvidenceValue(item, targetState)]));
  if (typeof value !== 'string') return value;
  let safe = sanitizeText(value);
  for (const [secret, replacement] of [
    [targetState?.targetId, persistedTargetId],
    [targetState?.boundary?.tenantSegment, persistedTenant],
    [targetState?.fingerprint, '[redacted-fingerprint]']
  ]) {
    if (secret) safe = safe.split(secret).join(replacement);
  }
  return safe;
}

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, normalize(item)]));
  return value;
}

function validateLegacyManifest(manifest, label, source) {
  const contract = legacyManifestContracts.get(manifest.runId);
  if (!contract || manifest.schemaVersion !== 1 || !source?.path || !Buffer.isBuffer(source?.bytes)) {
    throw new Error(`${label}: legacy-absent ist nur fuer die zwei fest gebundenen historischen Manifestdateien erlaubt.`);
  }
  const actualPath = path.resolve(source.path);
  const actualHash = crypto.createHash('sha256').update(source.bytes).digest('hex');
  if (actualPath !== contract.path || actualHash !== contract.sha256) {
    throw new Error(`${label}: historisches Legacy-Manifest weicht in Pfad oder SHA-256 von den freigegebenen Originalbytes ab.`);
  }
  if (manifest.readOnlyGuard !== undefined || manifest.targetBinding !== undefined) {
    throw new Error(`${label}: historisches Schema 1 darf Guard und Zielbindung nicht nachtraeglich vortaeuschen.`);
  }
}

export function manifestSafetyProjection(manifest, label = 'Manifest', source = null) {
  if (typeof manifest.writesPerformed !== 'boolean') throw new Error(`${label}: writesPerformed muss boolean sein.`);
  if (manifest.writesPerformed !== false) throw new Error(`${label}: writesPerformed muss fuer die read-only Baseline exakt false sein.`);
  if (manifest.schemaVersion === 1) {
    validateLegacyManifest(manifest, label, source);
    return { writesPerformed: false, readOnlyGuard: { status: 'legacy-absent' }, targetBinding: { status: 'legacy-absent' } };
  }
  if (manifest.schemaVersion !== evidenceSchemaVersion) throw new Error(`${label}: neue EvidenceRun-Manifeste muessen Schema ${evidenceSchemaVersion} verwenden.`);
  if (manifest.readOnlyGuard === undefined || manifest.targetBinding === undefined) throw new Error(`${label}: Schema ${evidenceSchemaVersion} erfordert Guard und Zielbindung.`);
  const allowedManifestKeys = new Set(['companySwitchPerformed', 'executionContext', 'facts', 'generatedAt', 'playwrightVersion', 'rawTrace', 'rawVideo', 'readOnlyGuard', 'runId', 'schemaVersion', 'steps', 'targetBinding', 'testId', 'writesPerformed']);
  if (Object.keys(manifest).some((key) => !allowedManifestKeys.has(key))) throw new Error(`${label}: Schema ${evidenceSchemaVersion} enthaelt unerlaubte Manifestfelder.`);
  for (const required of ['executionContext', 'facts', 'generatedAt', 'runId', 'steps', 'testId']) {
    if (!Object.hasOwn(manifest, required)) throw new Error(`${label}: Schema ${evidenceSchemaVersion} fehlt das Pflichtfeld ${required}.`);
  }
  if (source?.path) {
    const sourcePath = path.resolve(source.path);
    const expectedRun = [...legacyManifestContracts.entries()].find(([, contract]) => contract.path === sourcePath)?.[0];
    if (expectedRun && manifest.runId !== expectedRun) throw new Error(`${label}: runId stimmt nicht mit dem gebundenen Manifestpfad ueberein.`);
  }
  const serializedManifest = JSON.stringify(manifest);
  if (/UABC-BC-TARGET-[A-Z0-9-]+|hmac-sha256:[0-9a-f]{64}|sha256:[0-9a-f]{64}|(?:hex|base64|base64url):[A-Za-z0-9+/_=-]{32,}|\btenant-[a-z0-9-]{16,}\b|https:\/\/businesscentral\.dynamics\.com\/(?!\[tenant\]\/playthru)/i.test(serializedManifest)) {
    throw new Error(`${label}: Schema ${evidenceSchemaVersion} enthaelt nicht redigierte Ziel-, URL-, Tenant- oder Fingerprintdaten.`);
  }
  const targetBinding = validatePersistedTargetBinding(manifest.targetBinding, `${label}: targetBinding`);
  const readOnlyGuard = validateReadOnlyGuardSummary(manifest.readOnlyGuard, targetBinding);
  if (readOnlyGuard.blockedMutationAttempts !== 0) throw new Error(`${label}: blockierte oder unklare Requests sind Mutationsindikatoren.`);
  if (!readOnlyGuard.observedRequestClasses.every((item) => allowedRequestClassList.includes(item))) throw new Error(`${label}: beobachtete Requestklassen verlassen den festen Nur-Lese-Vertrag.`);
  return { writesPerformed: manifest.writesPerformed, readOnlyGuard, targetBinding };
}

export function compareRunManifests() {
  const leftPath = path.join(evidenceRoot, 'run-1/manifest.json');
  const rightPath = path.join(evidenceRoot, 'run-2/manifest.json');
  const leftBytes = fs.readFileSync(leftPath);
  const rightBytes = fs.readFileSync(rightPath);
  const left = JSON.parse(leftBytes.toString('utf8'));
  const right = JSON.parse(rightBytes.toString('utf8'));
  const leftFacts = normalize({ executionContext: left.executionContext, facts: left.facts, safety: manifestSafetyProjection(left, 'run-1', { path: leftPath, bytes: leftBytes }) });
  const rightFacts = normalize({ executionContext: right.executionContext, facts: right.facts, safety: manifestSafetyProjection(right, 'run-2', { path: rightPath, bytes: rightBytes }) });
  const equal = JSON.stringify(leftFacts) === JSON.stringify(rightFacts);
  const keys = [...new Set([...Object.keys(leftFacts), ...Object.keys(rightFacts)])].sort();
  const differences = keys.filter((key) => JSON.stringify(leftFacts[key]) !== JSON.stringify(rightFacts[key])).map((key) => ({ fact: key, run1: leftFacts[key], run2: rightFacts[key] }));
  const comparison = { schemaVersion: 1, verificationId: 'UABC-VER-ENV-COMPARE-001', runIds: ['run-1', 'run-2'], stableFactsEqual: equal, allowedDifferences: ['runId', 'generatedAt', 'event timestamps'], differences };
  fs.writeFileSync(path.join(evidenceRoot, 'comparison.json'), `${JSON.stringify(comparison, null, 2)}\n`);
  if (!equal) throw new Error(`Stabile Baseline-Fakten unterscheiden sich: ${differences.map((item) => item.fact).join(', ')}`);
  return comparison;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url) && process.argv[2] === 'compare') {
  console.log(JSON.stringify(compareRunManifests(), null, 2));
}
