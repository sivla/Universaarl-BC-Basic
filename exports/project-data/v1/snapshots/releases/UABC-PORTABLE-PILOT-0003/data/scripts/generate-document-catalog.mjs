import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import {
  DOCUMENT_CATALOG_PATH,
  DOCUMENT_CATALOG_SCHEMA_PATH,
  buildDocumentCatalog,
  canonicalCatalogBytes,
  formatDocumentCatalogErrors,
  validateDocumentCatalog
} from './lib/document-catalog.mjs';

const root = process.cwd();
const absolute = (relative) => path.join(root, ...relative.split('/'));
const readEntry = (relative) => {
  const raw = execFileSync('git', ['ls-files', '--stage', '--', relative], { encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }).trimEnd();
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const match = lines.length === 1 ? lines[0].match(/^100644 [a-f0-9]{40} 0\t(.+)$/) : null;
  if (!match || match[1] !== relative) throw new Error(`${relative}: Quelle ist im Git-Index kein exakter regulaerer 100644-Blob`);
  const bytes = execFileSync('git', ['show', `:${relative}`], { env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  return { bytes, gitMode: '100644' };
};

const index = YAML.parse(readEntry('exports/project-data/v1/index.yaml').bytes.toString('utf8'));
const schema = JSON.parse(readEntry(DOCUMENT_CATALOG_SCHEMA_PATH).bytes.toString('utf8'));
const generated = buildDocumentCatalog(index, readEntry);
const errors = validateDocumentCatalog({ catalog: generated, schema, projectIndex: index, readEntry });
if (errors.length > 0) throw new Error(`Dokumentkatalog kann nicht erzeugt werden:\n${formatDocumentCatalogErrors(errors).join('\n')}`);

const bytes = canonicalCatalogBytes(generated);
const current = fs.readFileSync(absolute(DOCUMENT_CATALOG_PATH));
if (process.argv.includes('--write')) {
  fs.writeFileSync(absolute(DOCUMENT_CATALOG_PATH), bytes);
  console.log(`Dokumentkatalog deterministisch erzeugt: ${generated.documentCount} Dokumente, ${generated.confluenceDocumentCount} strukturierte Seiten, ${generated.spaces.length} Spaces und ${generated.redirects.length} Migrationseintraege.`);
} else if (!current.equals(bytes)) {
  throw new Error('Dokumentkatalog ist nicht deterministisch aktuell. Bitte npm run generate:document-catalog ausfuehren.');
} else {
  console.log(`Dokumentkatalog ist deterministisch aktuell: ${generated.documentCount} Dokumente in ${generated.spaces.length} Spaces.`);
}
