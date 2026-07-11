# Projektagenten-Regeln

Dieses Projekt erstellt Arbeit lokal, prueft sie reproduzierbar und uebergibt sie als Commit an das **Universaarl Kontrollzentrum** unter `C:\Users\kkali\Documents\Universaarl ai`. Projektagenten pushen niemals selbst; ausschliesslich das Kontrollzentrum veroeffentlicht ueber seinen zentralen Push-Pruefpunkt.

## Projekt-Agenten duerfen

- den Blueprint im vereinbarten Umfang bearbeiten;
- die projektspezifischen Pruefungen ausfuehren;
- zusammenhaengende, fertige und fachlich sinnvolle Arbeit lokal committen;
- einen fertigen Commit mit Branch, vollstaendiger Commit-SHA, Tests, sauberem Git-Status und leerem `REVIEW.md` in Arbeitskopie und `HEAD` uebergeben.

Change-spezifische Freigabepruefpunkte bleiben verbindlich. Ein Commit darf erst erstellt werden, wenn diese Pruefpunkte ihn zulassen.

## Commit-Qualitaet

- Keine inhaltsarmen Mikro-Commits, Bullshit-Commits, Platzhalter-Commits oder unfertigen Zwischenstaende erzeugen.
- Ein Commit soll ein zusammenhaengendes, fachlich sinnvolles Arbeitspaket abschliessen und darf dafuer bewusst zwei bis drei aufeinander aufbauende Umsetzungsschritte enthalten.
- Typische gute Einheit: fachliche Aenderung, dazugehoerige Referenz-/Schemaanpassung und passende Validierung oder Dokumentation.
- Erst committen, wenn das Arbeitspaket in sich konsistent, pruefbar und verstaendlich pruefbar ist.
- Keine kuenstliche Aufteilung in inhaltsarme Mikro-Commits, aber auch keine sachfremden Aenderungen in einen grossen Sammel-Commit mischen.
- Wenn eine Aufgabe groesser wird, mehrere jeweils eigenstaendige und gruene Commits erstellen.

## Pruefdatei nach jedem Commit

- Die verbindliche Pruefwarteschlange ist `REVIEW.md` im Projektroot. `evidence/**/visual-review.yaml` ist fachlicher Nachweis und darf dafuer weder verwendet noch geleert werden.
- Vor jedem Commit alle Eintraege aus `REVIEW.md` nachvollziehbar bearbeiten und die Datei danach vollstaendig leeren.
- Nach jedem neuen Commit ausdruecklich pruefen, dass sowohl die Arbeitskopie als auch die in `HEAD` enthaltene `REVIEW.md` leer beziehungsweise rein whitespace sind.
- Empfohlene Kontrolle: `git show HEAD:REVIEW.md` darf keinen inhaltlichen Text ausgeben; `git status --short -- REVIEW.md` muss leer bleiben.
- Ist die Pruefdatei nach dem Commit nicht leer oder fehlt sie im Commit, ist die Uebergabe ungueltig. Den Zustand korrigieren und erneut sauber committen, bevor das Kontrollzentrum informiert wird.
- Der uebergebene Pruefnachweis nennt ausdruecklich: `REVIEW.md in HEAD: leer`.

## Projekt-Agenten duerfen nicht

- `git push` oder erzwungene Pushes ausfuehren;
- Remotes, Push-URLs oder Upstreams anlegen oder veraendern;
- Tags, Releases oder Pull Requests veroeffentlichen;
- unfertige oder fremde Aenderungen in den eigenen Commit aufnehmen;
- BC-Schreibvorgaenge, Mandanten-/Umgebungswechsel, Tenant-/Secret-Veroeffentlichungen oder Scope-Erweiterungen ausfuehren, sofern sie nicht ausdruecklich fuer den aktuellen Auftrag autorisiert sind.

## Sprache und Oberflaechen

- Saemtliche menschliche Kommunikation, Aufgabenprompts, Berichte, Dokumentation, UI-Texte, A11y-Namen, Warnungen und Fehlermeldungen muessen professionell deutsch sein.
- Unveraenderliche technische IDs, Enums, Pfade, Kommandos, Paket-/Produktnamen, Quellen- und Originalwerte bleiben technisch korrekt und werden nicht kuenstlich eingedeutscht.
- Wenn technische Pruefungen englische Rohwerte ausgeben, duerfen sie als beobachtete Originalwerte zitiert werden; die eigene Erklaerung dazu bleibt deutsch.

Nach dem lokalen Commit endet die normale Aufgabe mit der Uebergabe an das Kontrollzentrum. Ausschliesslich das Kontrollzentrum prueft den vorhandenen Commit noch einmal und veroeffentlicht ihn ueber seinen zentralen Push-Pruefpunkt.

Eine Ausnahme benoetigt eine ausdrueckliche Benutzeranweisung, die dieses Projekt und die erlaubte Publishing-Aktion konkret nennt.
