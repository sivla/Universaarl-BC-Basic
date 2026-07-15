import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import YAML from 'yaml';

const story=JSON.parse(fs.readFileSync('evidence/simulation/project-story.json','utf8'));
const pilot=YAML.parse(fs.readFileSync('project/bc-basic/pilot-v3.yaml','utf8'));
const ledger=JSON.parse(fs.readFileSync('evidence/simulation/pilot-v3-finance-ledger.json','utf8'));

test('V3-Kalender besitzt genau eine fuenftaegige Einrichtungswoche',()=>assert.deepEqual(pilot.calendar.implementationWeek.businessDays,['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08']));
test('alle Tickets schliessen nach Arbeit und Test',()=>{for(const ticket of story.tickets){assert.ok(new Date(ticket.startedAt)<=new Date(ticket.testedAt));assert.ok(new Date(ticket.testedAt)<=new Date(ticket.closedAt));for(const log of ticket.worklogs??[])assert.ok(new Date(`${log.date}T00:00:00+02:00`)<=new Date(ticket.closedAt));}});
test('Task-only-Ist weicht plausibel vom Plan ab',()=>{const logs=story.tickets.filter(ticket=>ticket.type==='task').flatMap(ticket=>ticket.worklogs);assert.equal(logs.length,19);assert.equal(logs.reduce((sum,log)=>sum+log.hours,0),78);assert.equal(logs.reduce((sum,log)=>sum+log.netAmount,0),9360);assert.equal(story.offer.planned_hours,80);});
test('benannte Kundenrollen bleiben simuliert',()=>{const customer=pilot.actors.filter(actor=>actor.organization===pilot.customer.name);assert.equal(customer.length,7);assert.ok(customer.every(actor=>actor.actorType==='simulated-customer-role'&&!/bestaetigen/i.test(actor.displayName)));assert.equal(pilot.actors.find(actor=>actor.personId==='P-PILOT-LEAD-001').actorType,'human');});
test('Finanzkontrollen und Retests sind fail-closed',()=>{assert.equal(ledger.cases.length,7);for(const item of ledger.cases){assert.equal(item.exception.retest,'bestanden-synthetisch');for(const [key,value] of Object.entries(item.control))if(/difference/i.test(key))assert.equal(value,0);}});
