# Architektur des Präsentationsartefakts

REQ-001: ein eigenständiges HTML-Dokument mit eingebettetem CSS/JavaScript, Systemschriften und Inline-Grafiken. Kein Build, Server, Datenbank, Tracking oder Netzwerkzugriff zum Abspielen erforderlich. Öffnen im Browser; für Tests lokaler Python-HTTP-Server.

Begründung: Der erste Liefergegenstand ist eine teilbare Präsentation vor Anwendungsentwicklung. Next.js-Frontend und Node.js-Backend bleiben Vorgaben der späteren Anwendung; die Präsentation führt keine vorgezogene App-Architektur ein.

Lokaler Zustand: Foliennummer im URL-Fragment, Variante im Query-Parameter; keine Speicherung personenbezogener Daten. Statische kuratierte Inhalte, keine externen Inputs in HTML übernommen. Quellenlinks öffnen mit noreferrer/noopener. Bedienung über native Buttons, Select und Dialoge.

Qualität: 1920×1080-Folienfläche, viewportabhängige Skalierung; Druck jede Folie auf eigene 16:9-Seite. Screenshots und Navigationstests mit Chromium/Playwright. Wissenschaftliche Qualität separat vom technischen PASS beurteilen.

## REQ-002 — Beratungsanwendung

Next.js 16.4.0 / React 19.3.0 / TypeScript 5.9.3, App Router; Server-Layout mit interaktivem Client-Workspace. Keine externen Fonts/CDNs. Separater Node.js-24-HTTP-Service; Next-Rewrite leitet same-origin /api weiter. Daten- und Validierungsquelle im gemeinsamen Workspace (Zod 4.6.6), SQLite mit versionierter Initialmigration und parametergebundenem Datenzugriff.

Komponenten: Frontend für Kontext/Prozess-/Gesprächs-/Options-/Roadmap-/Quellenansichten; API für Akten, Eingabevalidierung und Export; shared für Verträge und kuratierte Inhalte. Die lokale Demo vertraut allen Nutzern des loopbackgebundenen Prozesses; keine Benutzer-/Mandantenautorisierung behauptet. Beide Dienste müssen bei einer neuen Sitzung neu gestartet werden, Daten und Dependencies können erhalten bleiben.

Sicherheitsgrenzen: keine echten Daten, Dienste nur 127.0.0.1, JSON-only und Originprüfung bei Mutationen, 64-KiB-Limit, validierte IDs/Felder/Längen, Request-Timeouts, keine externen Fetches aus Nutzereingaben, kein unsicheres HTML-Rendering. Fehler ohne Stacktrace. Optimistische Revisionsprüfung verhindert verlorene Änderungen; keine automatische Überschreibung bei Konflikten.

Methodisches Risiko: globale Praxisbefragung nicht DAX-repräsentativ; Beratungssynthesen nicht als validierte Gesamtmethode darstellen. Status direkt im Produkt sichtbar. Entscheidungen nach ADR-002; Datenvertrag docs/contracts/strategy-workspace.md.
