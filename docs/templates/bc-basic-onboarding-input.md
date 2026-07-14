# BC Basic – Sanitisierte Onboarding-Eingabe

## Zweck und Verwendung

Diese lesbare Begleitvorlage erklärt, welche Angaben ein neuer BC-Basic-Kunde vor Discovery und Einrichtung bereitstellt.
Die maschinenlesbare Blankovorlage bleibt
[onboarding-intake.blank.yaml](../../project/bc-basic/customer-templates/blank/onboarding-intake.blank.yaml).
Ausgefüllte Kundenfassungen gehören ausschließlich in den vereinbarten geschützten Übertragungsweg
und niemals in dieses öffentliche Repository.

Erforderlich sind die fachlichen Owner, Zielprozesse, Ausschlüsse, Benutzerzahl und der Zieltermin.
Hinzu kommen Umgebungs- und Lizenzstatus, Extension-Inventar, Sicherheitsverantwortung und Datenlieferweg.
Offene Entscheidungen zu Kontenplan, Buchungsgruppen, VAT, Nummernserien, Dimensionen, Bank und Lager werden ausdrücklich ausgewiesen.

## Prüfpunkte vor Projektstart

- Projektleitung und fachliche Owner sind benannt.
- Scope, Nicht-Scope, Zieltermin und erwartete Benutzerzahl sind bestätigt.
- Sandbox, Production, Lizenzen, Lokalisierung und Updatefenster sind geklärt.
- Security Groups, Permission Sets, Notfallzugang und Funktionstrennung besitzen Owner.
- Daten werden nur über einen geschützten Kanal mit Aufbewahrungs- und Löschregel geliefert.
- Offene fachliche, steuerliche oder rechtliche Entscheidungen bleiben ausdrücklich unbestätigt.

## Referenzen

- Maschinenlesbare Blankovorlage: `project/bc-basic/customer-templates/blank/onboarding-intake.blank.yaml`
- Delivery-Runbook: `docs/runbooks/bc-basic-onboarding-delivery.md`
- Readiness-Vertrag: `governance/production-readiness.json`
