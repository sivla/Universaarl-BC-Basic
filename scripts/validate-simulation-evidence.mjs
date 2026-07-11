import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import YAML from 'yaml';

const root = process.cwd();
const errors = [];
const readYaml = (relative) => {
  const file = path.join(root, relative);
  if (!existsSync(file)) {
    errors.push(`Quelle fehlt: ${relative}`);
    return null;
  }
  try { return YAML.parse(readFileSync(file, 'utf8')); } catch (error) {
    errors.push(`YAML unlesbar ${relative}: ${error.message}`);
    return null;
  }
};

const register = readYaml('evidence/simulation/phase-gate-register.yaml');
const completion = readYaml('evidence/simulation/project-completion.yaml');
const demo = readYaml('evidence/simulation/demo-readiness.yaml');
const index = readYaml('exports/project-data/v1/index.yaml');

if (register) {
  if (register.status !== 'synthetisch-vollstaendig-abgenommen') errors.push('Phasenregister ist nicht synthetisch vollständig abgenommen.');
  if (register.phases?.length !== 13) errors.push(`Phasenregister muss 13 Phasen enthalten, gefunden: ${register.phases?.length ?? 0}.`);
  for (const phase of register.phases ?? []) {
    if (phase.result !== 'simulated-complete' && phase.result !== 'P1-P2-synthetisch-bereinigt') errors.push(`Phase ${phase.phase} ist nicht abgeschlossen: ${phase.result}.`);
    for (const source of phase.source ?? []) {
      const sourcePath = source.endsWith('/') ? source.slice(0, -1) : source;
      if (!existsSync(path.join(root, sourcePath))) errors.push(`Phasenquelle fehlt: ${source}`);
    }
  }
  if (register.controls?.openP1P2 !== 0) errors.push('Offene P1/P2-Simulationsdefects sind nicht null.');
  if (register.finalDecision !== 'GO_SIMULATION') errors.push('Phasenregister liefert kein GO_SIMULATION.');
  for (const gate of register.gateRegister ?? []) {
    if (!gate.evidence || !existsSync(path.join(root, gate.evidence))) errors.push(`Gate-Evidence fehlt: ${gate.id}`);
    if (!gate.decision) errors.push(`Gate ohne Entscheidung: ${gate.id}`);
  }
}

if (completion) {
  if (completion.classification !== 'synthetic-only' || completion.realBcExecution !== false) errors.push('Completion-Evidence verletzt die synthetische Wahrheitsgrenze.');
  if (completion.goLiveSimulation?.result !== 'GO_SIMULATION') errors.push('Completion-Evidence enthält kein GO_SIMULATION.');
  if (completion.handover?.acceptance !== 'synthetisch-abgenommen') errors.push('Handover ist nicht synthetisch abgenommen.');
}
if (demo) {
  if (demo.result !== 'GO_SIMULATION') errors.push('Demo-Readiness ist nicht GO_SIMULATION.');
  if (demo.checks?.realBcExecution !== false) errors.push('Demo-Readiness behauptet reale BC-Ausführung.');
}
if (index) {
  const paths = new Set((index.artifacts ?? []).map((artifact) => artifact.path));
  for (const required of ['evidence/simulation/phase-gate-register.yaml', 'evidence/simulation/end-to-end-objective-audit.yaml', 'evidence/simulation/demo-readiness.yaml']) {
    if (!paths.has(required)) errors.push(`Index-Allowlist fehlt: ${required}`);
  }
}

if (errors.length) {
  console.error(`Simulations-Evidence-Pruefung fehlgeschlagen (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Simulations-Evidence-Pruefung bestanden: 13 Phasen, Gates, GO_SIMULATION und Wahrheitsgrenzen konsistent.');
