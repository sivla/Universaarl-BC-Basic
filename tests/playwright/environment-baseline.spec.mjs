import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import {
  computeTargetFingerprint,
  createReadOnlyNetworkGuard,
  EvidenceRun,
  guardedClientState,
  installReadOnlyNetworkGuard,
  readCompanyTree,
  readVisibleExtensionCards,
  readVisibleRows,
  readVisibleSurface,
  sanitizeText,
  sanitizeUrl,
  validateBaseUrl,
  verifyTargetBinding
} from './helpers/bc-evidence.mjs';

test.use({ serviceWorkers: 'block' });

const authFile = path.resolve('playwright/.auth/playthru.json');
const baseUrl = process.env.BC_BASE_URL;
const requestedRunId = process.env.UABC_RUN_ID;
const runId = requestedRunId ?? 'local-check';
const evidenceMode = ['run-1', 'run-2'].includes(runId);
const localCheck = process.env.UABC_LOCAL_CHECK === '1';
const interactiveAuth = process.env.UABC_INTERACTIVE_AUTH === '1';
const authOnly = process.env.UABC_AUTH_ONLY === '1';
const require = createRequire(import.meta.url);
const playwrightVersion = require('@playwright/test/package.json').version;
const syntheticBcOrigin = `https://businesscentral.${'dynamics.com'}`;
const syntheticTenant = 'tenant-7f3b9c2d8e4a6f1c0b5d9a8e7c6b4a2f';
const syntheticTargetId = 'UABC-BC-TARGET-PLAYTHRU';
const syntheticHmacSecret = `hex:${crypto.createHash('sha256').update('UABC-Offline-Testschluessel').digest('hex')}`;
const syntheticTargetUrl = (tenant = syntheticTenant) => `${syntheticBcOrigin}/${tenant}/playthru`;
const targetIdEnvKey = 'BC_TARGET_ID';
const fingerprintEnvKey = 'BC_TARGET_FINGERPRINT';
const hmacEnvKey = 'BC_TARGET_HMAC_' + 'SECRET';

function syntheticBinding(overrides = {}) {
  const url = syntheticTargetUrl(overrides.tenant ?? syntheticTenant);
  const expected = computeTargetFingerprint(url, { hmacSecret: syntheticHmacSecret });
  return verifyTargetBinding(url, {
    [targetIdEnvKey]: overrides.targetId ?? syntheticTargetId,
    [fingerprintEnvKey]: expected,
    [hmacEnvKey]: syntheticHmacSecret
  });
}

function fakeGuardContext(overrides = {}) {
  const handlers = {};
  const calls = [];
  const selected = (key, fallback) => Object.hasOwn(overrides, key) ? overrides[key] : fallback;
  const context = {
    serviceWorkers: selected('serviceWorkers', () => []),
    route: selected('route', async (pattern, handler) => { calls.push(`http:${pattern}`); handlers.http = handler; }),
    routeWebSocket: selected('routeWebSocket', async (pattern, handler) => { calls.push(`ws:${pattern}`); handlers.webSocket = handler; })
  };
  return { context, handlers, calls };
}

async function installedSyntheticGuard(targetBinding = syntheticBinding()) {
  const fake = fakeGuardContext();
  const guard = await installReadOnlyNetworkGuard(fake.context, targetBinding);
  return { ...fake, guard, targetBinding };
}

async function visibleLocator(locator) {
  const count = await locator.count();
  const visible = [];
  for (let index = 0; index < count; index += 1) {
    const candidate = locator.nth(index);
    if (await candidate.isVisible()) visible.push(candidate);
  }
  return visible;
}

async function closeKnownSurface(surface) {
  const cancelControls = await visibleLocator(surface.getByRole('button', { name: /^(Cancel|Abbrechen)$/i }));
  if (cancelControls.length === 1) {
    await cancelControls[0].click();
    return;
  }
  const controls = await visibleLocator(surface.getByRole('button', { name: /^(Close|Schließen)$/i }));
  if (controls.length !== 1) throw new Error(`Sichtbares Overlay oder Seitenpaneel konnte nicht eindeutig geschlossen werden; Kandidaten=${controls.length}`);
  await controls[0].click();
}

async function press(surface, key) {
  await surface.locator('body').press(key);
}

async function waitForBusinessCentralUi(page) {
  let readyFrameUrl = null;
  await expect.poll(async () => {
    for (const frame of [...page.frames()].reverse()) {
      if (frame === page.mainFrame() || !frame.url().includes('businesscentral.dynamics.com')) continue;
      try {
        const interactiveCount = await frame.locator('button,input,[role="button"],[role="textbox"]').count();
        const loadingCount = await frame.getByText('Getting ready...', { exact: true }).count();
        const loadingVisible = loadingCount ? await frame.getByText('Getting ready...', { exact: true }).first().isVisible() : false;
        if (interactiveCount > 5 && !loadingVisible) {
          readyFrameUrl = frame.url();
          return readyFrameUrl;
        }
      } catch { /* Frame laedt noch. */ }
    }
    return null;
  }, { timeout: 90_000, intervals: [500, 1000, 2000] }).not.toBeNull();
  const frame = page.frames().find((candidate) => candidate.url() === readyFrameUrl);
  if (!frame) throw new Error('Der interaktive Business-Central-Frame ist nach der Bereitschaftspruefung verschwunden.');
  return frame;
}

async function tellMeNavigate(surface, captions, targetPattern = null) {
  await press(surface, 'Alt+q');
  const input = surface.getByRole('dialog', { name: /^(Tell me|Wie möchten Sie weiter verfahren\?)$/i }).last().getByRole('textbox').last();
  await expect(input).toBeVisible();
  for (const caption of captions) {
    await input.fill(caption);
    await surface.waitForTimeout(750);
    const visibleCandidates = await visibleLocator(surface.locator('a,button,[role="option"],[role="menuitem"],[role="row"]'));
    const pageCandidates = [];
    for (const candidate of visibleCandidates) {
      const text = (await candidate.innerText()).replace(/\s+/g, ' ').trim();
      if (!/^(Nach|Search for)\b/i.test(text) && !/(durchsuchen|search)$/i.test(text) && (!targetPattern || targetPattern.test(text))) pageCandidates.push(candidate);
    }
    if (pageCandidates.length === 1) {
      await pageCandidates[0].click();
      await expect(input).toBeHidden({ timeout: 15_000 });
      return caption;
    }
  }
  throw new Error(`Tell-Me-Ziel nach lokalisierten Suchbegriffen nicht gefunden: ${captions.join(' / ')}`);
}

async function openHelpAndSupport(page, surface) {
  const helpButton = page.getByRole('button', { name: /^(Help|Hilfe)$/i });
  await expect(helpButton).toHaveCount(1);
  await helpButton.click();
  const target = surface.getByText(/^(Help & Support|Hilfe & Support|Hilfe und Support)$/i, { exact: true });
  await expect(target).toBeVisible();
  await target.click();
}

async function openCompanyInformation(page) {
  const settingsButton = page.getByRole('button', { name: /^(Settings|Einstellungen)$/i });
  await expect(settingsButton).toHaveCount(1);
  await settingsButton.click();
  const target = page.getByRole('link', { name: /^(Company Information|Unternehmensinformationen|Unternehmensdaten)$/i });
  await expect(target).toHaveCount(1);
  await expect(target).toBeVisible();
  await target.click();
}

function valueAfterLabel(text, labels) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  for (const label of labels) {
    const index = lines.findIndex((line) => line.replace(/:$/, '') === label);
    if (index >= 0 && lines[index + 1]) return sanitizeText(lines[index + 1]);
  }
  return null;
}

function normalizeGermanDate(value) {
  const match = value?.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}

async function controlValue(surface, controlName) {
  const control = surface.locator(`[controlname="${controlName}"] input, [controlname="${controlName}"] [role="textbox"]`).last();
  if (await control.count() !== 1) return null;
  const tagName = await control.evaluate((element) => element.tagName);
  const value = tagName === 'INPUT' ? await control.inputValue() : await control.textContent() ?? await control.getAttribute('title');
  return sanitizeText(value);
}

test('Offline: Zielbindung akzeptiert nur den erwarteten lokalen Fingerprint', async () => {
  const expected = computeTargetFingerprint(syntheticTargetUrl(), { hmacSecret: syntheticHmacSecret });
  const binding = syntheticBinding();
  expect(binding).toMatchObject({ targetId: '[redacted-target-id]', verified: true, protocol: 'https:', host: 'businesscentral.dynamics.com', port: 443, environment: 'playthru', tenant: '[redacted-tenant]', basePath: '/[redacted-tenant]/playthru' });
  expect(JSON.stringify(binding)).not.toContain(syntheticTargetId);
  expect(JSON.stringify(binding)).not.toContain(syntheticTenant);
  expect(JSON.stringify(binding)).not.toContain(expected);
});

test('Offline: Zielbindung scheitert fehlersicher und ohne URL- oder Geheimnis-Leak', async () => {
  const url = syntheticTargetUrl();
  const expected = computeTargetFingerprint(url, { hmacSecret: syntheticHmacSecret });
  const wrongFingerprint = `${expected.slice(0, -1)}${expected.endsWith('0') ? '1' : '0'}`;
  for (const env of [
    {},
    { [targetIdEnvKey]: syntheticTargetId, [fingerprintEnvKey]: wrongFingerprint, [hmacEnvKey]: syntheticHmacSecret },
    { [targetIdEnvKey]: syntheticTargetId, [fingerprintEnvKey]: expected },
    { [targetIdEnvKey]: syntheticTargetUrl(), [fingerprintEnvKey]: expected, [hmacEnvKey]: syntheticHmacSecret },
    { [targetIdEnvKey]: '550e8400-e29b-41d4-a716-446655440000', [fingerprintEnvKey]: expected, [hmacEnvKey]: syntheticHmacSecret },
    { [targetIdEnvKey]: 'UABC-BC-TARGET-SECRET-TOKEN', [fingerprintEnvKey]: expected, [hmacEnvKey]: syntheticHmacSecret },
    { [targetIdEnvKey]: 'UABC-BC-TARGET-AB12CD34EF56GH78IJ90KL', [fingerprintEnvKey]: expected, [hmacEnvKey]: syntheticHmacSecret },
    { [targetIdEnvKey]: `UABC-BC-TARGET-${'ABCD'.repeat(8)}`, [fingerprintEnvKey]: expected, [hmacEnvKey]: syntheticHmacSecret },
    { [targetIdEnvKey]: syntheticTargetId, [fingerprintEnvKey]: expected, [hmacEnvKey]: 'x' }
  ]) {
    let message = '';
    try {
      verifyTargetBinding(url, env);
    } catch (error) {
      message = String(error.message);
    }
    expect(message).toMatch(/BC-Zielbindung|BC-Ziel-ID|HMAC/);
    expect(message).not.toContain(syntheticTenant);
    expect(message).not.toContain(expected);
    expect(message).not.toContain(syntheticHmacSecret);
    expect(message).not.toContain(syntheticBcOrigin);
    expect(message).not.toContain(syntheticTargetId);
  }
});

test('Offline: HMAC-Schluessel werden dekodiert und schwache Wiederholungsmuster verworfen', async () => {
  const equalBytes = `hex:${'aa'.repeat(32)}`;
  const repeatedHalf = `hex:${Buffer.from('0123456789abcdef'.repeat(2), 'utf8').toString('hex')}`;
  for (const hmacSecret of ['x', 'hex:0011', equalBytes, repeatedHalf]) {
    expect(() => computeTargetFingerprint(syntheticTargetUrl(), { hmacSecret })).toThrow(/HMAC/);
  }
  expect(computeTargetFingerprint(syntheticTargetUrl(), { hmacSecret: syntheticHmacSecret })).toMatch(/^hmac-sha256:[0-9a-f]{64}$/);
});

test('Offline: niedrig-entropische Zielsegmente verlangen ein lokales HMAC-Geheimnis', async () => {
  expect(() => computeTargetFingerprint(syntheticTargetUrl('demo'))).toThrow(/HMAC-Geheimnis/);
});

test('Offline: Ziel-Tuple lehnt Protokoll-, Port-, Pfad- und Queryabweichungen ab', async () => {
  for (const invalidUrl of [
    syntheticTargetUrl().replace('https:', 'http:'),
    syntheticTargetUrl().replace('dynamics.com', 'dynamics.com:444'),
    `${syntheticTargetUrl()}/api`,
    `${syntheticBcOrigin}/${syntheticTenant}/andere-umgebung`,
    `${syntheticTargetUrl()}?token=rohwert`
  ]) expect(() => validateBaseUrl(invalidUrl)).toThrow();
});

test('Offline: EvidenceRun-ID kann keine Ziel- oder Geheimniswerte in Pfade und Manifeste tragen', async () => {
  for (const rawId of [syntheticTargetId, '../ziel', 'tenant-rohwert0123456789', `hex:${'ab'.repeat(32)}`]) {
    let message = '';
    try { new EvidenceRun(rawId, { durable: false }); }
    catch (error) { message = String(error.message); }
    expect(message).toMatch(/EvidenceRun-ID/);
    expect(message).not.toContain(rawId);
  }
});

test('Offline: Nur-Lese-Guard blockiert Mutation und erzeugt nie writesPerformed false', async () => {
  const { guard, targetBinding } = await installedSyntheticGuard();
  expect(guard.inspect({ method: 'POST', url: syntheticTargetUrl(), resourceType: 'xhr' }).action).toBe('block');
  expect(guard.inspect({ method: 'GET', url: syntheticTargetUrl(), resourceType: 'document' }).action).toBe('allow');
  const evidence = new EvidenceRun('offline-guard-mutation', { durable: false, targetBinding });
  try {
    evidence.finish({ readOnlyGuard: guard, targetBinding });
    const manifest = JSON.parse(fs.readFileSync(path.join(evidence.outputDir, 'manifest.json'), 'utf8'));
    expect(manifest.schemaVersion).toBe(2);
    expect(manifest.writesPerformed).toBe(true);
    expect(manifest.readOnlyGuard.blockedMutationAttempts).toBe(1);
  } finally {
    fs.rmSync(evidence.outputDir, { recursive: true, force: true });
  }
});

test('Offline: Nur-Lese-Guard leitet writesPerformed aus reinem Leseverkehr ab', async () => {
  const { guard, targetBinding } = await installedSyntheticGuard();
  expect(guard.inspect({ method: 'GET', url: syntheticTargetUrl(), resourceType: 'document' }).action).toBe('allow');
  const evidence = new EvidenceRun('offline-guard-readonly', { durable: false, targetBinding });
  try {
    evidence.finish({ readOnlyGuard: guard, targetBinding });
    const manifest = JSON.parse(fs.readFileSync(path.join(evidence.outputDir, 'manifest.json'), 'utf8'));
    expect(manifest.writesPerformed).toBe(false);
    expect(manifest.readOnlyGuard.blockedMutationAttempts).toBe(0);
    expect(manifest.readOnlyGuard.installation).toEqual({ httpRoute: true, serviceWorkers: 'block', webSocketRoute: true });
  } finally {
    fs.rmSync(evidence.outputDir, { recursive: true, force: true });
  }
});

test('Offline: Nur-Lese-Guard blockiert nicht freigegebene Ziel- und Requestklassen', async () => {
  const guard = createReadOnlyNetworkGuard(syntheticBinding());
  const cases = [
    { method: 'GET', url: syntheticTargetUrl().replace('https:', 'http:'), resourceType: 'document' },
    { method: 'GET', url: syntheticTargetUrl().replace('dynamics.com', 'dynamics.com:444'), resourceType: 'document' },
    { method: 'GET', url: `${syntheticTargetUrl()}?action=delete`, resourceType: 'document' },
    { method: 'GET', url: syntheticTargetUrl(), resourceType: 'document', body: 'nicht-leer' },
    { method: 'GET', url: syntheticTargetUrl('anderer-tenant-7f3b9c2d8e4a6f1c0b5d9a8e7c6b4a2f'), resourceType: 'document' },
    { method: 'GET', url: `${syntheticBcOrigin}/${syntheticTenant}/other`, resourceType: 'document' },
    { method: 'POST', url: syntheticTargetUrl(), resourceType: 'xhr' },
    { method: 'PATCH', url: syntheticTargetUrl(), resourceType: 'xhr' },
    { method: 'PUT', url: syntheticTargetUrl(), resourceType: 'xhr' },
    { method: 'DELETE', url: syntheticTargetUrl(), resourceType: 'xhr' },
    { method: 'GET', url: `wss://businesscentral.${'dynamics.com'}/${syntheticTenant}/playthru`, resourceType: 'websocket' },
    { method: 'GET', url: syntheticTargetUrl(), resourceType: 'document', serviceWorker: true },
    { method: 'GET', url: `https://example.invalid/${syntheticTenant}/playthru`, resourceType: 'document' },
    { method: 'GET', url: `${syntheticTargetUrl()}/api`, resourceType: 'fetch' },
    { method: 'GET', url: `${syntheticTargetUrl()}?unknown=1`, resourceType: 'document' },
    { method: 'GET', url: syntheticTargetUrl(), resourceType: 'other' }
  ];
  for (const item of cases) {
    expect(guard.inspect(item), JSON.stringify(item)).toMatchObject({ action: 'block' });
  }
  expect(guard.inspect({ method: 'GET', url: `${syntheticTargetUrl()}?page=42`, resourceType: 'document' })).toMatchObject({ action: 'allow' });
});

test('Offline: HTTP- und WebSocket-Handler werden vor Navigation echt im Fake-Kontext installiert und blockieren', async () => {
  const { context, handlers, calls } = fakeGuardContext();
  const guard = await installReadOnlyNetworkGuard(context, syntheticBinding());
  calls.push('goto');
  expect(calls).toEqual(['http:**/*', 'ws:**/*', 'goto']);

  const allowedActions = [];
  await handlers.http({
    request: () => ({ method: () => 'GET', url: () => syntheticTargetUrl(), resourceType: () => 'document', postData: () => null, serviceWorker: () => null }),
    abort: async (reason) => allowedActions.push(`abort:${reason}`),
    continue: async () => allowedActions.push('continue')
  });
  expect(allowedActions).toEqual(['continue']);

  const blockedActions = [];
  await handlers.http({
    request: () => ({ method: () => 'POST', url: () => syntheticTargetUrl(), resourceType: () => 'xhr', postData: () => '{}', serviceWorker: () => null }),
    abort: async (reason) => blockedActions.push(`abort:${reason}`),
    continue: async () => blockedActions.push('continue')
  });
  expect(blockedActions).toEqual(['abort:blockedbyclient']);

  const socketClosures = [];
  await handlers.webSocket({ url: () => `wss://businesscentral.${'dynamics.com'}/${syntheticTenant}/playthru`, close: async (options) => socketClosures.push(options) });
  expect(socketClosures).toEqual([{ code: 1008, reason: 'WebSocket im Nur-Lese-Nachweis blockiert.' }]);
  expect(guard.summary()).toMatchObject({ targetBoundaryVerified: true, blockedMutationAttempts: 2 });
});

test('Offline: fehlende Routing-APIs und vorhandene Service Worker scheitern geschlossen', async () => {
  const binding = syntheticBinding();
  const withoutWebSocket = fakeGuardContext({ routeWebSocket: null }).context;
  const withoutServiceWorkers = fakeGuardContext({ serviceWorkers: null }).context;
  const activeServiceWorker = fakeGuardContext({ serviceWorkers: () => [{}] }).context;
  await expect(installReadOnlyNetworkGuard(withoutWebSocket, binding)).rejects.toThrow(/fehlersicher/);
  await expect(installReadOnlyNetworkGuard(withoutServiceWorkers, binding)).rejects.toThrow(/fehlersicher/);
  await expect(installReadOnlyNetworkGuard(activeServiceWorker, binding)).rejects.toThrow(/aktiven Service Workern/);
});

test('Offline: Manifestabschluss verlangt gebrandeten installierten Guard desselben Ziels', async () => {
  const firstBinding = syntheticBinding();
  const secondBinding = syntheticBinding({ targetId: 'UABC-BC-TARGET-SECONDARY', tenant: 'tenant-4d8e2c7b9a1f6e3d5c8b2a7f9e4d1c6b' });
  const { guard } = await installedSyntheticGuard(firstBinding);
  const uninstalledGuard = createReadOnlyNetworkGuard(firstBinding);
  const manipulatedSummary = guard.summary();
  manipulatedSummary.allowedRequests = 99;
  manipulatedSummary.allowedRequestClasses.push('POST:xhr');
  const evidence = new EvidenceRun('offline-guard-required', { durable: false, targetBinding: firstBinding });
  try {
    expect(() => evidence.finish({})).toThrow(/moduleigene/);
    expect(() => evidence.finish({ readOnlyGuard: {}, targetBinding: firstBinding })).toThrow(/moduleigene/);
    expect(() => evidence.finish({ readOnlyGuard: manipulatedSummary, targetBinding: firstBinding })).toThrow(/moduleigene/);
    expect(() => evidence.finish({ readOnlyGuard: uninstalledGuard, targetBinding: firstBinding })).toThrow(/vollstaendig installierte/);
    expect(() => evidence.finish({ readOnlyGuard: guard, targetBinding: secondBinding })).toThrow(/selben Ziel/);
    expect(() => evidence.finish({ writesPerformed: false, readOnlyGuard: guard, targetBinding: firstBinding })).toThrow(/writesPerformed/);
    const fingerprint = computeTargetFingerprint(syntheticTargetUrl(), { hmacSecret: syntheticHmacSecret });
    evidence.setFact('environment', 'candidate', `${syntheticTargetId} ${syntheticTenant} ${syntheticTargetUrl()}?page=rohwert ${syntheticHmacSecret} ${fingerprint}`, 'OFFLINE');
    evidence.finish({ readOnlyGuard: guard, targetBinding: firstBinding });
    const manifestText = fs.readFileSync(path.join(evidence.outputDir, 'manifest.json'), 'utf8');
    const summaryText = JSON.stringify(guard.summary());
    expect(guard.summary().allowedRequestClasses).not.toContain('POST:xhr');
    for (const forbidden of [syntheticTargetId, syntheticTenant, syntheticTargetUrl(), syntheticHmacSecret, fingerprint]) {
      expect(manifestText).not.toContain(forbidden);
      expect(summaryText).not.toContain(forbidden);
    }
  } finally {
    fs.rmSync(evidence.outputDir, { recursive: true, force: true });
  }
});

test('Offline: URL-Redaktion gibt niemals Querywerte oder Tenantpfade aus', async () => {
  const pageValue = 'geheimer-seitenwert';
  const tokenValue = 'geheimer-tokenwert';
  const pageOnly = sanitizeUrl(`${syntheticTargetUrl()}?page=${pageValue}`);
  const mixed = sanitizeUrl(`${syntheticTargetUrl()}?page=${pageValue}&token=${tokenValue}`);
  expect(pageOnly).toContain('?page=[redacted]');
  expect(mixed).toContain('?[redacted-query]');
  for (const output of [pageOnly, mixed]) {
    expect(output).not.toContain(syntheticTenant);
    expect(output).not.toContain(pageValue);
    expect(output).not.toContain(tokenValue);
  }
});

test('erfasst die playthru-Umgebungsbaseline im Nur-Lese-Modus', async ({ page, context }, testInfo) => {
  if (!baseUrl) throw new Error('BC_BASE_URL ist erforderlich; ein Nachweislauf ohne explizites Ziel muss fehlschlagen.');
  validateBaseUrl(baseUrl);
  const targetBinding = verifyTargetBinding(baseUrl);
  const readOnlyGuard = await installReadOnlyNetworkGuard(context, targetBinding);
  if (!authOnly && !evidenceMode && !localCheck) throw new Error('Nachweislaeufe benoetigen explizit UABC_RUN_ID=run-1 oder run-2; UABC_LOCAL_CHECK=1 ist nur fuer nicht dauerhafte lokale Checks erlaubt.');
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  if (!page.url().includes('businesscentral.dynamics.com') || !page.url().toLowerCase().includes('/playthru')) {
    if (!interactiveAuth) throw new Error('Authentifizierte playthru-Sitzung ist nicht verfuegbar. Starte lokal den headed Auth-Bootstrap.');
    await page.waitForURL((url) => url.hostname === 'businesscentral.dynamics.com' && url.pathname.toLowerCase().split('/').includes('playthru'), { timeout: 300_000 });
    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    await context.storageState({ path: authFile });
  }

  const ui = await waitForBusinessCentralUi(page);
  const initialClient = guardedClientState(ui.url(), undefined, targetBinding);
  if (!fs.existsSync(authFile)) {
    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    await context.storageState({ path: authFile });
  }
  if (authOnly) return;

    const tracePath = testInfo.outputPath('trace.zip');
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true, title: `${runId}-playthru-baseline` });
  let tracingActive = true;
  const evidence = new EvidenceRun(runId, { durable: evidenceMode, targetBinding });
  let expectedCompany = initialClient.company ?? undefined;

  try {
    evidence.setFact('environment', 'confirmed', 'playthru', 'ENV-00');
    await evidence.step(page, 'ENV-00', 'role-center-client-boundary', { surface: ui, expectedCompany, clip: { x: 0, y: 0, width: 1600, height: 190 } });

    await press(ui, 'Control+o');
    await ui.waitForTimeout(750);
    const companyTree = await readCompanyTree(ui);
    const playthruCompanies = companyTree?.filter((environment) => /^Playthru(?:\s|$)/i.test(environment.name));
    if (playthruCompanies?.length !== 1) throw new Error('Die sichtbare Mandantenstruktur enthaelt keine eindeutig sichtbare playthru-Umgebungsgruppe.');
    const accessibleCompanyNames = playthruCompanies[0].companies.map((company) => company.name).sort();
    evidence.setFact('accessibleCompanies', 'confirmed', { environment: 'playthru', names: accessibleCompanyNames }, 'ENV-01', 'Nur sichtbarer playthru-Zugriffsbaum; kein Mandant wurde ausgewaehlt und andere Umgebungen sind ausgeklammert.');
    const targetCompanies = ['UAM-DE', 'UAS-DE', 'UAD-DE', 'UAP-DE', 'UAC-CONS'].map((bcCompany) => ({
      bcCompany,
      status: 'not-observed-in-accessible-company-pane',
      inference: 'does-not-prove-nonexistence'
    }));
    evidence.setFact('universaarlTargetCompanies', 'confirmed', targetCompanies, 'ENV-01', 'Beobachtung ist auf das zugaengliche playthru-Mandantenpaneel begrenzt und kein Existenztest.');
    await evidence.step(page, 'ENV-01', 'available-companies-pane-open-background-preserved', { surface: ui, expectedCompany, clip: { x: 1240, y: 40, width: 360, height: 280 } });
    await closeKnownSurface(ui);
    guardedClientState(ui.url(), expectedCompany, targetBinding);

    await openHelpAndSupport(page, ui);
    guardedClientState(ui.url(), expectedCompany, targetBinding);
    const supportForm = ui.getByRole('form', { name: /^(Hilfe & Support|Help & Support)$/i });
    await expect(supportForm).toBeVisible();
    const supportText = sanitizeText(await supportForm.innerText());
    const version = supportText.split('\n').map((line) => line.trim()).find((line) => /^Version:/i.test(line)) ?? null;
    const buildMatch = version?.match(/Plattform\s+([\d.]+)\s*\+\s*Anwendung\s+([\d.]+)/i);
    const build = buildMatch ? { platform: buildMatch[1], application: buildMatch[2] } : null;
    evidence.setFact('version', version ? 'confirmed' : 'unknown', version, 'ENV-02', version ? null : 'Kein eindeutig sichtbares Versionslabel.');
    evidence.setFact('build', build ? 'confirmed' : 'unknown', build, 'ENV-02', build ? null : 'Kein eindeutig sichtbares Build-Label.');
    await evidence.step(page, 'ENV-02', 'help-and-support-visible', { surface: ui, expectedCompany, labels: ['Version', 'Application Version', 'Platform Version', 'Build'] });
    await closeKnownSurface(ui);
    const back = ui.getByRole('button', { name: /^(Back|Zurück)$/i });
    await expect(back).toHaveCount(1);
    await back.click();
    await expect(ui.getByRole('heading', { name: /Hilfe und Support|Help and Support/i })).toBeHidden();

    await press(ui, 'Alt+t');
    await ui.waitForTimeout(750);
    const settingsSurface = await readVisibleSurface(ui, ['My Settings', 'Meine Einstellungen']);
    if (!settingsSurface) throw new Error('Meine Einstellungen wurde nicht als verstandener Dialog oder Seitenbereich sichtbar.');
    const settingsDialog = ui.getByRole('dialog', { name: /^(My Settings|Meine Einstellungen).*$/i }).last();
    const settingsText = await settingsDialog.innerText();
    const activeCompany = valueAfterLabel(settingsText, ['Company', 'Unternehmen', 'Mandant']);
    const language = valueAfterLabel(settingsText, ['Language', 'Sprache']);
    const region = valueAfterLabel(settingsText, ['Region']);
    const workDate = normalizeGermanDate(await controlValue(settingsDialog, 'Work Date'));
    const timeZone = await controlValue(settingsDialog, 'Time Zone');
    if (activeCompany) {
      if (expectedCompany && expectedCompany !== activeCompany) throw new Error('Der sichtbar aktive Mandant weicht vom anfaenglichen URL-Mandanten ab.');
      expectedCompany = expectedCompany ?? activeCompany;
    }
    evidence.setFact('activeCompany', activeCompany ? 'confirmed' : 'unknown', activeCompany, 'ENV-03', activeCompany ? null : 'Mandantenwert nicht eindeutig sichtbar.');
    evidence.setFact('language', language ? 'confirmed' : 'unknown', language, 'ENV-03', language ? null : 'Sprachwert nicht eindeutig sichtbar.');
    evidence.setFact('region', region ? 'confirmed' : 'unknown', region, 'ENV-03', region ? null : 'Regionswert nicht eindeutig sichtbar.');
    evidence.setFact('localization', 'unknown', null, 'ENV-03', 'Clientsprache und Region allein beweisen keine installierte Lokalisierung.');
    evidence.setExecutionContext('workDate', workDate ? 'confirmed' : 'unknown', workDate, 'ENV-03', workDate ? 'Sichtbares Benutzerarbeitsdatum; keine Unternehmenseinrichtung.' : 'Arbeitsdatum nicht eindeutig sichtbar.');
    evidence.setExecutionContext('timeZone', timeZone ? 'confirmed' : 'unknown', timeZone, 'ENV-03', timeZone ? 'Sichtbare Benutzerzeitzone; keine Unternehmenseinrichtung.' : 'Zeitzone nicht eindeutig sichtbar.');
    await evidence.step(page, 'ENV-03', 'my-settings-dialog-open', { surface: ui, expectedCompany, clip: { x: 500, y: 270, width: 590, height: 260 } });
    await closeKnownSurface(ui);

    await openCompanyInformation(page);
    guardedClientState(ui.url(), expectedCompany, targetBinding);
    const companyForm = ui.getByRole('form', { name: /^(Firmendaten|Company Information)$/i });
    await expect(companyForm).toBeVisible();
    const companyText = await companyForm.innerText();
    const experience = valueAfterLabel(companyText, ['Experience', 'Erfahrung']);
    const countryControl = companyForm.locator('[controlname="Country/Region Code"] input');
    const country = await countryControl.count() === 1 ? sanitizeText(await countryControl.inputValue()) : null;
    evidence.setFact('experience', experience ? 'confirmed' : 'unknown', experience, 'ENV-04', experience ? null : 'Experience ist nicht eindeutig sichtbar.');
    if (country) evidence.setFact('localization', 'candidate', country, 'ENV-04', 'Country/Region Code ist sichtbar; die tatsaechliche Lokalisierung benoetigt weiterhin explizite Evidence.');
    await evidence.step(page, 'ENV-04', 'company-information-read-only', { surface: ui, expectedCompany, clip: { x: 180, y: 430, width: 640, height: 50 } });
    const companyBack = ui.getByRole('button', { name: /^(Back|Zurück)$/i });
    await expect(companyBack).toHaveCount(1);
    await companyBack.click();
    await expect(ui.getByRole('heading', { name: /^(Firmendaten|Company Information)$/i })).toBeHidden();

    await tellMeNavigate(ui, ['Erweiterung', 'Extension'], /Erweiterungsverwaltung|Extension Management|Microsoft AppSource-Apps Verwaltung/i);
    guardedClientState(ui.url(), expectedCompany, targetBinding);
    const extensions = await readVisibleExtensionCards(ui);
    evidence.setFact('extensions', extensions.length ? 'candidate' : 'unknown', { completeness: 'visible-partial', visibilityBasis: 'name-and-publisher-intersect-screenshot-viewport', items: extensions }, 'ENV-05', extensions.length ? 'Nur kleine Teilmenge im Screenshot-Viewport; Scrollen, gerenderte Karten ausserhalb des Viewports und vollstaendiges Erweiterungsinventar sind ausgeschlossen.' : 'Kein Erweiterungsname-/Herausgeber-Paar schnitt den Screenshot-Viewport oder Berechtigungen reichten nicht aus.');
    await evidence.step(page, 'ENV-05', 'extension-management-read-only', { surface: ui, expectedCompany });

    await tellMeNavigate(ui, ['Funktion', 'Feature'], /Funktionsverwaltung|Feature Management/i);
    guardedClientState(ui.url(), expectedCompany, targetBinding);
    const features = await readVisibleRows(ui, 200, ['Funktionsverwaltung', 'Feature Management']);
    evidence.setFact('featureManagement', features.length ? 'candidate' : 'unknown', { completeness: 'visible-partial', visibilityBasis: 'row-intersects-screenshot-viewport', items: features }, 'ENV-06', features.length ? 'Nur sichtbare Viewport-Zeilen; kein vollstaendiges Feature-Inventar und keine Feature-Aktion ausgefuehrt.' : 'Keine Feature-Zeilen schnitten den Screenshot-Viewport oder Berechtigungen reichten nicht aus.');
    await evidence.step(page, 'ENV-06', 'feature-management-read-only', { surface: ui, expectedCompany });

    await context.tracing.stop({ path: tracePath });
    tracingActive = false;
    if (!fs.existsSync(tracePath)) throw new Error(`Trace-Abschluss hat ${tracePath} nicht erzeugt`);
    const relativeTracePath = path.relative(process.cwd(), tracePath).replaceAll('\\', '/');
    const relativeOutputDir = path.relative(process.cwd(), testInfo.outputDir).replaceAll('\\', '/');
    evidence.finish({
      playwrightVersion,
      targetBinding,
      rawTrace: { path: relativeTracePath, existsAtManifestWrite: true, classification: 'local-gitignored' },
      rawVideo: { outputDirectory: relativeOutputDir, classification: 'local-gitignored', finalizedByPlaywrightAfterTest: true },
      companySwitchPerformed: false,
      readOnlyGuard
    });
    expect(evidence.facts.environment.value).toBe('playthru');
  } finally {
    if (tracingActive) await context.tracing.stop({ path: tracePath }).catch(() => {});
  }
});
