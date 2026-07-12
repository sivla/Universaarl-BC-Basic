import fs from 'node:fs';

// Einmalige, fachlich freigegebene Migration der alten Arbeitspaket-Referenzen.
// Die kanonische Story, der Jira-Export und die Provenienzmatrix werden bewusst
// nicht textuell umgeschrieben.
const files = [
  'docs/guides/beginner/business-central-basic.md',
  'docs/runbooks/business-central-basic.md',
  'project/bc-basic/uat-training-run.yaml',
  'project/bc-basic/traceability-matrix.yaml',
  'project/bc-basic/bc-playthrough-catalog.yaml',
  'project/bc-basic/decision-register.yaml',
  'playwright/scenarios/bc-basic-e2e.yaml',
  ...fs.readdirSync('atlassian/confluence/pages').filter((name) => name.endsWith('.md')).map((name) => `atlassian/confluence/pages/${name}`)
];
const replacements = new Map([
  ['22', '32'], ['23', '34'], ['24', '35, UABC-36, UABC-37'], ['25', '38'], ['26', '33'],
  ['27', '39'], ['28', '40'], ['29', '41'], ['30', '42'], ['31', '43'], ['32', '44'],
  ['33', '45'], ['34', '46'], ['35', '47'], ['36', '48'], ['37', '49'], ['38', '50']
]);
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const migrated = source.replace(/UABC-(22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38)\b/g, (_, number) => `UABC-${replacements.get(number)}`);
  if (migrated !== source) fs.writeFileSync(file, migrated);
}
console.log(`Aktive fachliche Referenzen in ${files.length} sichtbaren Quellen migriert.`);
