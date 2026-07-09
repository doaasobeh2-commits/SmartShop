# SmartShop — Agent Instructions

> **Read Fadi-Core-Platform first:** [`../../AGENTS.md`](../../AGENTS.md)

## Platform (canonical)

| Doc | Path |
|-----|------|
| Product direction | [`../../products/smartshop.md`](../../products/smartshop.md) |
| Ecosystem principles | [`../../philosophy/PRINCIPLES.md`](../../philosophy/PRINCIPLES.md) |
| HIE architecture | [`../../architecture/INTELLIGENCE.md`](../../architecture/INTELLIGENCE.md) |
| Integration | [`../../architecture/INTEGRATION.md`](../../architecture/INTEGRATION.md) |
| Figma (next) | [`../../design/FIGMA.md`](../../design/FIGMA.md) |

## Implementation only (this repo)

| Area | Path |
|------|------|
| App shell | `apps/smart-shop/src/App.tsx` |
| HIE runtime | `core/src/intelligence/` |
| Bridges | `ecosystem/src/` |
| UI | `shared/` |

## Build

```bash
npm install && npm run build
```

## Note

Architecture docs in `core/*.md` are **pointer stubs**. Edit platform docs, not duplicates.
