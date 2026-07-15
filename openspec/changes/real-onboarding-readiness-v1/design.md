# Design

Der V5-Producer liest das unveränderte V4-Journal und die V4-Releasebytes, ergänzt ausschließlich die neue Status-/Readiness-Quelle und ihre materialisierte Evidence und erzeugt daraus einen unveränderlichen Kandidaten. `current.json` wird nicht geschrieben. Fehlende reale Owner oder Termine werden als `entscheidungsluecke` mit `null` modelliert; eine grüne Realampel oder erfundene Freigabe ist ein Validierungsfehler.

Der Kandidat enthält die bestehenden V4-Payloads bytegleich sowie die zwei neuen Producerartefakte. Manifest, Index, Ressourcenkatalog, Payloads und Bundle werden separat gebunden.
