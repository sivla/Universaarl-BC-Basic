# Change Proposal: Universaarl-Unternehmens-Blueprint v0.1

## Metadaten

- Change-ID: `establish-universaarl-enterprise-blueprint`
- Status: aktiv, in Review-Vorbereitung
- Owner: Dr. Lena Hartmann (synthetisch), Executive Sponsor
- Delivery Lead: Jonas Weber (synthetisch)
- planningReference: 2026 Release Wave 1
- actualSandboxBaseline: unknown
- Availability rule: Keine Feature-Verfuegbarkeit wird aus der Planungsreferenz abgeleitet.
- Abruf-/Planungsstand: 2026-07-10

## Problem und Zweck

Universaarl benoetigt vor jeder Konfiguration ein konsistentes Zielbild fuer Unternehmensgruppe, BC-Unternehmen, Organisation, Rollen, Daten, Prozesse, Reporting und Einfuehrung. Ohne dieses Zielbild wuerden Einzelkonfigurationen plausibel wirken, aber rechtliche Einheiten, Lagerprozesse, Dimensionsauswertung und Berechtigungen widerspruechlich verbinden.

## Ergebnisse

1. Reviewfaehiges Unternehmens- und Solution-Architecture-Blueprint v0.1.
2. Vollstaendige Capability-Matrix mit Zweck, Gesellschaft, Standort, Rolle, Abhaengigkeit, Welle und geplantem Nachweis.
3. Ein projektlokales OpenSpec-Schema `proposal -> specs + design -> delivery-plan -> tasks -> verification`.
4. Lokale Jira- und Confluence-Struktur fuer die Blueprint-Welle mit Referenzvalidierung.
5. Sichtbare Annahmen, Alternativen, Entscheidungen und offene Punkte.
6. Archivierungsfeste kanonische Architektur-, Capability- und Verification-Artefakte mit stabilen fachlichen IDs.

## Scope

- Konzernmodell, Gesellschaften und BC-Unternehmen
- Standorte und differenzierte Lagerkonzepte
- Produkte, Dienstleistungen und Beispielorganisation
- Finance, Einkauf, Verkauf, Artikel, Bestand, Lager, Produktion, Projekte, Service, Anlagen, Intercompany, Konsolidierung, Reporting, Administration, Datenmigration und Training
- Dimensions-, Sicherheits-, Integrations- und Datenverantwortungsmodell
- Implementierungswellen und Nachweisstrategie
- Blueprint-Epic, notwendige Stories und aktuelle Blueprint-Tasks

## Nicht-Ziele

- Keine Verbindung zur Sandbox `playthru`
- Keine BC-Konfiguration, Buchung oder Datenmigration
- Keine Playwright-Ausfuehrung oder Runtime-Evidence
- Keine Buchkapitel, Trainerunterlagen oder Skills
- Keine Archivierung, kein Commit und kein Push

## Risiken und Kontrollen

| Risiko | Kontrolle |
| --- | --- |
| Blueprint wird mit implementierter Wahrheit verwechselt | Alle Inhalte bleiben im aktiven Change; `openspec/specs` bleibt ohne Blueprint-Spec. |
| Releaseplan wird als Verfuegbarkeitsbeleg missverstanden | Spaetere Sandbox-Version und Feature Management werden vor Umsetzung verifiziert. |
| Zu viele Gesellschaften erzeugen Demo-Komplexitaet ohne Nutzen | Vier operative/rechtliche Einheiten plus ein reines Konsolidierungsunternehmen; jede Einheit hat eigenen Prozessgrund. |
| Dimensionen ersetzen operative BC-Strukturen | Begriffe und Verantwortungen sind im Design getrennt; Projekte, Lagerorte und Verantwortungszentren bleiben eigene Objekte. |
| Rollen erhalten zu breite Rechte | Entra-Gruppen und unternehmensbezogene BC-Permission-Sets; Funktionstrennung wird vor UAT getestet. |

## Freigabe

Der reale Repository-Nutzer hat am 2026-07-10 mit `Empfehlungen uebernehmen` die W0-Unternehmens-/Loesungsarchitektur, das geplante Capability-Portfolio, das W1-W5-Delivery-Modell, Rollen/Kontrollen sowie offene Fragen und Gates bedingt freigegeben. Diese reale Freigabe ist nicht der synthetischen Jira-Person P-001 zuzurechnen.

Nicht freigegeben sind die tatsaechliche `playthru`-Baseline oder Featureverfuegbarkeit, Legal-/Tax-Detailauslegung, finale Lizenzzuweisung, einzelne noch ungepruefte Capabilities, W1-Writes, BC-Zugriff oder Go-live. Capability-Status bleiben `planned` beziehungsweise `deferred`.
