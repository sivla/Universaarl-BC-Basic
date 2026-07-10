import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import {
  EvidenceRun,
  guardedClientState,
  readCompanyTree,
  readVisibleExtensionCards,
  readVisibleRows,
  readVisibleSurface,
  sanitizeText,
  validateBaseUrl
} from './helpers/bc-evidence.mjs';

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
  if (controls.length !== 1) throw new Error(`Visible overlay/pane could not be closed unambiguously; candidates=${controls.length}`);
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
      } catch { /* frame still loading */ }
    }
    return null;
  }, { timeout: 90_000, intervals: [500, 1000, 2000] }).not.toBeNull();
  const frame = page.frames().find((candidate) => candidate.url() === readyFrameUrl);
  if (!frame) throw new Error('Interactive Business Central frame disappeared after readiness check.');
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
  throw new Error(`Tell Me target not found after localized captions: ${captions.join(' / ')}`);
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

test('captures the playthru environment baseline read-only', async ({ page, context }, testInfo) => {
  if (!baseUrl) throw new Error('BC_BASE_URL is required; an evidence run without an explicit target must fail.');
  validateBaseUrl(baseUrl);
  if (!authOnly && !evidenceMode && !localCheck) throw new Error('Evidence runs require explicit UABC_RUN_ID=run-1 or run-2; use UABC_LOCAL_CHECK=1 only for non-durable local checks.');
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  if (!page.url().includes('businesscentral.dynamics.com') || !page.url().toLowerCase().includes('/playthru')) {
    if (!interactiveAuth) throw new Error('Authenticated playthru session is unavailable. Run the headed auth bootstrap locally.');
    await page.waitForURL((url) => url.hostname === 'businesscentral.dynamics.com' && url.pathname.toLowerCase().split('/').includes('playthru'), { timeout: 300_000 });
    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    await context.storageState({ path: authFile });
  }

  const ui = await waitForBusinessCentralUi(page);
  const initialClient = guardedClientState(ui.url());
  if (!fs.existsSync(authFile)) {
    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    await context.storageState({ path: authFile });
  }
  if (authOnly) return;

  const tracePath = testInfo.outputPath('trace.zip');
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true, title: `${runId}-playthru-baseline` });
  let tracingActive = true;
  const evidence = new EvidenceRun(runId, { durable: evidenceMode });
  let expectedCompany = initialClient.company ?? undefined;

  try {
    evidence.setFact('environment', 'confirmed', 'playthru', 'ENV-00');
    await evidence.step(page, 'ENV-00', 'role-center-client-boundary', { surface: ui, expectedCompany, clip: { x: 0, y: 0, width: 1600, height: 190 } });

    await press(ui, 'Control+o');
    await ui.waitForTimeout(750);
    const companyTree = await readCompanyTree(ui);
    const playthruCompanies = companyTree?.filter((environment) => /^Playthru(?:\s|$)/i.test(environment.name));
    if (playthruCompanies?.length !== 1) throw new Error('Available Companies tree has no single visible playthru environment group.');
    const accessibleCompanyNames = playthruCompanies[0].companies.map((company) => company.name).sort();
    evidence.setFact('accessibleCompanies', 'confirmed', { environment: 'playthru', names: accessibleCompanyNames }, 'ENV-01', 'Visible playthru accessibility subtree only; no company selected and other environments are omitted.');
    const targetCompanies = ['UAM-DE', 'UAS-DE', 'UAD-DE', 'UAP-DE', 'UAC-CONS'].map((bcCompany) => ({
      bcCompany,
      status: 'not-observed-in-accessible-company-pane',
      inference: 'does-not-prove-nonexistence'
    }));
    evidence.setFact('universaarlTargetCompanies', 'confirmed', targetCompanies, 'ENV-01', 'Observation is limited to the accessible playthru company pane and is not an existence test.');
    await evidence.step(page, 'ENV-01', 'available-companies-pane-open-background-preserved', { surface: ui, expectedCompany, clip: { x: 1240, y: 40, width: 360, height: 280 } });
    await closeKnownSurface(ui);
    guardedClientState(ui.url(), expectedCompany);

    await openHelpAndSupport(page, ui);
    guardedClientState(ui.url(), expectedCompany);
    const supportForm = ui.getByRole('form', { name: /^(Hilfe & Support|Help & Support)$/i });
    await expect(supportForm).toBeVisible();
    const supportText = sanitizeText(await supportForm.innerText());
    const version = supportText.split('\n').map((line) => line.trim()).find((line) => /^Version:/i.test(line)) ?? null;
    const buildMatch = version?.match(/Plattform\s+([\d.]+)\s*\+\s*Anwendung\s+([\d.]+)/i);
    const build = buildMatch ? { platform: buildMatch[1], application: buildMatch[2] } : null;
    evidence.setFact('version', version ? 'confirmed' : 'unknown', version, 'ENV-02', version ? null : 'No unambiguous visible version label.');
    evidence.setFact('build', build ? 'confirmed' : 'unknown', build, 'ENV-02', build ? null : 'No unambiguous visible build label.');
    await evidence.step(page, 'ENV-02', 'help-and-support-visible', { surface: ui, expectedCompany, labels: ['Version', 'Application Version', 'Platform Version', 'Build'] });
    await closeKnownSurface(ui);
    const back = ui.getByRole('button', { name: /^(Back|Zurück)$/i });
    await expect(back).toHaveCount(1);
    await back.click();
    await expect(ui.getByRole('heading', { name: /Hilfe und Support|Help and Support/i })).toBeHidden();

    await press(ui, 'Alt+t');
    await ui.waitForTimeout(750);
    const settingsSurface = await readVisibleSurface(ui, ['My Settings', 'Meine Einstellungen']);
    if (!settingsSurface) throw new Error('My Settings did not become a understood dialog or pane.');
    const settingsDialog = ui.getByRole('dialog', { name: /^(My Settings|Meine Einstellungen).*$/i }).last();
    const settingsText = await settingsDialog.innerText();
    const activeCompany = valueAfterLabel(settingsText, ['Company', 'Unternehmen', 'Mandant']);
    const language = valueAfterLabel(settingsText, ['Language', 'Sprache']);
    const region = valueAfterLabel(settingsText, ['Region']);
    const workDate = normalizeGermanDate(await controlValue(settingsDialog, 'Work Date'));
    const timeZone = await controlValue(settingsDialog, 'Time Zone');
    if (activeCompany) {
      if (expectedCompany && expectedCompany !== activeCompany) throw new Error('Visible active company differs from initial URL company.');
      expectedCompany = expectedCompany ?? activeCompany;
    }
    evidence.setFact('activeCompany', activeCompany ? 'confirmed' : 'unknown', activeCompany, 'ENV-03', activeCompany ? null : 'Company value not unambiguously visible.');
    evidence.setFact('language', language ? 'confirmed' : 'unknown', language, 'ENV-03', language ? null : 'Language value not unambiguously visible.');
    evidence.setFact('region', region ? 'confirmed' : 'unknown', region, 'ENV-03', region ? null : 'Region value not unambiguously visible.');
    evidence.setFact('localization', 'unknown', null, 'ENV-03', 'Client language/region alone do not prove installed localization.');
    evidence.setExecutionContext('workDate', workDate ? 'confirmed' : 'unknown', workDate, 'ENV-03', workDate ? 'Visible user work date; not company configuration.' : 'Work date not unambiguously visible.');
    evidence.setExecutionContext('timeZone', timeZone ? 'confirmed' : 'unknown', timeZone, 'ENV-03', timeZone ? 'Visible user time zone; not company configuration.' : 'Time zone not unambiguously visible.');
    await evidence.step(page, 'ENV-03', 'my-settings-dialog-open', { surface: ui, expectedCompany, clip: { x: 500, y: 270, width: 590, height: 260 } });
    await closeKnownSurface(ui);

    await openCompanyInformation(page);
    guardedClientState(ui.url(), expectedCompany);
    const companyForm = ui.getByRole('form', { name: /^(Firmendaten|Company Information)$/i });
    await expect(companyForm).toBeVisible();
    const companyText = await companyForm.innerText();
    const experience = valueAfterLabel(companyText, ['Experience', 'Erfahrung']);
    const countryControl = companyForm.locator('[controlname="Country/Region Code"] input');
    const country = await countryControl.count() === 1 ? sanitizeText(await countryControl.inputValue()) : null;
    evidence.setFact('experience', experience ? 'confirmed' : 'unknown', experience, 'ENV-04', experience ? null : 'Experience not unambiguously visible.');
    if (country) evidence.setFact('localization', 'candidate', country, 'ENV-04', 'Country/Region Code is visible but actual localization still requires explicit evidence.');
    await evidence.step(page, 'ENV-04', 'company-information-read-only', { surface: ui, expectedCompany, clip: { x: 180, y: 430, width: 640, height: 50 } });
    const companyBack = ui.getByRole('button', { name: /^(Back|Zurück)$/i });
    await expect(companyBack).toHaveCount(1);
    await companyBack.click();
    await expect(ui.getByRole('heading', { name: /^(Firmendaten|Company Information)$/i })).toBeHidden();

    await tellMeNavigate(ui, ['Erweiterung', 'Extension'], /Erweiterungsverwaltung|Extension Management|Microsoft AppSource-Apps Verwaltung/i);
    guardedClientState(ui.url(), expectedCompany);
    const extensions = await readVisibleExtensionCards(ui);
    evidence.setFact('extensions', extensions.length ? 'candidate' : 'unknown', { completeness: 'visible-partial', visibilityBasis: 'name-and-publisher-intersect-screenshot-viewport', items: extensions }, 'ENV-05', extensions.length ? 'Small screenshot-viewport subset only; scrolling, rendered off-viewport cards and complete installed-extension inventory are excluded.' : 'No extension name/publisher pair intersected the screenshot viewport or permissions were insufficient.');
    await evidence.step(page, 'ENV-05', 'extension-management-read-only', { surface: ui, expectedCompany });

    await tellMeNavigate(ui, ['Funktion', 'Feature'], /Funktionsverwaltung|Feature Management/i);
    guardedClientState(ui.url(), expectedCompany);
    const features = await readVisibleRows(ui, 200, ['Funktionsverwaltung', 'Feature Management']);
    evidence.setFact('featureManagement', features.length ? 'candidate' : 'unknown', { completeness: 'visible-partial', visibilityBasis: 'row-intersects-screenshot-viewport', items: features }, 'ENV-06', features.length ? 'Visible viewport rows only; no complete feature inventory and no feature action invoked.' : 'No feature rows intersected the screenshot viewport or permissions were insufficient.');
    await evidence.step(page, 'ENV-06', 'feature-management-read-only', { surface: ui, expectedCompany });

    await context.tracing.stop({ path: tracePath });
    tracingActive = false;
    if (!fs.existsSync(tracePath)) throw new Error(`Trace finalization did not create ${tracePath}`);
    const relativeTracePath = path.relative(process.cwd(), tracePath).replaceAll('\\', '/');
    const relativeOutputDir = path.relative(process.cwd(), testInfo.outputDir).replaceAll('\\', '/');
    evidence.finish({
      playwrightVersion,
      rawTrace: { path: relativeTracePath, existsAtManifestWrite: true, classification: 'local-gitignored' },
      rawVideo: { outputDirectory: relativeOutputDir, classification: 'local-gitignored', finalizedByPlaywrightAfterTest: true },
      companySwitchPerformed: false,
      writesPerformed: false
    });
    expect(evidence.facts.environment.value).toBe('playthru');
  } finally {
    if (tracingActive) await context.tracing.stop({ path: tracePath }).catch(() => {});
  }
});
