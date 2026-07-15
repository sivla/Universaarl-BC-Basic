import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { validateReadiness } from './lib/real-onboarding-readiness-v5.mjs';

const root = process.cwd();
const source = YAML.parse(fs.readFileSync(path.join(root, 'project/bc-basic/real-onboarding-readiness-v5.yaml'), 'utf8'));
const journal = JSON.parse(fs.readFileSync(path.join(root, 'evidence/simulation/operating-cycle-v4.json'), 'utf8'));
const current = JSON.parse(fs.readFileSync(path.join(root, 'exports/project-data/v1/snapshots/current.json'), 'utf8'));
const candidate = JSON.parse(fs.readFileSync(path.join(root, 'exports/project-data/v1/snapshots/current-v5.candidate.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, candidate.manifestPath), 'utf8'));
const errors = validateReadiness({ source, journal, current, candidate, manifest, root });
if (errors.length) { console.error(`V5-Readinessprüfung fehlgeschlagen (${errors.length}):`); errors.forEach(e => console.error(`- ${e}`)); process.exit(1); }
console.log(`V5-Readinessprüfung bestanden: dualer Status, 8 offene Realgates, 3 Aktionen, 80h Plan / ${source.financials.actualHours}h Ist / ${source.financials.actualNetAmount} EUR, V4 current, V5 Kandidat.`);
