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

## REQ-003 — Portfolio und Finanzierung

Portfolioinitiativen und Finanzrahmen erweitern die bestehende versionierte Beratungsakte. Der gleiche atomare Revisionsschutz umfasst damit Strategie, Portfolio und Finance; eine konkurrierende Änderung überschreibt keinen Teilstand. SQLite-Migration v2 ergänzt vorhandene JSON-Akten additiv. Bestehende Strategieoptionen werden als nachvollziehbare Startinitiativen migriert; neue Akten erhalten den vollständigen Vertrag.

Gebundene Mittel und nächste Tranchen werden im Frontend und Export aus den Initiativen summiert. Target, Budget, Rolling Forecast und Ist-Kosten bleiben dokumentierte Eingaben. Abweichungen erzeugen einen Gesprächshinweis, keine Sperre oder automatische Freigabe. Architekturentscheidung ADR-003; Grenzen für reale Finanzdaten, Rechte, Audit-Log und Dezimalbuchungen bleiben offen.

## REQ-004 — GitHub Pages

Der Pages-Build setzt `output: export`, den Repository-`basePath` und einen ausschließlich im Browser ausgeführten Demo-Adapter. Derselbe Client-Workspace verwendet im lokalen Modus weiterhin die HTTP-API und im statischen Modus validierte Seeddaten plus `localStorage`. Der Modus ist über eine Buildvariable festgelegt und sichtbar gekennzeichnet; es gibt keinen stillen Laufzeit-Fallback von einem ausgefallenen Backend auf Browserdaten.

GitHub Actions installiert aus dem Lockfile, führt Typecheck und Integrationstests aus, baut das statische Artefakt und übergibt es mit den offiziellen Pages-Actions. Vertrauensgrenze: Pages ist öffentlich; Browserdaten verlassen den Client nicht, besitzen aber keine Teamfreigabe, serverseitige Autorisierung, Sicherung oder Konfliktkontrolle. Entscheidung ADR-004.
