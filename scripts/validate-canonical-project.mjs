import { readFileSync } from 'node:fs';
import path from 'node:path';
import { validateStory } from './validate-project-story.mjs';

const root = process.cwd();
const json = (p) => JSON.parse(readFileSync(path.join(root, p), 'utf8'));
const story = json('evidence/simulation/project-story.json');
const errors = validateStory(story);
const plan = readFileSync(path.join(root, 'project/bc-basic/project-plan.yaml'), 'utf8');
const billing = readFileSync(path.join(root, 'project/bc-basic/billing.yaml'), 'utf8');
const deliverables = readFileSync(path.join(root, 'project/bc-basic/deliverables.yaml'), 'utf8');
const text = `${plan}\n${billing}\n${deliverables}`;
if (!/simulated-complete|synthetic-closed/.test(text)) errors.push('Projektplan, Abrechnung und Liefergegenstaende tragen keinen synthetischen Abschlussstatus.');
if (/current-pilot-planning|PILOT_NOT_READY|actual_hours:\s*2\.5|actual_cost:\s*300/.test(text)) errors.push('Veraltete aktive Pilot- oder Istwerte sind im aktuellen Vertrag enthalten.');
if (story.controls?.realLiveGates !== 8) errors.push('Die acht realen Folgegates fehlen.');
if (story.controls?.realBcExecution !== false || story.controls?.currentAuthority !== true) errors.push('Truth-Boundary oder currentAuthority ist nicht fail-closed.');
if (errors.length) { console.error(`Kanonische Projektpruefung fehlgeschlagen (${errors.length}):`); errors.forEach((e) => console.error(`- ${e}`)); process.exit(1); }
console.log('Kanonische Projektpruefung bestanden: eine synthetisch abgeschlossene Wahrheit, acht reale Folgegates offen.');
