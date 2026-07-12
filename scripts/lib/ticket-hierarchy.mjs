export const PHASES = Object.freeze([
  { id:'UABC-PHASE-1', code:'P1', title:'Phase 1 – Vorbereitung und Datenbereitschaft', order:1, start:'2026-04-06', end:'2026-04-24', status:'done', estimateHours:22, actualHours:22, remainingHours:0, netAmount:2640 },
  { id:'UABC-PHASE-2', code:'P2', title:'Phase 2 – Einrichtung, Tests und Schulung', order:2, start:'2026-04-27', end:'2026-05-08', status:'done', estimateHours:40, actualHours:40, remainingHours:0, netAmount:4800 },
  { id:'UABC-PHASE-3', code:'P3', title:'Phase 3 – Hypercare und Abschluss', order:3, start:'2026-05-11', end:'2026-05-15', status:'done', estimateHours:18, actualHours:18, remainingHours:0, netAmount:2160 }
].map(Object.freeze));

export const EPIC_DEFINITIONS = Object.freeze([
  ['TKT-UABC-EPIC-PROJECT','Projektsteuerung und Scope'],
  ['TKT-UABC-EPIC-FINANCE','Finanzwesen und Steuern'],
  ['TKT-UABC-EPIC-PURCHASING','Einkauf'],
  ['TKT-UABC-EPIC-SALES','Verkauf und Zahlungseingang'],
  ['TKT-UABC-EPIC-INVENTORY','Lager und Inventur'],
  ['TKT-UABC-EPIC-DATA','Stammdaten und Migration'],
  ['TKT-UABC-EPIC-ENABLEMENT','Test, UAT und Schulung'],
  ['TKT-UABC-EPIC-TRANSITION','Go-live, Hypercare und Betriebsübergabe']
].map(Object.freeze));

export const RESULT_DEFINITIONS = Object.freeze([
  ['TKT-UABC-STORY-P1-PROJECT','story','TKT-UABC-EPIC-PROJECT','UABC-PHASE-1','Projektauftrag und Scope sind startklar',['TKT-UABC-22']],
  ['TKT-UABC-STORY-P1-ACCEPTANCE','story','TKT-UABC-EPIC-PROJECT','UABC-PHASE-1','Abnahme- und Cutover-Eintritt ist vorbereitet',['TKT-UABC-26']],
  ['TKT-UABC-STORY-P1-FINANCE','story','TKT-UABC-EPIC-FINANCE','UABC-PHASE-1','Finance- und Steuerdesign ist entschieden',['TKT-UABC-23']],
  ['TKT-UABC-STORY-P1-PURCHASING','story','TKT-UABC-EPIC-PURCHASING','UABC-PHASE-1','Einkaufsstandard ist entschieden',['TKT-UABC-24']],
  ['TKT-UABC-STORY-P1-SALES','story','TKT-UABC-EPIC-SALES','UABC-PHASE-1','Verkaufsstandard ist entschieden',['TKT-UABC-24-SALES']],
  ['TKT-UABC-STORY-P1-INVENTORY','story','TKT-UABC-EPIC-INVENTORY','UABC-PHASE-1','Lagerstandard ist entschieden',['TKT-UABC-24-INVENTORY']],
  ['TKT-UABC-STORY-P1-DATA','story','TKT-UABC-EPIC-DATA','UABC-PHASE-1','Datenpaket ist bereit',['TKT-UABC-25']],
  ['TKT-UABC-STORY-P2-FOUNDATION','story','TKT-UABC-EPIC-PROJECT','UABC-PHASE-2','Gesellschaft, Rollen und Basis sind eingerichtet',['TKT-UABC-27']],
  ['TKT-UABC-STORY-P2-FINANCE','story','TKT-UABC-EPIC-FINANCE','UABC-PHASE-2','Finance, VAT und SoD sind eingerichtet',['TKT-UABC-28']],
  ['TKT-UABC-STORY-P2-DATA','story','TKT-UABC-EPIC-DATA','UABC-PHASE-2','Migration und Eröffnungswerte sind abgestimmt',['TKT-UABC-29']],
  ['TKT-UABC-STORY-P2-PURCHASING','story','TKT-UABC-EPIC-PURCHASING','UABC-PHASE-2','Purchase-to-Pay ist durchgespielt',['TKT-UABC-30']],
  ['TKT-UABC-STORY-P2-SALES','story','TKT-UABC-EPIC-SALES','UABC-PHASE-2','Order-to-Cash ist durchgespielt',['TKT-UABC-31']],
  ['TKT-UABC-STORY-P2-INVENTORY','story','TKT-UABC-EPIC-INVENTORY','UABC-PHASE-2','Lager und Inventur sind abgestimmt',['TKT-UABC-32']],
  ['TKT-UABC-STORY-P2-TRAINING','story','TKT-UABC-EPIC-ENABLEMENT','UABC-PHASE-2','Key User sind befähigt',['TKT-UABC-33']],
  ['TKT-UABC-STORY-P2-UAT','story','TKT-UABC-EPIC-ENABLEMENT','UABC-PHASE-2','SIT, UAT und Cutover-Probe sind bestanden',['TKT-UABC-34']],
  ['TKT-UABC-BUG-P3-PAYMENT','bug','TKT-UABC-EPIC-TRANSITION','UABC-PHASE-3','Zahlungsreferenz-Abweichung ist behoben',['TKT-UABC-35']],
  ['TKT-UABC-STORY-P3-CLOSE','story','TKT-UABC-EPIC-FINANCE','UABC-PHASE-3','Monatsabschluss und UStVA-Vorschau sind abgestimmt',['TKT-UABC-36','TKT-UABC-37']],
  ['TKT-UABC-STORY-P3-HANDOVER','story','TKT-UABC-EPIC-TRANSITION','UABC-PHASE-3','Betrieb und Abschluss sind übergeben',['TKT-UABC-38']]
].map(Object.freeze));

export const TASK_PARENT = Object.freeze(Object.fromEntries(RESULT_DEFINITIONS.flatMap(([id,,,,,tasks]) => tasks.map((task) => [task,id]))));
export const PHASE_BY_RESULT = Object.freeze(Object.fromEntries(RESULT_DEFINITIONS.map(([id,,,phaseId]) => [id,phaseId])));
