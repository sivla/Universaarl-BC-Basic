import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const attributePath = path.join(root, '.gitattributes');

const expectedRawEvidence = new Map([
  ['evidence/archive-dry-run-2026-07-10.yaml', '14d90ca6b55d966760afa6708def05d1aa27731ea25003836a4f9d22e74ef457'],
  ['evidence/governance-selftests-2026-07-10.yaml', 'bf828aa0cda16653d2f6a2d26bc7fb04645eb5e68c2bfa8ce4522eff9f4cf4ae'],
  ['evidence/playthru-environment-baseline/comparison.json', '7450e71a82477c047e6056605430b74f811c014c3b0d86ffdf39dc08db424b91'],
  ['evidence/playthru-environment-baseline/lifecycle-selftest.yaml', '4f11701a4532c3b8de0566d087717184bebc389a66391ba3845a972863744955'],
  ['evidence/playthru-environment-baseline/run-1/events.jsonl', 'e4e5b5943cb0cca969d8f033cc59f9b38e71e20b7edafa3f663045e02a6e0c3a'],
  ['evidence/playthru-environment-baseline/run-1/manifest.json', '04a099f0830c7a234c6a834ff2455d2cfa51a11d76bee76831efff77ff13a3e4'],
  ['evidence/playthru-environment-baseline/run-2/events.jsonl', '47b73728f4ca1a6695f4cfcabde3c3ce0eded1430ddb7e4e661556e3aa24f0c0'],
  ['evidence/playthru-environment-baseline/run-2/manifest.json', '490df612a29de17e8c3506fe9e08ef3df580f6dc0a41704b773b9da05471762e'],
  ['evidence/playthru-environment-baseline/visual-review.yaml', 'e0c3b0ccc3569b2a7fc91e85f773f49992b0181de2cbc121b778561b69aaf1d3']
]);

const expectedDeterministicTextOutputs = new Map([
  ['artifacts/walkthrough/generated/UABC-WT-ENV-001/captions.vtt', '92f6605065a69bbc4adffc3acc4768cd619a8ef5528f573792aa1c4824e64812'],
  ['artifacts/walkthrough/generated/UABC-WT-ENV-001/index.html', '25c7188863a8503799375130182bd7a43550a5905a8509abd5cd8746bc2c47ac'],
  ['artifacts/walkthrough/generated/UABC-WT-ENV-001/manifest.json', 'f7c5cd6bb675e7c5b753183432fb9f03f2e73e1713eb42a5e6fa7907a9ed275c'],
  ['exports/project-artifacts/v0.1/index.yaml', '55d89a7dbf00b628990e458226dbf808de3bc077c96f508a3eb26bfe42fba8d9']
]);

const expectedCheckoutBoundFiles = new Map([
  ...expectedRawEvidence,
  ...expectedDeterministicTextOutputs
]);

const expectedLfNormalizedFiles = new Set([
  'exports/project-data/v1/index.yaml',
  'exports/project-data/v1/twin-export-map.json',
  'evidence/simulation/project-reconciliation.json',
  'evidence/simulation/adapter-provenance.json',
  'evidence/simulation/spectra-0.9-conformance.yaml'
]);

const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

function parseExplicitBinaryRules(content) {
  const rules = new Set();
  const lfRules = new Set();
  const allPaths = new Set();
  const lines = String(content).split(/\r?\n/);
  if (lines.at(-1) === '') lines.pop();
  for (const [index, line] of lines.entries()) {
    assert.equal(line, line.trim(), `.gitattributes-Zeile ${index + 1} darf keinen Randabstand enthalten`);
    const parts = line.split(/\s+/);
    const relative = parts[0];
    assert.doesNotMatch(relative, /[*?\[]/, `${relative}: breite Muster sind fuer checkoutgebundene Bytes verboten`);
    assert.equal(allPaths.has(relative), false, `${relative}: Regel ist doppelt vorhanden`);
    allPaths.add(relative);

    if (parts.length === 2 && parts[1] === '-text') {
      assert.equal(expectedCheckoutBoundFiles.has(relative), true, `${relative}: unerwartete checkoutgebundene Byteregel`);
      rules.add(relative);
      continue;
    }
    if (parts.length === 3 && parts[1] === 'text' && parts[2] === 'eol=lf') {
      assert.equal(expectedLfNormalizedFiles.has(relative), true, `${relative}: unerwartete LF-Normalisierungsregel`);
      lfRules.add(relative);
      continue;
    }
    assert.fail(`${relative}: Attribut muss exakt -text oder text eol=lf sein`);
  }
  for (const relative of expectedCheckoutBoundFiles.keys()) {
    assert.equal(rules.has(relative), true, `${relative}: explizite -text-Regel fehlt`);
  }
  for (const relative of expectedLfNormalizedFiles) {
    assert.equal(lfRules.has(relative), true, `${relative}: explizite text eol=lf-Regel fehlt`);
  }
  assert.equal(rules.size, expectedCheckoutBoundFiles.size, 'Die .gitattributes muss exakt dreizehn checkoutgebundene Bytezeilen enthalten');
  assert.equal(lfRules.size, expectedLfNormalizedFiles.size, 'Die .gitattributes muss exakt fuenf deterministische LF-Regeln enthalten');
  return rules;
}

function validateBoundFiles({ rules, expectedFiles, readBytes, category }) {
  for (const [relative, expectedHash] of expectedFiles) {
    assert.equal(rules.has(relative), true, `${relative}: explizite -text-Regel fehlt`);
    const actualHash = sha256(readBytes(relative));
    assert.equal(actualHash, expectedHash, `${relative}: SHA-256 der Kategorie ${category} weicht von den gebundenen Git-Blobbytes ab`);
  }
  return expectedFiles.size;
}

const repositoryFixture = () => ({
  attributes: fs.readFileSync(attributePath, 'utf8'),
  readBytes: (relative) => fs.readFileSync(path.join(root, ...relative.split('/')))
});

test('neun historische Roh-Nachweise sind explizit als unveraenderte Blobbytes gebunden', () => {
  const fixture = repositoryFixture();
  const rules = parseExplicitBinaryRules(fixture.attributes);
  assert.equal(validateBoundFiles({ rules, expectedFiles: expectedRawEvidence, readBytes: fixture.readBytes, category: 'Roh-Nachweis' }), 9);
});

test('vier deterministische Textausgaben sind getrennt als unveraenderte Blobbytes gebunden', () => {
  const fixture = repositoryFixture();
  const rules = parseExplicitBinaryRules(fixture.attributes);
  assert.equal(validateBoundFiles({ rules, expectedFiles: expectedDeterministicTextOutputs, readBytes: fixture.readBytes, category: 'deterministische Textausgabe' }), 4);
});

test('fehlende doppelte und breite Attributregeln scheitern geschlossen', () => {
  const fixture = repositoryFixture();
  const lines = fixture.attributes.trimEnd().split(/\r?\n/);
  assert.throws(
    () => parseExplicitBinaryRules(lines.slice(1).join('\n')),
    /explizite -text-Regel fehlt|exakt dreizehn/
  );
  assert.throws(
    () => parseExplicitBinaryRules(`${lines.slice(0, -1).join('\n')}\n${lines[0]}\n`),
    /doppelt vorhanden/
  );
  assert.throws(
    () => parseExplicitBinaryRules(`${lines.slice(0, -1).join('\n')}\nevidence/** -text\n`),
    /breite Muster/
  );
});

test('fuenf Integrationsartefakte sind exakt und ohne breite Muster auf LF normalisiert', () => {
  const fixture = repositoryFixture();
  assert.doesNotThrow(() => parseExplicitBinaryRules(fixture.attributes));
  const lines = fixture.attributes.trimEnd().split(/\r?\n/);
  const lfLines = lines.filter((line) => line.endsWith(' text eol=lf'));
  assert.equal(lfLines.length, 5);
  assert.deepEqual(new Set(lfLines.map((line) => line.split(' ')[0])), expectedLfNormalizedFiles);
  assert.throws(
    () => parseExplicitBinaryRules(`${fixture.attributes.trimEnd()}\nexports/project-data/v1/** text eol=lf\n`),
    /breite Muster/
  );
});

test('veraenderte Roh-Nachweisbytes scheitern auch ohne Git-Verzeichnis', () => {
  const fixture = repositoryFixture();
  const rules = parseExplicitBinaryRules(fixture.attributes);
  const manipulatedPath = 'evidence/playthru-environment-baseline/run-1/manifest.json';
  assert.throws(
    () => validateBoundFiles({
      rules,
      expectedFiles: expectedRawEvidence,
      category: 'Roh-Nachweis',
      readBytes(relative) {
        const bytes = fixture.readBytes(relative);
        return relative === manipulatedPath ? Buffer.concat([bytes, Buffer.from('\n')]) : bytes;
      }
    }),
    /SHA-256 der Kategorie Roh-Nachweis weicht von den gebundenen Git-Blobbytes ab/
  );
});

test('veraenderte deterministische Textausgaben scheitern auch ohne Git-Verzeichnis', () => {
  const fixture = repositoryFixture();
  const rules = parseExplicitBinaryRules(fixture.attributes);
  const manipulatedPath = 'artifacts/walkthrough/generated/UABC-WT-ENV-001/index.html';
  assert.throws(
    () => validateBoundFiles({
      rules,
      expectedFiles: expectedDeterministicTextOutputs,
      category: 'deterministische Textausgabe',
      readBytes(relative) {
        const bytes = fixture.readBytes(relative);
        return relative === manipulatedPath ? Buffer.concat([bytes, Buffer.from('\n')]) : bytes;
      }
    }),
    /SHA-256 der Kategorie deterministische Textausgabe weicht von den gebundenen Git-Blobbytes ab/
  );
});
