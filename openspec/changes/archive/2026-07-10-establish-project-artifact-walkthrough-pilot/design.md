# Design

## Entscheidung

YAML ist das Autorenformat; ein JSON-Schema beschreibt den Vertrag. Ein Node-Generator validiert den Piloten, liest die bestehenden Lauf-Manifeste und Events, prueft Quelldateien und erzeugt deterministisch ein aufgeloestes Manifest, WebVTT, HTML, WebM, WebP und den stabilen Exportindex.

## Datenfluss

`OpenSpec-Szenario -> Lauf-Manifest/Events/Screenshots -> Walkthrough-YAML -> aufgeloestes Manifest -> HTML/VTT/WebM/WebP/Exportindex`

## Wahrheitsgrenze

- `run-2` liefert die kuratierte primaere Screenshotfolge; `run-1` ist der reproduzierbare Vergleichslauf.
- Nur vorhandene `ENV-00` bis `ENV-06` werden verwendet.
- Das Video ist eine als solche bezeichnete Screenshotsequenz, keine erfundene Bildschirmaufnahme.
- SHA-256 verknuepft Quellen und Ausgaben. Vollstaendige BC-URLs, Tenant-ID und Tokens sind verboten.

## Wiedergabe

Eine HTML-Datei bietet Moduswahl, Schrittsteuerung, Textalternative, Reduced Motion und ein natives Videoelement mit Pause, Seek und WebVTT-Untertiteln. Alle Modi lesen dasselbe aufgeloeste Manifest.
