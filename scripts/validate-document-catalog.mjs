import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import { parseGitTreeEntry } from './lib/snapshot-contract.mjs';
import {
  DOCUMENT_CATALOG_ERROR,
  DOCUMENT_CATALOG_PATH,
  DOCUMENT_CATALOG_SCHEMA_PATH,
  buildDocumentCatalog,
  canonicalCatalogBytes,
  formatDocumentCatalogErrors,
  validateDocumentCatalog
} from './lib/document-catalog.mjs';

const git = (args, options = {}) => execFileSync('git', args, { ...options, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
const gitText = (args) => git(args, { encoding: 'utf8' }).trim();
const dirty = gitText(['status', '--porcelain']);
if (dirty !== '') {
  console.error('Dokumentkatalogpruefung fehlgeschlagen: Die Arbeitskopie ist nicht sauber.');
  process.exit(1);
}

const commit = gitText(['rev-parse', 'HEAD']);
const branch = gitText(['branch', '--show-current']);
const blob = (relative) => git(['show', `${commit}:${relative}`]);
const readEntry = (relative) => {
  const bytes = blob(relative);
  const entry = parseGitTreeEntry(git(['ls-tree', '-l', commit, '--', relative], { encoding: 'utf8' }), relative);
  return { bytes, gitMode: entry.gitMode };
};

try {
  const index = YAML.parse(readEntry('exports/project-data/v1/index.yaml').bytes.toString('utf8'));
  const schema = JSON.parse(readEntry(DOCUMENT_CATALOG_SCHEMA_PATH).bytes.toString('utf8'));
  const catalogBytes = readEntry(DOCUMENT_CATALOG_PATH).bytes;
  const catalog = JSON.parse(catalogBytes.toString('utf8'));
  const errors = validateDocumentCatalog({ catalog, schema, projectIndex: index, readEntry });
  if (![index.allowedBranch, index.deliveryBranch].includes(branch)) errors.push({ code: DOCUMENT_CATALOG_ERROR.identity, message: `Aktueller Branch ${branch} ist weder Consumer-Producerbranch noch Delivery-Branch` });
  const expected = canonicalCatalogBytes(buildDocumentCatalog(index, readEntry));
  if (!catalogBytes.equals(expected)) errors.push({ code: DOCUMENT_CATALOG_ERROR.hash, message: 'Katalogbytes sind nicht die deterministische Projektion der Commit-Blobs' });
  if (errors.length > 0) {
    console.error(`Dokumentkatalogpruefung fehlgeschlagen (${errors.length}):`);
    for (const line of formatDocumentCatalogErrors(errors)) console.error(`- ${line}`);
    process.exit(1);
  }
  console.log(`Dokumentkatalogpruefung bestanden: Commit=${commit}; Dokumente=${catalog.documentCount}; strukturierte Seiten=${catalog.confluenceDocumentCount}; Spaces=${catalog.spaces.length}; Migrationseintraege=${catalog.redirects.length}; externe Origins=${catalog.allowedExternalOrigins.length}.`);
} catch (error) {
  console.error(`Dokumentkatalogpruefung fehlgeschlagen: ${error.message}`);
  process.exit(1);
}
