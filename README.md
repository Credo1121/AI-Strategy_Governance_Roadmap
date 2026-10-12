# AI Strategy Studio

Eine lokale Next.js-/Node.js-Demonstrationsanwendung für interne Beraterteams. Sie verbindet Kundenkontext, AI-Auswirkungen auf Wertschöpfung, Gesprächsführung und strategische Optionen mit einem ersten Enterprise-AI-Portfolio, Finanzrahmen und Sechs-Wochen-Plan.

## Enthalten

- Synthetischer Konzernarchetyp und Mittelstandsprofil; eigene Demoakten anlegen.
- Je fünf Prozessschritte für Hardware-Entwicklung, Software-Entwicklung und Vertrieb: Ist-Arbeit, AI-Veränderung, Werthebel, Voraussetzungen, Risiken und Messidee.
- Sechs Gesprächsfelder mit unterschiedlichen Fragen für C-Level, C-1 und C-2. Notizen für alle drei Prozesse getrennt speichern.
- Vier strategische Optionen auswählen; die Auswahl ergänzt den Untersuchungsplan.
- Strategieoptionen in Portfolioinitiativen überführen oder Initiativen manuell ergänzen; Benefit Owner, Wirkungshypothese, Evidenz, Risiko und Board-Status dokumentieren.
- Jahrestarget, Budget, Rolling Forecast, Ist-Kosten, gebundene Mittel und nächste Tranchen in Tsd. EUR zusammenführen. Keine automatische Freigabe oder Priorisierung.
- Sechs Wochen mit Aufgaben, Verantwortungsrollen, Ergebnissen und Entscheidungspunkten.
- Quellenbibliothek, transparente Prüfstände und aktuelle globale Praxisdaten. Keine erfundenen DAX-/Branchenbenchmarks.
- Markdown-Export des gespeicherten Beratungsstands. SQLite-Persistenz und Versionsprüfung gegen verlorene Änderungen.

## Start

Node.js 24 (geprüft: 24.19.0), npm 11.9.0. Im Repository:

```sh
npm ci
npm run dev
```

Beide Prozesse starten gemeinsam: Frontend Port 3000, API Port 4010, ausschließlich Loopback. In einem lokalen Checkout im Browser Port 3000 öffnen. Der Cloud-Onboarding-Chat stellt keinen öffentlichen App-Link bereit. Für einen gebauten lokalen Lauf:

```sh
npm run build
npm start
```

`Ctrl+C` beendet beide Dienste. Die Datenbank liegt unter `.data/demo.sqlite` und wird beim ersten Start mit Demoakten initialisiert; bestehende Akten werden nicht zurückgesetzt. Arbeitsdaten, Build-Ausgaben und Dependencies sind ignoriert. Die npm-Cache-Einstellung ist auf diese Cloud-Umgebung ausgerichtet; außerhalb von `/workspace` bei Bedarf `npm ci --cache .data/npm-cache` verwenden.

## Prüfen

```sh
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

Die API-Tests verwenden eigene temporäre SQLite-Datenbanken. Browserkernreise bei gestarteter App: `python3 scripts/verify_app.py` (Python, Playwright und `/usr/bin/chromium`; in dieser Umgebung vorhanden). Sie erstellt synthetische QA-Akten und speichert aktuelle Screenshots unter `docs/evidence/REQ-003`. Sie berührt keine Antworten der beiden Ausgangsakten. Prüfberichte: [REQ-002](docs/qa/REQ-002.md) und [REQ-003](docs/qa/REQ-003.md).

## Grenzen und nächste Ausbaustufen

Diese Version verwendet ausschließlich Demonstrationsdaten und hat keine Anmeldung oder Produktions-Teamrechte. Echte Kundendaten und externe Veröffentlichung erfordern vorher ein separates Sicherheits-/Betriebsdesign. Kein generatives Modell oder externe AI-API eingebunden; Empfehlungen und Formate sind kuratierte Beratungssynthesen.

Die vollständige wissenschaftliche Prüfung mehrerer Volltexte sowie echte vergleichbare Branchenbenchmarks stehen aus. Quellentyp, gelesener Umfang und Grenzen werden deshalb in der Anwendung sichtbar gezeigt. Die Softwarequalität ersetzt diese fachliche Prüfung nicht.

Das ursprüngliche Produktziel bleibt bestehen: umfassende AI-Strategie, Roadmap und Enterprise-AI-Portfolio mit Governance, Finanzierung und laufender Steuerung. Der aktuelle Portfolio-/Finanzierungsslice ist ein Gesprächs- und Dokumentationsinstrument; Szenarien, Abhängigkeiten, Nutzenrealisierung, vertiefte Governance und spätere Produktionszusammenarbeit folgen. Details: [docs/backlog.md](docs/backlog.md).

Die vorher erstellte HTML-Präsentation bleibt unter `presentation/` erhalten.
