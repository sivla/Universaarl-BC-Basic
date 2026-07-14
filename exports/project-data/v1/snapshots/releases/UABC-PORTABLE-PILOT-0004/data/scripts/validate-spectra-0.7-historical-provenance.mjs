import fs from 'node:fs';
import process from 'node:process';

export const HISTORICAL_PROVENANCE_ONLY = true;

export function validateHistoricalSpectra07(story) {
  const errors = [];
  const versions = story?.historicalOfferVersions ?? [];
  if (!Array.isArray(versions) || versions.length === 0) errors.push('HISTORISCHE-ANGEBOTSVERSIONEN-FEHLEN');
  if (versions.some((version) => typeof version.version !== 'number' || typeof version.hours !== 'number' || typeof version.cost !== 'number' || typeof version.status !== 'string')) errors.push('HISTORISCHE-ANGEBOTSVERSION-UNGUELTIG');
  if (story?.classification !== 'current-pilot-planning' || story?.offer?.currentStatus !== 'active-planning') errors.push('AKTIVER-VERTRAG-VERMISCHT');
  if (story?.offer?.versions !== undefined) errors.push('HISTORISCHE-VERSIONEN-AKTIV-EINGEBETTET');
  return errors;
}

if (process.argv[1]?.endsWith('validate-spectra-0.7-historical-provenance.mjs')) {
  const story = JSON.parse(fs.readFileSync('evidence/simulation/project-story.json', 'utf8'));
  const errors = validateHistoricalSpectra07(story);
  if (errors.length) { console.error(`Historische Spectra-0.7-Provenienzprüfung fehlgeschlagen (${errors.length}):`); errors.forEach((error) => console.error(`- ${error}`)); process.exit(1); }
  console.log(`Historische Spectra-0.7-Provenienzprüfung bestanden: ${story.historicalOfferVersions.length} getrennte Angebotsversionen; keine aktive Ticket-/Istvalidierung.`);
}
