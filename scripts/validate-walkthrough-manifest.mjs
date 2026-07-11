import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import YAML from 'yaml';

const root = process.cwd();
const schemaFile = 'artifacts/walkthrough/schema/walkthrough-package.schema.json';

const shown = (value, fallback = '<unbekannt>') => value === undefined || value === null || value === '' ? fallback : String(value);

export function formatAjvError(error) {
  const keyword = shown(error?.keyword);
  const params = error?.params ?? {};
  const messages = {
    additionalProperties: () => `enthaelt das nicht erlaubte zusaetzliche Feld ${shown(params.additionalProperty)}`,
    required: () => `muss das Pflichtfeld ${shown(params.missingProperty)} enthalten`,
    type: () => `muss den technischen Typ ${shown(params.type)} besitzen`,
    const: () => 'muss dem festgelegten Wert entsprechen',
    enum: () => 'muss einem der erlaubten Werte entsprechen',
    minItems: () => `muss mindestens ${shown(params.limit)} Eintraege enthalten`,
    maxItems: () => `darf hoechstens ${shown(params.limit)} Eintraege enthalten`,
    minLength: () => `muss mindestens ${shown(params.limit)} Zeichen enthalten`,
    maxLength: () => `darf hoechstens ${shown(params.limit)} Zeichen enthalten`,
    minimum: () => `darf nicht kleiner als ${shown(params.limit)} sein`,
    maximum: () => `darf nicht groesser als ${shown(params.limit)} sein`,
    exclusiveMinimum: () => `muss groesser als ${shown(params.limit)} sein`,
    exclusiveMaximum: () => `muss kleiner als ${shown(params.limit)} sein`,
    pattern: () => `muss dem technischen Muster ${shown(params.pattern)} entsprechen`,
    format: () => `muss dem technischen Format ${shown(params.format)} entsprechen`,
    uniqueItems: () => 'darf keine doppelten Eintraege enthalten',
    oneOf: () => 'muss genau eine der erlaubten Schemaformen erfuellen',
    anyOf: () => 'muss mindestens eine der erlaubten Schemaformen erfuellen',
    allOf: () => 'muss alle vorgegebenen Schemaformen erfuellen',
    not: () => 'darf die ausgeschlossene Schemaform nicht erfuellen'
  };
  const detail = messages[keyword]?.() ?? 'verletzt eine nicht eigens uebersetzte Schemaregel';
  return `${error?.instancePath || '/'} ${detail} [keyword=${keyword}]`;
}

export function createWalkthroughValidator() {
  const schema = JSON.parse(fs.readFileSync(path.resolve(root, schemaFile), 'utf8'));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  ajv.addFormat('date', /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/);
  const validate = ajv.compile(schema);
  return (document, label = 'Walkthrough-Manifest') => {
    if (!validate(document)) throw new Error(`${label} verletzt das Walkthrough-Schema: ${validate.errors.map(formatAjvError).join('; ')}`);
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
