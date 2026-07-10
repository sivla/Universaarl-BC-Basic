---
id: UABC-COMPANY
title: Unternehmensprofil Universaarl
parent: UABC-PROJECT
owners: [P-001, P-003]
status: Approved
jiraRefs: [UABC-2, UABC-4]
referenceIds: [UABC-ARCH-ENTERPRISE-001, UABC-REQ-ENT-001, UABC-REQ-ENT-002]
lastReviewed: 2026-07-10
---

# Unternehmensprofil Universaarl

Universaarl ist eine synthetische deutsche Unternehmensgruppe fuer Energie- und Gebaeudeautomation. Vier Gesellschaften trennen Shared Services, Fertigung, Distribution/Service und Projektgeschaeft. Die operative und rechtliche Zuordnung steht in Abschnitt 3 des OpenSpec-Designs.

Reviewfokus: Sind die Gesellschaften wirtschaftlich notwendig, stimmen Kunden-/Lieferketten und ist `UAC-CONS` klar als nicht-operative Reporting-Einheit erkennbar?

Entscheidung 2026-07-10: Vier operative Rechtstraeger bleiben bestehen. UAM ist eine echte Holding-/Shared-Service-Gesellschaft mit Beteiligungen, HQ-Assets, Mitarbeitern, Bank-/Steuerstruktur und vertraglich geregelten Finance-, IT- und Data-Governance-Leistungen. UAP schliesst eigene Projektvertraege und traegt Projekt-, WIP-, Forderungs- und Subunternehmerrisiken mit eigenen Ressourcen und Bank-/Steuerstruktur. `UAC-CONS` bleibt ausschliesslich nicht-operatives BC-Konsolidierungsunternehmen. Reale IDs, Bankdaten oder Rechtsauskuenfte werden nicht erfunden.

Das Betriebsmodell weist operative Finance nun gesellschaftsnah zu: P-017 fuer UAS, P-018 fuer UAD und P-005 fuer UAM/UAP. P-019 verantwortet das UAD-Distributionslager `SLS-DC`. P-015 koordiniert Training, waehrend Fachtrainer und UAT-Abnehmer je Prozess benannt werden; diese synthetische Rollenfestlegung ist noch keine menschliche Personal- oder Berechtigungsfreigabe.
