import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import YAML from 'yaml';

const root = process.cwd();
const schemaFile = 'artifacts/walkthrough/schema/walkthrough-package.schema.json';
export function createWalkthroughValidator() {
  const schema = JSON.parse(fs.readFileSync(path.resolve(root, schemaFile), 'utf8'));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  ajv.addFormat('date', /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/);
  const validate = ajv.compile(schema);
  return (document, label = 'Walkthrough-Manifest') => {
    if (!validate(document)) throw new Error(`${label} verletzt das Walkthrough-Schema: ${validate.errors.map((e) => `${e.instancePath || '/'} ${e.message}`).join('; ')}`);
    return document;
  };
}
export function loadAndValidateWalkthrough(filePath) {
  return createWalkthroughValidator()(YAML.parse(fs.readFileSync(path.resolve(root, filePath), 'utf8')), filePath);
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) throw new Error('Aufruf: node scripts/validate-walkthrough-manifest.mjs <manifest.yaml>');
  console.log(JSON.stringify({ valid: true, artifactId: loadAndValidateWalkthrough(process.argv[2]).artifactId }));
}
