# Projektagenten-Regeln

Dieses Projekt erstellt Arbeit lokal, prueft sie reproduzierbar und uebergibt sie als Commit an das **Universaarl Kontrollzentrum** unter `C:\Users\kkali\Documents\Universaarl ai`. Projektagenten pushen niemals selbst; ausschliesslich das Kontrollzentrum veroeffentlicht ueber seinen zentralen Push-Pruefpunkt.

## Universaarl-Gesamtarchitektur

Die gemeinsame Architektur trennt Produktvertrag, Kundeninstanz, Pruefung und Visualisierung eindeutig:

- **Spectra** (`productId: spectra`) ist der wiederverwendbare, kundenunabhaengige Produktvertrag aus dem technischen Projekt/Repository **BCProjectOS** (`https://github.com/sivla/BCProjectOS.git`). Es definiert generische Schemas, IDs, Relationen, Statusmodelle, Ticketstrukturen, Generatoren, Validatoren und allgemeines Business-Central-Wissen. Ungefiltertes Kundenwissen, Kundendaten, Kunden-Evidence und konkrete Universaarl-Projektentscheidungen gehoeren nicht dorthin. Eine Bindung an Spectra ist ausschliesslich ueber einen echten, unveraenderlichen Release-Tag im Muster `spectra-v<SemVer>` mit zugehoerigem Commit und Digest zulaessig; ohne echten Release lautet der Status ehrlich `PENDING_BCPROJECTOS_RELEASE`.
- **Universaarl-Kundeninstanz / BC Basic** ist die fachliche Source of Truth fuer das konkrete Universaarl-Projekt.
- **Universaarl Kontrollzentrum** steht ausserhalb der fachlichen Datenkette. Es prueft Versionsbindung, Integritaet, Projektzustand, Snapshot-Vertrag und Veroeffentlichungsreife, ist aber weder Kundeninstanz noch fachliche Source of Truth und installiert BCProjectOS nicht in Zielprojekten.
- **Universaarl Project Twin** ist eine ausschliesslich lesende Visualisierung. Es liest nur einen validierten, versionierten Snapshot aus der Kundeninstanz, niemals ungepruefte Arbeitsstaende, schreibt niemals zurueck und hat keine direkte fachliche Abhaengigkeit von BCProjectOS.

Der fachliche Datenfluss lautet: **Spectra aus BCProjectOS -> versionierter Produktvertrag -> Universaarl-Kundeninstanz -> validierter Snapshot -> Project Twin**. Das Kontrollzentrum prueft diese Kette von ausserhalb. Absolute lokale Pfade duerfen nicht als dauerhafte fachliche oder technische Laufzeitbindung gespeichert werden. Wiederverwendbare Erkenntnisse fliessen nur anonymisiert, fachlich geprueft und zunaechst als nicht uebernommene `blueprint-candidates` nach BCProjectOS zurueck.

## Rollenspezifisch: Universaarl-Kundeninstanz / BC Basic

Dieses Projekt ist die konkrete Universaarl-Kundeninstanz und damit die fachliche Source of Truth. Ausschliesslich hier liegen Unternehmenswissen, Prozesse, Anforderungen, Epics, Stories, Tasks, Meetings, Tests, UAT, Evidence, kundenspezifische Abweichungen und die konkrete Umsetzung. Bestehende fachliche IDs werden nur aufgrund einer ausdruecklichen Migrationsentscheidung geaendert. Diese Kundeninstanz darf einen BCProjectOS-Produktvertrag nur an einen echten Release-Tag samt Commit und Digest binden; ein Arbeitsstand wird weder als Release ausgegeben noch kopiert. Snapshots fuer Project Twin werden erst nach Validierung und Versionierung bereitgestellt; Project Twin erhaelt keinen Schreibzugriff auf diese Kundeninstanz.

## Arbeitsort und Git-Grenzen

- Schreibarbeit fuer dieses Projekt erfolgt ausschliesslich in `C:\Users\kkali\Documents\Universaarl Projekt BC Basic` auf `codex/universaarl-projekt`. Diese Pfadnennung beschreibt nur die aktuelle lokale Arbeitsraumzuordnung und ist keine Laufzeitbindung.
- Keine zusaetzlichen Arbeits-Worktrees, Ausweichordner, technischen Nebencheckouts oder temporaeren Schreibkopien fuer Universaarl- oder FiBu-Arbeit anlegen. Bereinigte commitgebundene Pruefkopien bleiben reine Wegwerf-Pruefquellen und werden nie bearbeitet.
- Vor Beginn jeder Aenderung tatsaechlichen Projektpfad, Zweig, volle HEAD-SHA und `git status --short` pruefen. Lesende Git-Abfragen verwenden `GIT_OPTIONAL_LOCKS=0`.
- Bereits vorhandene lokale oder fremde Aenderungen bleiben erhalten. Sie werden weder zurueckgesetzt noch ungeprueft gestaged, umsortiert oder in den eigenen Versionsstand aufgenommen.

## OpenSpec ist verbindlich

- Koordinierte Vorhaben, neue oder geaenderte Vertraege, Schemas, Sicherheitsregeln, Snapshot-Schnittstellen, Publish-Gates und projektuebergreifende Arbeit beginnen als OpenSpec-Aenderung.
- Es darf hoechstens eine nicht archivierte Aenderung unter `openspec/changes/` aktiv sein. Bestehen mehrere aktive Aenderungen, wird keine weitere begonnen; zuerst werden sie fachlich geordnet, abgeschlossen oder nach ausdruecklicher Entscheidung archiviert.
- `proposal.md`, die betroffenen Spezifikationen, bei Bedarf `design.md` und eine eindeutige `tasks.md` werden vor der Umsetzung konsistent angelegt beziehungsweise aktualisiert. OpenSpec erweitert keine Benutzerfreigabe und keinen Projektscope.
- Aufgaben werden erst als erledigt markiert, wenn Umsetzung und geforderter Nachweis tatsaechlich vorliegen. Nicht ausgefuehrt, unbekannt, nur geplant oder lediglich lokal beobachtet gilt nicht als bestanden.
- Archivierung erfolgt erst, wenn alle Aufgaben und Aenderungs-Gates erfuellt sind und eine erforderliche menschliche Freigabe tatsaechlich vorliegt. Freigaben werden niemals erfunden.

## BCProjectOS-Bindung und Snapshot-Ausgabe

- **Aktueller Koordinationsstatus:** Die kanonische Repository-Identitaet von BCProjectOS ist `https://github.com/sivla/BCProjectOS.git`. Spectra `0.10.0-alpha.1` ist ueber den annotierten Tag `spectra-v0.10.0-alpha.1`, den Tag-Commit `f89b4de9a9be63932f942f1b0fd8225512a12029`, das finale Manifest und den reproduzierbaren Payload-Digest in `evidence/spectra-release-0.10.0-alpha.1.yaml` commitgebunden nachgewiesen. Der Blueprint-Agent richtet weder Remote noch Branch, Upstream, Tag oder Release fuer BCProjectOS ein.
- Der Produktvertrag traegt fachlich den Namen **Spectra** mit `productId: spectra`. Spaetere Release-Tags folgen ausschliesslich dem Muster `spectra-v<SemVer>`; der technische Repositoryname und die Repository-URL bleiben BCProjectOS beziehungsweise `https://github.com/sivla/BCProjectOS.git`.
- Eine Remote-/Branch-Zuordnung allein waere noch kein BCProjectOS-Release; der dokumentierte Alpha-Release ist dagegen vollstaendig verifiziert und hebt `PENDING_BCPROJECTOS_RELEASE` fuer diese Kundeninstanz auf.
- Eine BCProjectOS-Bindung benoetigt einen echten unveraenderlichen Release-Tag, die vollstaendige zugehoerige Commit-SHA und einen reproduzierbaren Digest. Ein beliebiger Branch, lokaler Arbeitsstand oder nicht nachgewiesener Tag ist kein Release.
- Fehlt einer dieser Nachweise oder stimmt er nicht, bleibt der Status `PENDING_BCPROJECTOS_RELEASE`. Dieser Zustand blockiert Gruen, Snapshot-Freigabe und Veroeffentlichungsreife; Version, Release und Digest duerfen nicht abgeleitet oder erfunden werden.
- Der Bindungsbeleg gehoert versioniert in diese Kundeninstanz. BCProjectOS wird nicht als ungepruefter Arbeitsbaum kopiert oder installiert; bestehende Kundeninhalte und fachliche IDs bleiben ohne ausdrueckliche Migrationsentscheidung unveraendert.
- Nur diese Kundeninstanz darf den Project-Twin-Snapshot erzeugen. Ein freigegebener Snapshot ist an eine saubere, vollstaendige Quell-Commit-SHA gebunden und nennt mindestens Schema-Version, Projekt-ID, Quell-Commit, BCProjectOS-Bindung, Digest, Validierungsstatus sowie die positivgelisteten relativen Artefaktpfade und Selektoren.
- Ein Snapshot enthaelt keine Geheimnisse, realen `.env*`, Authentifizierungszustaende oder ungepruefte Laufzeitartefakte. Unversionierte oder unsaubere Arbeitskopien sind keine Snapshot-Quelle.
- Die Identitaet und Leseberechtigung eines Consumers wird ausdruecklich versioniert und validiert. Project Twin liest nur; diese Kundeninstanz liest keine Twin-Fachdaten und akzeptiert keinen Rueckschreibpfad.

## Uebergabe an das Kontrollzentrum

Jede Uebergabe nennt mindestens `projectId=blueprint`, den kanonischen Zweig, die vollstaendige Commit-SHA, ausgefuehrte Pruefungen, den commitgebundenen Deutsch-Nachweis, den OpenSpec-Stand, den BCProjectOS-/Snapshot-Status, einen sauberen Arbeitsbaum sowie `REVIEW.md in Arbeitskopie: leer` und `REVIEW.md in HEAD: leer`. Ein offenes Commit-, Freigabe- oder Publish-Gate bleibt offen ausgewiesen.

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
