import process from 'node:process';

export const HISTORICAL_ONE_TIME_MIGRATION = Object.freeze({
  migrationId: 'UABC-TICKET-MIGRATION-2026-07-12',
  status: 'completed-historical',
  activeExecutionAllowed: false,
  provenanceContract: 'project/bc-basic/ticket-migration.yaml'
});

export function assertMigrationLocked() {
  throw new Error('Die historische Einmalmigration UABC-TICKET-MIGRATION-2026-07-12 ist gesperrt. Der aktive Pilotvertrag darf ausschließlich über den aktuellen Rebaseline-Generator fortgeschrieben werden.');
}

if (process.argv[1]?.endsWith('migrate-uabc-ticket-story.mjs')) {
  try { assertMigrationLocked(); }
  catch (error) { console.error(error.message); process.exit(2); }
}
