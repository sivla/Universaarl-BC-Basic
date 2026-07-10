import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const evidenceRoot = path.resolve('evidence/playthru-environment-baseline');

export function sanitizeText(value) {
  if (value === null || value === undefined) return value;
  return String(value)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, '[redacted-guid]')
    .replace(/(access_token|id_token|refresh_token|code)=([^&\s]+)/gi, '$1=[redacted]')
    .replace(/[\uE000-\uF8FF]/g, '')
    .trim();
}

export function validateBaseUrl(raw) {
  if (!raw) throw new Error('BC_BASE_URL is required locally and must not be committed.');
  const url = new URL(raw);
  const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  if (url.protocol !== 'https:') throw new Error('BC_BASE_URL must use HTTPS.');
  if (url.hostname !== 'businesscentral.dynamics.com') throw new Error('BC_BASE_URL must target businesscentral.dynamics.com.');
  if (!segments.some((segment) => segment.toLowerCase() === 'playthru')) throw new Error('BC_BASE_URL must contain the environment path segment playthru.');
  if (url.searchParams.has('company')) throw new Error('BC_BASE_URL must not contain a company parameter; no company switch is authorized.');
  return url;
}

export function guardedClientState(rawUrl, expectedCompany = undefined) {
  const url = new URL(rawUrl);
  const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  if (url.hostname !== 'businesscentral.dynamics.com' || !segments.some((segment) => segment.toLowerCase() === 'playthru')) {
    throw new Error(`Navigation left the authorized playthru client boundary: ${sanitizeUrl(rawUrl)}`);
  }
  const company = url.searchParams.get('company');
  if (expectedCompany && company && company !== expectedCompany) throw new Error('Active company changed during the read-only baseline.');
  return { company, redactedUrl: sanitizeUrl(rawUrl) };
}

export function sanitizeUrl(raw) {
  try {
    const url = new URL(raw);
    const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const environmentIndex = segments.findIndex((segment) => segment.toLowerCase() === 'playthru');
    const safePath = environmentIndex >= 0 ? '/[tenant]/playthru' : '/[redacted-path]';
    const page = url.searchParams.get('page');
    return `${url.origin}${safePath}${page ? `?page=${encodeURIComponent(page)}` : ''}`;
  } catch {
    return '[invalid-url]';
  }
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
    this.runId = runId;
    this.durable = options.durable === true;
    this.outputDir = this.durable ? path.join(evidenceRoot, runId) : path.resolve('.tmp/playwright-evidence', runId);
    this.events = [];
    this.executionContext = {
      workDate: { status: 'unknown', value: null, scope: 'user-run-context', evidenceStep: 'ENV-03', reason: 'Not yet read.' },
      timeZone: { status: 'unknown', value: null, scope: 'user-run-context', evidenceStep: 'ENV-03', reason: 'Not yet read.' }
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
    const client = guardedClientState(currentUrl, options.expectedCompany);
    this.events.push({ runId: this.runId, stepId, at: new Date().toISOString(), url: client.redactedUrl, title: sanitizeText(await page.title()), state, screenshot });
    return screenshot;
  }

  finish(meta = {}) {
    const normalizedFacts = normalize(this.facts);
    fs.writeFileSync(path.join(this.outputDir, 'manifest.json'), `${JSON.stringify({ schemaVersion: 1, runId: this.runId, testId: 'UABC-SCN-ENV-001..007', generatedAt: new Date().toISOString(), ...meta, executionContext: normalize(this.executionContext), facts: normalizedFacts, steps: this.events.map(({ at, ...event }) => event) }, null, 2)}\n`);
    fs.writeFileSync(path.join(this.outputDir, 'events.jsonl'), `${this.events.map((event) => JSON.stringify(event)).join('\n')}\n`);
  }
}

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, normalize(item)]));
  return value;
}

export function compareRunManifests() {
  const left = JSON.parse(fs.readFileSync(path.join(evidenceRoot, 'run-1/manifest.json'), 'utf8'));
  const right = JSON.parse(fs.readFileSync(path.join(evidenceRoot, 'run-2/manifest.json'), 'utf8'));
  const leftFacts = normalize({ executionContext: left.executionContext, facts: left.facts });
  const rightFacts = normalize({ executionContext: right.executionContext, facts: right.facts });
  const equal = JSON.stringify(leftFacts) === JSON.stringify(rightFacts);
  const keys = [...new Set([...Object.keys(leftFacts), ...Object.keys(rightFacts)])].sort();
  const differences = keys.filter((key) => JSON.stringify(leftFacts[key]) !== JSON.stringify(rightFacts[key])).map((key) => ({ fact: key, run1: leftFacts[key], run2: rightFacts[key] }));
  const comparison = { schemaVersion: 1, verificationId: 'UABC-VER-ENV-COMPARE-001', runIds: ['run-1', 'run-2'], stableFactsEqual: equal, allowedDifferences: ['runId', 'generatedAt', 'event timestamps'], differences };
  fs.writeFileSync(path.join(evidenceRoot, 'comparison.json'), `${JSON.stringify(comparison, null, 2)}\n`);
  if (!equal) throw new Error(`Stable baseline facts differ: ${differences.map((item) => item.fact).join(', ')}`);
  return comparison;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url) && process.argv[2] === 'compare') {
  console.log(JSON.stringify(compareRunManifests(), null, 2));
}
