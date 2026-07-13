import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import YAML from 'yaml';
import { PROJECTION_PATH, SCHEMA_PATH, INDEX_PATH, MAP_PATH, PROVENANCE_PATH, CONFORMANCE_PATH } from './generate-setup-wave-1-export.mjs';
import { buildTwinExportMap, lfBytes } from './generate-spectra-0.10-integration.mjs';
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
export function validateProjection(projection, schema) {
  const errors = [];
  const valid = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
  if (!valid(projection)) errors.push(...(valid.errors ?? []).map((error) => `${error.instancePath} ${error.message}`));
  if (projection.writesAuthorized !== false || projection.writeGate?.noGoSteps?.length !== 17) errors.push('SCHREIBSPERRE');
  return errors;
}
export function validateAdapterProvenance({ provenance, indexBytes, mapBytes, conformance = null }) {
  const errors = [];
  if (provenance?.source?.blob_path !== INDEX_PATH || provenance?.projection?.projection_path !== MAP_PATH) errors.push('ADAPTER_ZIELBINDUNG');
  if (provenance?.source?.source_hash !== sha256(indexBytes)) errors.push(`ADAPTER_QUELL_DIGEST: ${sha256(indexBytes)}`);
  if (provenance?.source?.source_hash_after !== provenance?.source?.source_hash) errors.push('ADAPTER_QUELL_MUTATION');
  if (provenance?.projection?.digest_algorithm !== 'SHA-256' || provenance?.projection?.projection_digest !== sha256(mapBytes)) errors.push(`ADAPTER_PROJEKTIONS_DIGEST: ${sha256(mapBytes)}`);
  if (conformance && (conformance.adapterProvenance?.sourceHash !== provenance?.source?.source_hash || conformance.adapterProvenance?.projectionDigest !== provenance?.projection?.projection_digest)) errors.push('KONFORMITAET_ADAPTER_DIGEST');
  return errors;
}
export function validateExport(root = process.cwd()) {
  const projection = JSON.parse(fs.readFileSync(path.join(root, PROJECTION_PATH), 'utf8'));
  const schema = JSON.parse(fs.readFileSync(path.join(root, SCHEMA_PATH), 'utf8'));
  const errors = validateProjection(projection, schema);
  const indexBytes = lfBytes(fs.readFileSync(path.join(root, INDEX_PATH)));
  const index = YAML.parse(indexBytes.toString('utf8'));
  const map = JSON.parse(fs.readFileSync(path.join(root, MAP_PATH), 'utf8'));
  const mapBytes = fs.readFileSync(path.join(root, MAP_PATH));
  const provenance = JSON.parse(fs.readFileSync(path.join(root, PROVENANCE_PATH), 'utf8'));
  const conformance = YAML.parse(fs.readFileSync(path.join(root, CONFORMANCE_PATH), 'utf8'));
  if (JSON.stringify(map) !== JSON.stringify(buildTwinExportMap(index))) errors.push('EXPORTMAP_INDEX_BINDUNG');
  errors.push(...validateAdapterProvenance({ provenance, indexBytes, mapBytes, conformance }));
  for (const file of [PROJECTION_PATH, SCHEMA_PATH, 'scripts/generate-setup-wave-1-export.mjs', 'scripts/validate-setup-wave-1-export.mjs', 'tests/governance/setup-wave-1-export.test.mjs']) { if (!index.artifacts.some((item) => item.path === file) || !map.artifacts.some((item) => item.path === file)) errors.push(`POSITIVLISTE ${file}`); }
  return errors;
}
if (process.argv[1]?.endsWith('validate-setup-wave-1-export.mjs')) { const errors = validateExport(); if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; } else console.log('Setup-Wave-1-Export bestanden.'); }
