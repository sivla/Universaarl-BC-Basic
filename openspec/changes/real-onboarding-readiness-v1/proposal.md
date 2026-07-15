# Dualer Projektstatus und reale Onboardingbereitschaft

## Ziel

Der BC-Basic-Producer weist den abgeschlossenen synthetischen Betriebszyklus und die noch nicht belegte reale Onboardingbereitschaft getrennt aus. Der V4-Katalog bleibt Last-known-good und current; dieser Change erzeugt höchstens einen validierten V5-Kandidaten.

## Nicht im Umfang

- Keine reale Tenant-, Lizenz-, Berechtigungs-, UAT-, Cutover-, Abschluss-, Steuer- oder Supportaktion.
- Keine Änderung an Spectra, Project Twin oder Kontrollzentrum.
- Keine Änderung an bestehenden V4-Quellbytes, IDs oder dem V4-Current-Zeiger.

## Nachweis

Die kanonische Quelle `project/bc-basic/real-onboarding-readiness-v5.yaml` bindet acht offene reale Gates, die V4-Worklog-Evidence und drei nächste Aktionen. Die materialisierte Evidence und der V5-Katalogkandidat werden fail-closed gegen diese Quelle validiert.
