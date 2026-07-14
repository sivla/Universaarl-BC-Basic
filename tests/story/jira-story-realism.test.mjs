import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateRealism } from '../../scripts/validate-jira-story-realism.mjs';
import YAML from 'yaml';

const story = JSON.parse(readFileSync('evidence/simulation/project-story.json', 'utf8'));
const register = YAML.parse(readFileSync('project/bc-basic/actor-register.yaml', 'utf8'));
test('kanonische Jira-Projektion besteht', () => assert.deepEqual(validateRealism(story, register), []));
test('stale Pilotstatus wird abgelehnt', () => { const mutant = structuredClone(story); mutant.status = 'in-progress'; assert.ok(validateRealism(mutant, register).length > 0); });
test('reale Ausfuehrung wird nicht als Jira-Nachweis akzeptiert', () => { const mutant = structuredClone(story); mutant.classification = 'current-pilot-planning'; assert.ok(validateRealism(mutant, register).length > 0); });
