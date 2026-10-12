# Datenvertrag — REQ-002

Schemaquelle: packages/shared/src/contracts.ts (Zod; TypeScript-Typen daraus abgeleitet).

Alle API-Routen unter /api; JSON, außer Markdown-Export. Keine Credentials erforderlich für loopbackgebundene Demo; keine echten Kundendaten erlaubt. Frontend nutzt Next-Rewrite, Backend ausschließlich 127.0.0.1:4010.

GET /health → {status:"ok",mode:"demo"}; GET /catalog → unveränderlicher Methoden-/Quellen-/Prozesskatalog.
GET /engagements → Aktenliste; POST /engagements → {name,profile}; 201 neue synthetische Akte mit Version 0.
GET /engagements/:id → vollständige Akte; PATCH → {revision,context,answers,selectedOptions}, jeweils volle editierbare Felder. context: name,profile,objective,audience,focus. answers: Record bekannter Prozess-/Frage-IDs (z. B. hardware.ambition; 18 erlaubte Schlüssel) → Text, max. 4000 Zeichen. selectedOptions: eindeutige bekannte IDs.
revision: nichtnegative Integer; DB-Update WHERE id AND revision atomar, erfolgreich revision+1. Veralteter Stand → 409 CONFLICT, keine automatische Wiederholung. Frontend bietet Neuladen statt fremde Daten zu überschreiben.
GET /engagements/:id/export → text/markdown; nur gespeicherter Stand. UI verlangt Speichern vor Export.

Fehler: {error:{code,message,requestId}}. 400 VALIDATION/BAD_JSON; 404 NOT_FOUND; 409 CONFLICT; 413 TOO_LARGE; 415 UNSUPPORTED_MEDIA_TYPE; 403 ORIGIN; 500 INTERNAL, keine internen Details. Zod strict object, maximal 64 KiB, keine unbeschränkten externen Fetches, kein HTML aus Antworten.

Roadmap ist eine transparente Beratungsableitung aus gespeicherten ausgewählten Optionen und allgemeinen Wochenaufgaben, keine generative Empfehlung. Alle Beispielakten und ihre Ausgangsangaben synthetisch. Kein Mandanten-/Rechteversprechen im Demo-Modus.
