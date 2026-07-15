import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { canonicalBundleDigest, sha256 } from './lib/twin-catalog-digest.mjs';

const root = process.cwd();
const errors = [];
const readJson = (relative) => { try { return JSON.parse(readFileSync(path.join(root, relative), 'utf8')); } catch (error) { errors.push(`${relative}: ${error.message}`); return null; } };
const safe = (relative) => typeof relative === 'string' && !path.isAbsolute(relative) && !relative.includes('\\') && relative.split('/').every((part) => part && part !== '.' && part !== '..');
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const pointerPath = process.env.TWIN_POINTER_PATH || 'exports/project-data/v1/snapshots/current.json';
const pointer = readJson(pointerPath);
if (!pointer || pointer.pointerContract !== 'uabc-customer-catalog-current-v1' || pointer.customerId !== 'UABC-CUSTOMER-001' || pointer.requiresGit !== false || pointer.readOnly !== true) errors.push('Current-Zeiger verletzt Kundenkatalog-, Git-unabhaengigen oder Read-only-Vertrag.');
if (pointer && (!safe(pointer.releasePath) || !safe(pointer.manifestPath) || !pointer.releasePath.startsWith('exports/project-data/v1/snapshots/releases/'))) errors.push('Current-Zeiger enthaelt keinen sicheren Releasepfad.');
const manifest = pointer ? readJson(pointer.manifestPath) : null;
if (!manifest || manifest.releaseId !== pointer?.currentReleaseId || manifest.customerId !== pointer?.customerId || manifest.immutable !== true || manifest.readOnly !== true || manifest.runtime?.requiresGit !== false) errors.push('Releasemanifest ist nicht unveraenderlich, kundenisoliert oder Git-unabhaengig.');
if (manifest && sha(readFileSync(path.join(root, pointer.manifestPath))) !== pointer.manifestSha256) errors.push('Manifest-Digest des Current-Zeigers stimmt nicht.');
if (manifest && (!Array.isArray(manifest.projects) || !Array.isArray(manifest.supportEngagements) || manifest.projects.length !== 1 || manifest.supportEngagements.length !== 1)) errors.push('Katalog muss genau das belegte Projekt und die eine simulierte Supportuebergabe enthalten.');
if (manifest && manifest.projects.some((p) => p.customerId && p.customerId !== manifest.customerId) || manifest?.supportEngagements?.some((s) => s.customerId && s.customerId !== manifest.customerId)) errors.push('Cross-Customer-Referenz erkannt.');
const releaseRoot = pointer ? path.dirname(path.join(root, pointer.manifestPath)) : root;
if (manifest) {
  const indexFile = path.join(releaseRoot, manifest.projectIndexPath);
  const resourceFile = path.join(releaseRoot, manifest.resourceCatalogPath);
  if (!existsSync(indexFile) || !existsSync(resourceFile)) errors.push('Projektindex oder Ressourcenkatalog fehlt im Release.');
  if (manifest.releaseId?.endsWith('-V1')) {
    // Historischer V1 bleibt bytegenau und besitzt noch keine separaten Bindungsobjekte.
  } else {
    for (const [name, fallbackPath] of [['projectIndex', manifest.projectIndexPath], ['resourceCatalog', manifest.resourceCatalogPath]]) {
      const binding = manifest[name];
      const target = binding?.path ?? fallbackPath;
      if (!binding || !safe(target) || target !== fallbackPath || !Number.isInteger(binding.sizeBytes) || !/^[a-f0-9]{64}$/u.test(binding.sha256 ?? '')) errors.push(`${name}-Bindungsobjekt unvollständig.`);
      else {
        const bytes = readFileSync(path.join(releaseRoot, target));
        if (bytes.length !== binding.sizeBytes || sha(bytes) !== binding.sha256) errors.push(`${name}-Digest oder Größe falsch.`);
      }
    }
  }
  const resources = existsSync(resourceFile) ? JSON.parse(readFileSync(resourceFile, 'utf8')) : null;
  if (!resources || resources.readOnly !== true || resources.customerId !== manifest.customerId) errors.push('Ressourcenkatalog verletzt Read-only-/Kundenvertrag.');
  const seen = new Set();
  for (const record of manifest.records ?? []) {
    if (!safe(record.payloadPath) || seen.has(record.payloadPath)) errors.push(`Unsicherer oder doppelter Payloadpfad: ${record.payloadPath}`);
    seen.add(record.payloadPath);
    const file = path.join(releaseRoot, record.payloadPath);
    if (!existsSync(file)) { errors.push(`Payload fehlt: ${record.payloadPath}`); continue; }
    const bytes = readFileSync(file);
    if (bytes.length !== record.sizeBytes || sha(bytes) !== record.sha256) errors.push(`Payload-Digest oder Groesse falsch: ${record.payloadPath}`);
  }
  // V1 ist ein unveränderlicher Last-known-good-Bestand mit historischer Digestformel.
  // Neue Releases (einschließlich V2) müssen ausschließlich die kanonische Formel nutzen.
  const actual = manifest.releaseId?.endsWith('-V1')
    ? sha(Buffer.from((manifest.records ?? []).map((r) => `${r.payloadPath}\0${r.sizeBytes}\0${r.sha256}`).join('\n'), 'utf8'))
    : canonicalBundleDigest(manifest.records ?? []);
  if (actual !== manifest.payloadBundleDigest || actual !== pointer.payloadBundleDigest) errors.push('Payload-Bundle-Digest stimmt nicht.');
  if (manifest.catalogAggregateDigest) {
    const aggregate = sha(Buffer.from(`project-index.yaml\0${manifest.projectIndex.sha256}\nresource-catalog.json\0${manifest.resourceCatalog.sha256}\npayload-bundle\0${actual}\n`, 'utf8'));
    if (aggregate !== manifest.catalogAggregateDigest || aggregate !== pointer.catalogAggregateDigest) errors.push('Katalog-Aggregatdigest stimmt nicht.');
  }
}
if (errors.length) { console.error(`Git-unabhaengige Twin-Katalogpruefung fehlgeschlagen (${errors.length}):`); errors.forEach((e) => console.error(`- ${e}`)); process.exit(1); }
console.log(`Git-unabhaengige Twin-Katalogpruefung bestanden: Release=${pointer.currentReleaseId}; Kunde=${pointer.customerId}; Artefakte=${pointer.artifactCount}; Git-Lesezugriff=nein.`);
