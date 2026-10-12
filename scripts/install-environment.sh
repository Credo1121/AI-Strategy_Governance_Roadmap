#!/usr/bin/env bash
set -eu
cd /workspace/AI-Strategy_Governance_Roadmap
node -e "if (Number(process.versions.node.split('.')[0]) !== 24) { console.error('Node.js 24 erforderlich'); process.exit(1); }"
npm ci --no-audit
npm run typecheck
npm test
NEXT_TELEMETRY_DISABLED=1 npm run build
