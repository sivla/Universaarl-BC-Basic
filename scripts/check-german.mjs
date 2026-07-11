import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const RAW_EVIDENCE_BLOBS = Object.freeze({
  'evidence/archive-dry-run-2026-07-10.yaml': '64099a06ccac6a8bec2bf50388ce2b3d192a1dda',
  'evidence/governance-selftests-2026-07-10.yaml': '5b38204e420530ce5a4254294013cc1cc95d97eb',
  'evidence/playthru-environment-baseline/comparison.json': '01acaccb089b316a769eb2009f54ce6fbc6292df',
  'evidence/playthru-environment-baseline/lifecycle-selftest.yaml': '854e0e09cc0b696bd510715a79464c2958ea092e',
  'evidence/playthru-environment-baseline/run-1/events.jsonl': '3e2235f6651b3984afa0474b72eb53a996c14e56',
  'evidence/playthru-environment-baseline/run-1/manifest.json': '80a60644473586fe691700aa85c5fa3de3dd5d1d',
  'evidence/playthru-environment-baseline/run-2/events.jsonl': '8b66c9ebf706a087bce1efc1ef564499fc20a0db',
  'evidence/playthru-environment-baseline/run-2/manifest.json': '7debea6db05735e1447b61e7fa457e1360419d51',
  'evidence/playthru-environment-baseline/visual-review.yaml': '8890edcdb107a3f628f57116524daca38dbeb84c'
});

export const STANDARD_PAYLOAD_KEYS = Object.freeze([
  'schemaVersion',
  'status',
  'language',
  'projectId',
  'commit',
  'userVisibleOwnContentGerman'
]);

const TEXT_EXTENSIONS = new Set(['.md', '.yaml', '.yml', '.json', '.jsonl', '.html', '.htm', '.vtt', '.mjs', '.js', '.ts', '.tsx']);
const SOURCE_CATALOG_PATH = 'docs/research/sources.yaml';
const SOURCE_REGISTER_PATH = 'docs/research/source-register.md';
const PACKAGE_LOCK_PATH = 'package-lock.json';
const PROJECT_ID = 'blueprint';
const OFFICIAL_SOURCE_KINDS = new Set(['official', 'microsoft-learn', 'microsoft-licensing', 'playwright-official']);
const PLANNING_REFERENCE_PATTERN = /`?planningReference`?\s*(?::|=)\s*`?2026 Release Wave 1`?/g;
const VERIFICATION_VISUAL_REVIEW_PATH = 'evidence/playthru-environment-baseline/visual-review.yaml';
const VERIFICATION_TYPE_VALUES = new Set([
  'architecture-review', 'archive-dry-run', 'automated', 'automated-policy-gate', 'capability-review',
  'curated-document-review', 'deterministic-artifact-build', 'document-review',
  'governance-negative-and-positive-selftest', 'governance-regression-test', 'human-approval',
  'normalized-result-comparison', 'playwright-ui-baseline', 'repository', 'visual-evidence-review'
]);

const EXACT_STRUCTURED_VALUE_EXCEPTIONS = new Map([
  ['architecture/enterprise-blueprint.yaml\u001f$.planningReference\u001f2026 Release Wave 1', 'technische-planungsreferenz'],
  ['architecture/enterprise-blueprint.yaml\u001f$.actualSandboxBaseline.facts.executionContext.scope\u001fuser-run-context', 'gebundener-ausfuehrungskontext'],
  ['openspec/changes/archive/2026-07-10-establish-playthru-environment-baseline/.openspec.yaml\u001f$.proposedCanonicalUpdate.facts.executionContext.scope\u001fuser-run-context', 'gebundener-ausfuehrungskontext'],
  ['architecture/enterprise-blueprint.yaml\u001f$.identityAndEnvironment.targetEnvironment.writeReadiness\u001fnot-authorized', 'gebundene-schreibbereitschaft'],
  ['architecture/enterprise-blueprint.yaml\u001f$.sites[4].inventoryPurpose\u001fproject staging', 'gebundener-inventarzweck'],
  ['capabilities/catalog.yaml\u001f$.statusValues[4]\u001fout-of-scope', 'deklarierter-statuswert'],
  ['exports/project-artifacts/v0.1/index.yaml\u001f$.access\u001fread-only', 'gebundener-exportzugriff'],
  ['openspec/changes/archive/2026-07-10-establish-playthru-environment-baseline/.openspec.yaml\u001f$.approvalPolicy.authorizedBy\u001freal-repository-user', 'gebundene-freigabeidentitaet']
]);

const ENGLISH_WORDS = new Set(`
  a an the this that these those is are was were be been being will would should could can may might must have has had do does did
  and or but if then else when while where who which what why how with without within from into onto over under between through during
  before after about against among around at by for in of on to up down out as than so not no only all any each every some more most less
  other another same such own user users visible hidden content sentence sentences unknown unfamiliar newly new neighbor adjacent carefully
  completely quietly always never explains explain described describe describes needs need required requires require verify verifies expose exposes
  customer customers outcome outcomes workflow workflows approval approvals title titles description descriptions feature features environment
  environments company companies overview setup create creates created update updates updated change changes changed run runs test tests check checks
  validate validates validation result results evidence source sources reference references requirement requirements scenario scenarios added modified
  removed renamed given read write writes warning warnings error errors fail fails failed failure success passed missing invalid expected actual value values
  file files path paths project projects commit status language display browser page pages view views support help management implementation guide planned
  release process configuration migration training operations contract contracts subscription subscriptions service item items resource resources planning
  assembly manufacturing dimension dimensions return returns payment payments posting group groups master synchronization authentication trace viewer switch
  app apps extension extensions upcoming ahead time information data artifact artifacts report reports generated generate generator package packages build builds
  reviewer reviewers parent parents secret secrets seek reduced motion trade workstream workstreams open dashboard raw upstream diagnostic diagnostics english
  german lowercase uppercase property properties type types extra exact field fields payload shape text texts screen interface accessible accessibility label labels
  message messages command commands output input inputs repository repositories human sentence outcome purpose purposes rationale rule rules available availability
`.trim().split(/\s+/));

const GERMAN_WORDS = new Set(`
  der die das den dem des ein eine einer eines einen einem und oder aber ist sind war waren sei seien wird werden wurde wurden hat haben hatte hatten
  kann koennen muss muessen soll sollen darf duerfen nicht kein keine mit ohne fuer von zu zum zur im in auf aus bei nach vor ueber unter zwischen durch
  waehrend wenn dann als auch nur alle jeder jede jedes diese dieser dieses nutzer benutzer sichtbar unsichtbar inhalt satz saetze unbekannt neue neuer neues
  benachbart sorgfaeltig vollstaendig immer niemals erklaert erklaeren beschrieben beschreiben benoetigt erfordert pruefen prueft kunde kunden ergebnis
  ergebnisse arbeitsablauf arbeitsablaeufe freigabe freigaben titel beschreibung beschreibungen funktion funktionen umgebung umgebungen unternehmen uebersicht
  einrichtung erstellen erstellt aktualisieren aktualisiert aenderung aenderungen geaendert ausfuehren ausgefuehrt test tests pruefung pruefungen validierung
  nachweis nachweise quelle quellen referenz referenzen anforderung anforderungen szenario szenarien hinzugefuegt entfernt umbenannt gegeben lesen schreiben
  warnung warnungen fehler fehlgeschlagen erfolgreich bestanden fehlt fehlend ungueltig erwartet tatsaechlich wert werte datei dateien pfad pfade projekt
  projekte versionsstand status sprache anzeige browser seite seiten ansicht unterstuetzung hilfe verwaltung implementierung leitfaden geplant veroeffentlichung
  prozess prozesse konfiguration migration schulung betrieb vertrag vertraege abonnement dienst artikel ressource ressourcen planung montage fertigung dimension
  rueckgabe zahlung buchung gruppe synchronisierung authentifizierung spur wechseln erweiterung erweiterungen information informationen daten artefakt artefakte
  bericht berichte generiert paket programmstand programmstaende pruefende person personen elternbeziehung elternbeziehungen geheimnis geheimnisse springen
  reduzierte bewegung handel handels arbeitsstrom arbeitsstroeme regel regeln genau feld felder ausgabe eingabe menschlich menschliche deutsch deutsche eigener
  eigene eigeninhalte oberflaeche zugaenglich beschriftung meldung meldungen befehl zweck begruendung verfuegbar verfuegbarkeit
`.trim().split(/\s+/));

const TECHNICAL_PHRASES = Object.freeze([
  'Universaarl Business Central Blueprint V2',
  'Microsoft Dynamics 365 Business Central',
  'Dynamics 365 Business Central',
  'Business Central',
  'Success by Design',
  'Record-to-Report',
  'Procure-to-Pay',
  'Order-to-Cash',
  'Plan-to-Produce',
  'Project-to-Cash',
  'Service-to-Cash',
  'Hire-to-Retire',
  'Make-to-Stock',
  'Make-to-Order',
  'OpenSpec',
  'Playwright',
  'Chromium',
  'Node.js',
  'FFmpeg',
  'FFprobe',
  'WebVTT',
  'Ajv',
  'Jira',
  'Confluence',
  'PowerShell',
  'GitHub'
]);

const FIELD_ENUMS = new Map([
  ['status', new Set(['proposed', 'approved', 'historical', 'superseded', 'retired', 'pending', 'in-review', 'passed', 'failed', 'planned', 'deferred', 'draft', 'blocked', 'confirmed', 'candidate', 'unknown', 'ready', 'active', 'archived', 'unapplied'])],
  ['statuses', new Set(['Backlog', 'Ready', 'In Progress', 'Blocked', 'In Review', 'Done'])],
  ['from', new Set(['Backlog', 'Ready', 'In Progress', 'Blocked', 'In Review', 'Done'])],
  ['to', new Set(['Backlog', 'Ready', 'In Progress', 'Blocked', 'In Review', 'Done'])],
  ['purpose', new Set(['learning-and-display'])],
  ['mode', new Set(['repository-root', 'manual', 'automated'])],
  ['audiences', new Set(['beginner', 'consultant', 'evidence-review'])],
  ['audience', new Set(['beginner', 'consultant', 'evidence-review'])],
  ['kind', new Set(['official', 'microsoft-learn', 'microsoft-licensing', 'playwright-official', 'automated', 'manual'])],
  ['type', new Set(['object', 'array', 'string', 'integer', 'number', 'boolean', 'null', 'automated', 'manual', 'Task', 'Story', 'Epic'])],
  ['issueType', new Set(['Task', 'Story', 'Epic'])],
  ['severity', new Set(['critical', 'high', 'medium', 'low'])],
  ['completeness', new Set(['visible-partial'])],
  ['visibilityBasis', new Set(['name-and-publisher-intersect-screenshot-viewport', 'row-intersects-screenshot-viewport'])]
]);

const TECHNICAL_FIELD_PATTERN = /^(?:\$schema|schemaVersion|id|key|url|uri|path|sha256|checksum|commit|tree|branch|version|templateVersion|method|selector|regex|pattern|format|createdAt|retrievedAt|executedAt|decidedAt|timestamp|date|sequence|owner|reviewers|required|enum|const|additionalProperties|minimum|maximum|mimeType|width|height|durationSeconds|fps|sizeBytes|dependsOn)$/;
const TECHNICAL_SUFFIX_PATTERN = /(?:Id|Ids|Ref|Refs|Path|Paths|Hash|Hashes|Checksum|Checksums|Url|Urls)$/;
const FIXED_OPENSPEC_PATTERN = /\b(?:ADDED|MODIFIED|REMOVED|RENAMED) Requirements\b|\b(?:Requirement|Scenario):|\*\*(?:GIVEN|WHEN|THEN|AND)\*\*|\bMUST\b/g;

function normalizePath(value) {
  return String(value).replaceAll('\\', '/');
}

function asText(value) {
  return Buffer.isBuffer(value) ? value.toString('utf8') : String(value ?? '');
}

export function gitBlobSha1(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return crypto.createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`, 'utf8')).update(bytes).digest('hex');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripTechnicalPhrases(value) {
  let result = value;
  for (const phrase of TECHNICAL_PHRASES) result = result.replace(new RegExp(escapeRegExp(phrase), 'gi'), ' ');
  return result;
}

function splitWords(value) {
  return stripTechnicalPhrases(value)
    .replace(/https?:\/\/[^\s)\]}>'"]+/gi, ' ')
    .replace(/\b(?:UABC|SRC|ENV|STEP|RUN|UAS|UAD|SLS|NK|P|W)-[A-Z0-9._:-]+\b/g, ' ')
    .replace(/\b[0-9a-f]{40,64}\b/gi, ' ')
    .replace(/\{\{[^}]+\}\}|<[^>]+>|\[[A-Z0-9_.:-]+\]/g, ' ')
    .replace(/([\p{Ll}\d])([\p{Lu}])/gu, '$1 $2')
    .replace(/([\p{Lu}])([\p{Lu}][\p{Ll}])/gu, '$1 $2')
    .replace(/[_/\\-]+/g, ' ')
    .match(/\p{L}{2,}/gu)?.map((word) => word.toLocaleLowerCase('de-DE')) ?? [];
}

function isEnglishToken(token) {
  if (GERMAN_WORDS.has(token)) return false;
  if (ENGLISH_WORDS.has(token)) return true;
  if (token.endsWith('s') && ENGLISH_WORDS.has(token.slice(0, -1))) return true;
  if (token.endsWith('es') && ENGLISH_WORDS.has(token.slice(0, -2))) return true;
  if (token.endsWith('ed') && ENGLISH_WORDS.has(token.slice(0, -2))) return true;
  if (token.endsWith('ing') && (ENGLISH_WORDS.has(token.slice(0, -3)) || token.length >= 7)) return true;
  return token.length >= 5 && /(?:ness|ship|wards?|ably|ibly|fully|lessly|ous|ful|less|ized|ised|izes|ises|izing|ising|ically|edly|estly|ately|utely|ively|ly)$/.test(token);
}

export function analyzeGermanText(value) {
  const text = String(value ?? '').trim();
  const tokens = splitWords(text);
  let englishCount = 0;
  let germanCount = 0;
  let currentEnglishRun = 0;
  let maxEnglishRun = 0;
  const englishWords = [];
  for (const token of tokens) {
    if (isEnglishToken(token)) {
      englishCount += 1;
      currentEnglishRun += 1;
      maxEnglishRun = Math.max(maxEnglishRun, currentEnglishRun);
      englishWords.push(token);
    } else {
      currentEnglishRun = 0;
      if (GERMAN_WORDS.has(token) || /[äöüß]/u.test(token) || /(?:ung|ungen|heit|keiten?|schaft|schaften)$/.test(token)) germanCount += 1;
    }
  }
  const shortEnglishPhrase = tokens.length >= 2 && tokens.length <= 5 && englishCount >= 2 && germanCount === 0 && englishCount / tokens.length >= 0.6;
  const englishSequence = maxEnglishRun >= 3 && englishCount > germanCount / 2;
  const englishDominance = englishCount >= 4 && englishCount >= germanCount + 2;
  return {
    violation: Boolean(shortEnglishPhrase || englishSequence || englishDominance),
    tokens,
    englishWords,
    englishCount,
    germanCount,
    maxEnglishRun
  };
}

function lineForIndex(content, index) {
  if (!Number.isInteger(index) || index < 0) return null;
  return content.slice(0, index).split(/\r?\n/).length;
}

function lineForValue(content, value) {
  const plain = String(value);
  let index = content.indexOf(plain);
  if (index < 0) index = content.indexOf(JSON.stringify(plain).slice(1, -1));
  return lineForIndex(content, index);
}

function nearestField(tokens) {
  for (let index = tokens.length - 1; index >= 0; index -= 1) if (typeof tokens[index] === 'string') return tokens[index];
  return '';
}

function jsonLocation(tokens) {
  return `$${tokens.map((token) => typeof token === 'number' ? `[${token}]` : `.${token}`).join('')}`;
}

function looksLikeTechnicalValue(value) {
  const text = value.trim();
  if (!text) return true;
  if (/^(?:https?:\/\/|mailto:)/i.test(text)) return true;
  if (/^(?:npm|node|git|npx|ffmpeg|ffprobe|powershell|pwsh)\s+/i.test(text)) return true;
  if (/^(?:\.\.?\/|[A-Za-z]:[\\/]|\/)[^\r\n]*$/.test(text)) return true;
  if (!/\s/.test(text) && /[\\/]/.test(text) && /[.][A-Za-z0-9]+(?:$|[?#])/.test(text)) return true;
  if (/^[0-9]+(?:\.[0-9]+){1,3}(?:[-+][A-Za-z0-9.-]+)?$/.test(text)) return true;
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}(?:T[^\s]+)?$/.test(text)) return true;
  if (/^[0-9a-f]{40,64}$/i.test(text)) return true;
  if (/^(?:UABC|SRC|ENV|STEP|RUN|UAS|UAD|SLS|NK|P|W)-[A-Z0-9._:-]+$/.test(text)) return true;
  if (/^(?:GET|HEAD|OPTIONS|POST|PUT|PATCH|DELETE)(?::[a-z-]+)?$/.test(text)) return true;
  if (/^(?:\^|\/).*(?:\$|\/[dgimsuvy]*)$/.test(text)) return true;
  if (/^(?:#|\.|\[)[A-Za-z0-9_#.[\]=:'" -]+$/.test(text)) return true;
  return false;
}

function enumException(tokens, value) {
  const field = nearestField(tokens);
  return FIELD_ENUMS.get(field)?.has(value) ?? false;
}

function technicalFieldException(tokens, value) {
  const field = nearestField(tokens);
  if (TECHNICAL_FIELD_PATTERN.test(field) || TECHNICAL_SUFFIX_PATTERN.test(field)) return true;
  if (tokens.some((token) => ['enum', 'required', 'properties', 'additionalProperties', '$defs'].includes(token))) return true;
  if (enumException(tokens, value)) return true;
  return looksLikeTechnicalValue(value);
}

function boundStructuredValueException(file, tokens, value) {
  const location = jsonLocation(tokens);
  const exact = EXACT_STRUCTURED_VALUE_EXCEPTIONS.get(`${file}\u001f${location}\u001f${value}`);
  if (exact) return exact;
  if (file === 'evidence/verification-register.yaml'
      && /^\$\.verifications\[\d+\]\.type$/.test(location)
      && VERIFICATION_TYPE_VALUES.has(value)) return 'deklarierter-verifikationstyp';
  return null;
}

function stripBoundTechnicalFragments(report, file, text, { line = null, location = null, tokens = [] } = {}) {
  let result = String(text ?? '');
  result = result.replace(PLANNING_REFERENCE_PATTERN, (value) => {
    report.exceptions.push({ path: file, line, location, kind: 'technischer-planungsreferenzmarker', value });
    return ' ';
  });
  const verificationEvidence = file === 'evidence/verification-register.yaml'
    && /^\$\.verifications\[\d+\]\.evidence$/.test(location ?? jsonLocation(tokens));
  if (verificationEvidence && result.includes(VERIFICATION_VISUAL_REVIEW_PATH)) {
    report.exceptions.push({ path: file, line, location, kind: 'technischer-visual-review-pfad', value: VERIFICATION_VISUAL_REVIEW_PATH });
    result = result.replaceAll(VERIFICATION_VISUAL_REVIEW_PATH, ' ');
  }
  if (verificationEvidence) {
    result = result.replace(/\bhumanApproval(?:\s*=\s*|\s+)false\b/g, (value) => {
      report.exceptions.push({ path: file, line, location, kind: 'technischer-human-approval-marker', value });
      return ' ';
    });
  }
  return result;
}

function sourceCatalogFromEntries(entries) {
  const sourceEntry = entries.find((entry) => entry.path === SOURCE_CATALOG_PATH);
  if (!sourceEntry) return new Map();
  try {
    const document = YAML.parse(asText(sourceEntry.content));
    return new Map((document?.sources ?? [])
      .filter((source) => source && OFFICIAL_SOURCE_KINDS.has(source.kind) && typeof source.url === 'string' && typeof source.title === 'string')
      .map((source) => [source.url, { id: source.id, title: source.title, kind: source.kind }]));
  } catch {
    return new Map();
  }
}

function officialSourceTitleException(file, tokens, rootDocument, value, sourceCatalog) {
  if (file !== SOURCE_CATALOG_PATH || tokens.length !== 3 || tokens[0] !== 'sources' || typeof tokens[1] !== 'number' || tokens[2] !== 'title') return false;
  const source = rootDocument?.sources?.[tokens[1]];
  const catalogEntry = sourceCatalog.get(source?.url);
  return Boolean(source && OFFICIAL_SOURCE_KINDS.has(source.kind) && catalogEntry?.title === value && catalogEntry?.kind === source.kind);
}

function createReport() {
  return { scannedFileCount: 0, checkedValueCount: 0, violations: [], exceptions: [] };
}

function addViolation(report, { file, line = null, location = null, kind = 'englische-wortfolge', text, analysis = null }) {
  report.violations.push({
    path: file,
    line,
    location,
    kind,
    text: String(text).replace(/\s+/g, ' ').trim().slice(0, 320),
    englishWords: analysis?.englishWords ?? []
  });
}

function checkText(report, file, text, { line = null, location = null, tokens = [] } = {}) {
  const bounded = stripBoundTechnicalFragments(report, file, text, { line, location, tokens });
  const normalized = bounded.replace(FIXED_OPENSPEC_PATTERN, ' ').replace(/`[^`]*`/g, ' ').trim();
  if (!normalized || looksLikeTechnicalValue(normalized)) return;
  report.checkedValueCount += 1;
  const analysis = analyzeGermanText(normalized);
  if (analysis.violation) addViolation(report, { file, line, location, text: normalized, analysis });
}

function scanStructuredValue({ report, file, content, value, tokens = [], rootDocument, sourceCatalog }) {
  if (typeof value === 'string') {
    if (officialSourceTitleException(file, tokens, rootDocument, value, sourceCatalog)) {
      report.exceptions.push({ path: file, location: jsonLocation(tokens), kind: 'offizieller-quellentitel', value });
      return;
    }
    const boundException = boundStructuredValueException(file, tokens, value);
    if (boundException) {
      report.exceptions.push({ path: file, location: jsonLocation(tokens), kind: boundException, value });
      return;
    }
    if (file === 'package.json' && jsonLocation(tokens) !== '$.description') return;
    if (technicalFieldException(tokens, value)) return;
    checkText(report, file, value, { line: lineForValue(content, value), location: jsonLocation(tokens), tokens });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanStructuredValue({ report, file, content, value: item, tokens: [...tokens, index], rootDocument, sourceCatalog }));
    return;
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    for (const [key, item] of Object.entries(value)) scanStructuredValue({ report, file, content, value: item, tokens: [...tokens, key], rootDocument, sourceCatalog });
  }
}

function scanStructured(report, entry, sourceCatalog, parser) {
  const content = asText(entry.content);
  try {
    const rootDocument = parser(content);
    scanStructuredValue({ report, file: entry.path, content, value: rootDocument, rootDocument, sourceCatalog });
  } catch (error) {
    addViolation(report, { file: entry.path, kind: 'scanfehler', text: `Struktur konnte nicht gelesen werden: ${error.message}` });
  }
}

function scanJsonLines(report, entry, sourceCatalog) {
  const content = asText(entry.content);
  for (const [index, line] of content.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    try {
      const document = JSON.parse(line);
      scanStructuredValue({ report, file: entry.path, content: line, value: document, tokens: [index], rootDocument: document, sourceCatalog });
    } catch (error) {
      addViolation(report, { file: entry.path, line: index + 1, kind: 'scanfehler', text: `JSON-Zeile konnte nicht gelesen werden: ${error.message}` });
    }
  }
}

function scanMarkdown(report, entry, sourceCatalog) {
  const content = asText(entry.content);
  let fenced = false;
  for (const [index, originalLine] of content.split(/\r?\n/).entries()) {
    if (/^\s*(```|~~~)/.test(originalLine)) { fenced = !fenced; continue; }
    if (fenced || /^\s*\|?\s*:?-{3,}/.test(originalLine)) continue;
    let line = originalLine;
    line = line.replace(/!?\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, (match, label, url) => {
      const source = sourceCatalog.get(url);
      if (entry.path === SOURCE_REGISTER_PATH && source && OFFICIAL_SOURCE_KINDS.has(source.kind)) {
        report.exceptions.push({ path: entry.path, line: index + 1, kind: 'zugehoerige-offizielle-linkbeschriftung', value: label, url });
        return ' ';
      }
      return ` ${label} `;
    });
    line = line.replace(/https?:\/\/\S+/g, ' ').replace(/^\s{0,3}(?:#{1,6}|[-*+] |\d+[.)] )/, '').replace(/[|>*_~]/g, ' ');
    checkText(report, entry.path, line, { line: index + 1, location: `Zeile ${index + 1}` });
  }
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function jsStringLiterals(source) {
  const values = [];
  let index = 0;
  let line = 1;
  while (index < source.length) {
    const character = source[index];
    const next = source[index + 1];
    if (character === '\n') { line += 1; index += 1; continue; }
    if (character === '/' && next === '/') {
      index += 2;
      while (index < source.length && source[index] !== '\n') index += 1;
      continue;
    }
    if (character === '/' && next === '*') {
      index += 2;
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
        if (source[index] === '\n') line += 1;
        index += 1;
      }
      index += 2;
      continue;
    }
    if (!['\'', '"', '`'].includes(character)) { index += 1; continue; }
    const quote = character;
    const start = index;
    const startLine = line;
    index += 1;
    let value = '';
    while (index < source.length) {
      const current = source[index];
      if (current === '\\') {
        value += current;
        if (source[index + 1] === '\n') line += 1;
        value += source[index + 1] ?? '';
        index += 2;
        continue;
      }
      if (current === quote) { index += 1; break; }
      if (current === '\n') line += 1;
      value += current;
      index += 1;
    }
    values.push({ value, line: startLine, start, context: source.slice(Math.max(0, start - 420), start) });
  }
  return values;
}

function javascriptCallContext(context) {
  const source = context.slice(-1600);
  const delimiters = [];
  let quote = null;
  let lineComment = false;
  let blockComment = false;
  for (let index = 0; index < source.length; index += 1) {
    const current = source[index];
    const next = source[index + 1];
    if (lineComment) { if (current === '\n') lineComment = false; continue; }
    if (blockComment) { if (current === '*' && next === '/') { blockComment = false; index += 1; } continue; }
    if (quote) {
      if (current === '\\') { index += 1; continue; }
      if (current === quote) quote = null;
      continue;
    }
    if (current === '/' && next === '/') { lineComment = true; index += 1; continue; }
    if (current === '/' && next === '*') { blockComment = true; index += 1; continue; }
    if (['\'', '"', '`'].includes(current)) { quote = current; continue; }
    if (['(', '[', '{'].includes(current)) delimiters.push({ character: current, index });
    else if ([')', ']', '}'].includes(current)) delimiters.pop();
  }
  const open = [...delimiters].reverse().find((item) => item.character === '(');
  if (!open) return null;
  const nameMatch = /((?:[A-Za-z_$][\w$]*\.)*[A-Za-z_$][\w$]*)\s*$/.exec(source.slice(0, open.index));
  if (!nameMatch) return null;
  const argumentSource = source.slice(open.index + 1);
  let argumentIndex = 0;
  let nested = 0;
  quote = null;
  for (let index = 0; index < argumentSource.length; index += 1) {
    const current = argumentSource[index];
    if (quote) {
      if (current === '\\') { index += 1; continue; }
      if (current === quote) quote = null;
      continue;
    }
    if (['\'', '"', '`'].includes(current)) { quote = current; continue; }
    if (['(', '[', '{'].includes(current)) nested += 1;
    else if ([')', ']', '}'].includes(current)) nested -= 1;
    else if (current === ',' && nested === 0) argumentIndex += 1;
  }
  return { name: nameMatch[1], argumentIndex };
}

function humanJavaScriptContext(context) {
  const call = javascriptCallContext(context);
  if (call) {
    if (/^(?:test|it|describe)(?:\.(?:only|skip|todo))?$/.test(call.name) && call.argumentIndex === 0) return true;
    if (/^(?:Error|TypeError|RangeError|SyntaxError)$/.test(call.name) && call.argumentIndex === 0) return true;
    if (/^(?:fail|warn|warning|diagnostic)$/.test(call.name) && call.argumentIndex === 0) return true;
    if (call.name === 'check' && call.argumentIndex === 1) return true;
    if (/^console\.(?:error|warn|info|log)$/.test(call.name) && call.argumentIndex === 0) return true;
    if (/^process\.(?:stderr|stdout)\.write$/.test(call.name) && call.argumentIndex === 0) return true;
  }
  const tail = context.slice(-420);
  return [
    /\.(?:textContent|innerText|ariaLabel|alt|title|placeholder)\s*=\s*$/s,
    /\bsetAttribute\(\s*['"](?:aria-label|aria-description|alt|title|placeholder)['"]\s*,\s*$/s
  ].some((pattern) => pattern.test(tail));
}

function scanJavaScriptSource(report, file, source, lineOffset = 0) {
  for (const literal of jsStringLiterals(source)) {
    if (!humanJavaScriptContext(literal.context)) continue;
    const value = literal.value.replace(/\$\{[^}]*\}/g, ' ');
    checkText(report, file, value, { line: literal.line + lineOffset, location: `JavaScript-Zeichenfolge` });
  }
}

function scanHtml(report, entry, sourceCatalog) {
  const content = asText(entry.content);
  let withoutScripts = content;
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const match of content.matchAll(scriptPattern)) {
    const attributes = match[1];
    const body = match[2];
    const line = lineForIndex(content, match.index ?? -1) ?? 1;
    if (/\btype\s*=\s*['"]application\/json['"]/i.test(attributes)) {
      try {
        const document = JSON.parse(body);
        scanStructuredValue({ report, file: entry.path, content: body, value: document, tokens: ['eingebettetesManifest'], rootDocument: document, sourceCatalog });
      } catch (error) {
        addViolation(report, { file: entry.path, line, kind: 'scanfehler', text: `Eingebettetes Manifest konnte nicht gelesen werden: ${error.message}` });
      }
    } else scanJavaScriptSource(report, entry.path, body, line - 1);
  }
  withoutScripts = withoutScripts.replace(scriptPattern, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<!--([\s\S]*?)-->/g, ' ');
  const attributePattern = /\b(aria-label|aria-description|alt|title|placeholder)\s*=\s*(['"])([\s\S]*?)\2/gi;
  for (const match of content.matchAll(attributePattern)) {
    checkText(report, entry.path, decodeHtml(match[3]), { line: lineForIndex(content, match.index ?? -1), location: `HTML-${match[1].toLowerCase()}` });
  }
  const visible = decodeHtml(withoutScripts.replace(/<[^>]+>/g, '\n'));
  for (const [index, line] of visible.split(/\r?\n/).entries()) checkText(report, entry.path, line, { line: index + 1, location: 'sichtbarer HTML-Text' });
}

function scanVtt(report, entry) {
  for (const [index, line] of asText(entry.content).split(/\r?\n/).entries()) {
    if (!line.trim() || /^WEBVTT\b|^NOTE\b|^\d+$|-->/.test(line.trim())) continue;
    checkText(report, entry.path, line, { line: index + 1, location: `Untertitelzeile ${index + 1}` });
  }
}

function scanGitAttributes(report, entry) {
  for (const [index, originalLine] of asText(entry.content).split(/\r?\n/).entries()) {
    const line = originalLine.trim();
    if (!line) continue;
    if (/^[^\s#]+\s+-text$/.test(line)) {
      report.exceptions.push({ path: entry.path, line: index + 1, kind: 'technische-gitattributes-regel', value: line });
      continue;
    }
    checkText(report, entry.path, line.replace(/^#\s*/, ''), { line: index + 1, location: `Attributzeile ${index + 1}` });
  }
}

function isTextEntry(file) {
  return file === '.gitignore' || file === '.gitattributes' || TEXT_EXTENSIONS.has(path.posix.extname(file).toLowerCase());
}

function normalizeEntries(entries) {
  return entries.map((entry) => {
    const content = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(String(entry.content ?? ''), 'utf8');
    return {
      ...entry,
      path: normalizePath(entry.path),
      content,
      blobHash: entry.blobHash ?? gitBlobSha1(content),
      indexBlobHash: entry.indexBlobHash ?? entry.blobHash ?? gitBlobSha1(content)
    };
  });
}

export function scanEntries(inputEntries) {
  const entries = normalizeEntries(inputEntries);
  const sourceCatalog = sourceCatalogFromEntries(entries);
  const report = createReport();
  for (const entry of entries) {
    if (!isTextEntry(entry.path)) continue;
    report.scannedFileCount += 1;
    const rawExpected = RAW_EVIDENCE_BLOBS[entry.path];
    if (rawExpected) {
      if (entry.blobHash !== rawExpected || entry.indexBlobHash !== rawExpected) {
        addViolation(report, { file: entry.path, kind: 'raw-evidence-blobabweichung', text: `Erwarteter Git-Blob ${rawExpected}, Arbeitskopie ${entry.blobHash}, Index ${entry.indexBlobHash}` });
      } else report.exceptions.push({ path: entry.path, kind: 'historische-raw-evidence', gitBlob: rawExpected });
      continue;
    }
    if (entry.path === PACKAGE_LOCK_PATH) {
      report.exceptions.push({ path: entry.path, kind: 'generierte-drittanbieter-sperrdatei' });
      continue;
    }
    const extension = path.posix.extname(entry.path).toLowerCase();
    if (extension === '.md') scanMarkdown(report, entry, sourceCatalog);
    else if (extension === '.yaml' || extension === '.yml') scanStructured(report, entry, sourceCatalog, (content) => YAML.parse(content));
    else if (extension === '.json') scanStructured(report, entry, sourceCatalog, (content) => JSON.parse(content));
    else if (extension === '.jsonl') scanJsonLines(report, entry, sourceCatalog);
    else if (extension === '.html' || extension === '.htm') scanHtml(report, entry, sourceCatalog);
    else if (extension === '.vtt') scanVtt(report, entry);
    else if (['.mjs', '.js', '.ts', '.tsx'].includes(extension)) scanJavaScriptSource(report, entry.path, asText(entry.content));
    else if (entry.path === '.gitattributes') scanGitAttributes(report, entry);
    else if (entry.path === '.gitignore') {
      for (const [index, line] of asText(entry.content).split(/\r?\n/).entries()) checkText(report, entry.path, line, { line: index + 1 });
    }
  }
  report.violations.sort((left, right) => left.path.localeCompare(right.path) || (left.line ?? 0) - (right.line ?? 0) || left.text.localeCompare(right.text));
  return report;
}

function git(rootDir, args, encoding = 'utf8') {
  return execFileSync('git', args, {
    cwd: rootDir,
    encoding,
    windowsHide: true,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function repositoryEntries(rootDir) {
  const output = git(rootDir, ['ls-files', '-s', '-z'], 'buffer').toString('utf8');
  const entries = [];
  const tracked = new Set();
  for (const record of output.split('\0').filter(Boolean)) {
    const match = /^(\d+) ([0-9a-f]{40}) (\d)\t([\s\S]+)$/.exec(record);
    if (!match || match[3] !== '0') throw new Error(`Ungueltiger oder zusammengefuehrter Indexeintrag: ${record.slice(0, 120)}`);
    const relative = normalizePath(match[4]);
    tracked.add(relative);
    const absolute = path.join(rootDir, ...relative.split('/'));
    const content = fs.readFileSync(absolute);
    entries.push({ path: relative, mode: match[1], indexBlobHash: match[2], blobHash: gitBlobSha1(content), content });
  }
  const untracked = git(rootDir, ['ls-files', '--others', '--exclude-standard', '-z'], 'buffer').toString('utf8');
  for (const name of untracked.split('\0').filter(Boolean)) {
    const relative = normalizePath(name);
    if (tracked.has(relative)) continue;
    const absolute = path.join(rootDir, ...relative.split('/'));
    const content = fs.readFileSync(absolute);
    const blobHash = gitBlobSha1(content);
    entries.push({ path: relative, mode: 'untracked', indexBlobHash: blobHash, blobHash, content });
  }
  return entries;
}

export function scanRepository({ rootDir = process.cwd() } = {}) {
  const commit = String(git(rootDir, ['rev-parse', 'HEAD'])).trim();
  const report = scanEntries(repositoryEntries(rootDir));
  return { commit, ...report };
}

export function createStandardPayload(commit) {
  return {
    schemaVersion: 1,
    status: 'passed',
    language: 'de',
    projectId: PROJECT_ID,
    commit,
    userVisibleOwnContentGerman: true
  };
}

export function validateStandardPayload(payload, { expectedCommit = null } = {}) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return ['Standardausgabe muss ein JSON-Objekt sein.'];
  const keys = Object.keys(payload);
  if (keys.length !== STANDARD_PAYLOAD_KEYS.length || !keys.every((key, index) => key === STANDARD_PAYLOAD_KEYS[index])) {
    errors.push(`Eigenschaften muessen exakt und in Reihenfolge ${STANDARD_PAYLOAD_KEYS.join(', ')} lauten.`);
  }
  if (typeof payload.schemaVersion !== 'number' || payload.schemaVersion !== 1) errors.push('schemaVersion muss die Zahl 1 sein.');
  if (typeof payload.status !== 'string' || payload.status !== 'passed') errors.push('status muss der String passed sein.');
  if (typeof payload.language !== 'string' || payload.language !== 'de') errors.push('language muss der String de sein.');
  if (typeof payload.projectId !== 'string' || payload.projectId !== PROJECT_ID) errors.push('projectId muss der String blueprint sein.');
  if (typeof payload.commit !== 'string' || !/^[0-9a-f]{40}$/.test(payload.commit)) errors.push('commit muss eine 40-stellige kleingeschriebene Hex-SHA sein.');
  if (expectedCommit !== null && payload.commit !== expectedCommit) errors.push('commit stimmt nicht mit der erwarteten SHA ueberein.');
  if (typeof payload.userVisibleOwnContentGerman !== 'boolean' || payload.userVisibleOwnContentGerman !== true) errors.push('userVisibleOwnContentGerman muss der boolesche Wert true sein.');
  return errors;
}

function validateEnvironment(commit) {
  const configuredProject = process.env.UNIVERSAARL_PROJECT_ID;
  if (configuredProject !== undefined && configuredProject !== PROJECT_ID) throw new Error('UNIVERSAARL_PROJECT_ID muss exakt blueprint sein.');
  const expectedCommit = process.env.UNIVERSAARL_EXPECTED_COMMIT;
  if (expectedCommit !== undefined) {
    if (!/^[0-9a-f]{40}$/.test(expectedCommit)) throw new Error('UNIVERSAARL_EXPECTED_COMMIT muss exakt 40 kleingeschriebene Hex-Zeichen enthalten.');
    if (expectedCommit !== commit) throw new Error(`UNIVERSAARL_EXPECTED_COMMIT stimmt nicht mit HEAD ${commit} ueberein.`);
  }
}

function formatViolations(violations) {
  return violations.slice(0, 30).map((item) => {
    const place = item.line ? `${item.path}:${item.line}` : item.path;
    return `${place} [${item.kind}] ${item.text}`;
  }).join('\n');
}

function isMainModule() {
  return process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
}

async function main() {
  try {
    const detailsMode = process.argv.includes('--details');
    const result = scanRepository({ rootDir: process.cwd() });
    validateEnvironment(result.commit);
    if (detailsMode) {
      process.stdout.write(JSON.stringify({ schemaVersion: 1, projectId: PROJECT_ID, ...result }, null, 2));
      if (result.violations.length > 0) process.exitCode = 1;
      return;
    }
    if (result.violations.length > 0) throw new Error(`${result.violations.length} Sprach- oder Integritaetsverstoss/-verstoesse:\n${formatViolations(result.violations)}`);
    const payload = createStandardPayload(result.commit);
    const payloadErrors = validateStandardPayload(payload, { expectedCommit: result.commit });
    if (payloadErrors.length > 0) throw new Error(payloadErrors.join(' '));
    process.stdout.write(JSON.stringify(payload));
  } catch (error) {
    process.stderr.write(`Deutsch-Gate fehlgeschlagen: ${error.message}\n`);
    process.exitCode = 1;
  }
}

if (isMainModule()) await main();
