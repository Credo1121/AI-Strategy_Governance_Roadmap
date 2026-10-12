# Nachvollziehbarkeit

REQ-001 / AC-01–08 → docs/presentation-brief.md und docs/architecture.md → presentation/ai-strategy-portfolio.html → scripts/verify_presentation.py und docs/qa/REQ-001.md → docs/evidence/REQ-001/.
Quellengrundlage → docs/research/problem-validation.md und Quellenanhang der HTML-Datei. CHG-001 dokumentiert Umsetzung und Grenzen.

REQ-002 / AC-01–10 → ADR-002 und docs/contracts/strategy-workspace.md → apps/web/app/*, apps/api/src/*, packages/shared/src/* → API-Integrationstests und scripts/verify_app.py → docs/qa/REQ-002.md und docs/evidence/REQ-002/. CHG-002 dokumentiert Umfang und Grenzen.

REQ-003 / AC-01–09 → ADR-003 und erweiterter Datenvertrag → packages/shared/src/contracts.ts, packages/shared/src/catalog.ts, apps/api/src/store.ts, apps/web/app/portfolio.tsx → 3 API-/Migrationsintegrationstests und erweiterte Browserkernreise → docs/qa/REQ-003.md und docs/evidence/REQ-003/. CHG-003 dokumentiert Umfang und Grenzen.

REQ-004 / AC-01–08 → ADR-004 → apps/web/app/static-demo.ts, bedingte Next-Konfiguration und .github/workflows/pages.yml → normaler/statischer Build, scripts/verify_pages.py → docs/qa/REQ-004.md und docs/evidence/REQ-004/. CHG-004 dokumentiert Umfang und Grenzen.
