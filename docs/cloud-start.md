# AI Strategy Studio starten

Verwende den bestehenden Checkout /workspace/AI-Strategy_Governance_Roadmap. Jede Cloud-Aufgabe ist bereits isoliert; kein Git-Worktree ohne ausdrücklichen Nutzerauftrag. Lies geltende AGENTS.md, relevante Skills sowie docs/project-context.md und docs/project-state.md. Bewahre vorhandene Änderungen und die SQLite-Demoakten.

Node.js 24 ist erforderlich (geprüft 24.19.0). Dependencies und .data/demo.sqlite sind Dateizustand; Prozesse müssen nach einer neuen Sitzung neu gestartet werden. Keine Secrets, externe AI-API oder Datenbankdienste erforderlich. Ausschließlich synthetische Daten; keine realen Kundeninformationen oder externes Deployment.

Arbeitsverzeichnis: /workspace/AI-Strategy_Governance_Roadmap.
Falls Dependencies fehlen oder das Lockfile geändert wurde: npm ci --no-audit. Kein Lockfile löschen oder Abhängigkeiten ungefragt aktualisieren.
Falls bereits beide eigenen Dienste laufen, zuerst deren Bereitschaft prüfen und sie bei passender Codeversion verwenden.
Andernfalls npm run dev in einer dauerhaft laufenden Exec-Sitzung starten. Der Supervisor startet Next.js auf 127.0.0.1:3000 und die Node-API auf 127.0.0.1:4010. Er beendet beim Stoppen beide Prozessgruppen. Stoppe nur selbst gestartete Dienste; keine fremden Prozesse beenden. Alternativ für einen gebauten Lauf: npm run build, danach npm start.

Bereitschaft im selben Cloud-Rechner prüfen:
1. GET http://127.0.0.1:4010/api/health und GET http://127.0.0.1:3000/api/health müssen status=ok, mode=demo liefern.
2. GET http://127.0.0.1:3000/api/catalog muss Prozesskarten für hardware, software, sales und sechs Gesprächsfelder liefern; GET /api/engagements muss die gespeicherten Demoakten liefern.
3. Frontend auf Port 3000 mit lokalem Browser öffnen. Demoakte laden, Gesprächsfrage erfassen, speichern und nach Reload prüfen; Quellenstatus muss sichtbar bleiben. Für reproduzierbare Browserprüfung: python3 scripts/verify_app.py mit vorhandenem Playwright und /usr/bin/chromium. Die Prüfung erstellt eigene synthetische QA-Akten; kein reales Kundenszenario verwenden.
4. Typecheck und Backendtests: npm run typecheck; npm test. Build: npm run build. Prüfergebnisse und Screenshots in docs/qa/ und docs/evidence/ festhalten.

Keinen öffentlichen Preview-Link für Loopback-Adressen erzeugen oder behaupten. Die laufende lokale Demo ist keine veröffentlichte Anwendung. Keine Anmeldung, Produktions-Teamrechte oder vollständige wissenschaftliche Methodenvalidierung behaupten; offene Quellenprüfungen und nächste Produktabschnitte stehen in README.md und docs/backlog.md. web-deploy nur ausdrücklich aufrufen.
