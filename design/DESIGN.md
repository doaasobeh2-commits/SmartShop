# Design System

Platform design principles. Apps implement in their own `shared/` packages.

## Philosophy

- Calm dark UI · generous spacing · one purpose per screen
- No macro walls, chart grids, or widget dashboards on home
- No engine branding on consumer surfaces
- Semantic icons — **no sparkles as default AI signifier**
- Merchant/details on tap only (compact basket rule)

## Tokens (contract)

Dark navy background · glass cards · restrained blue/cyan/violet accents · `--font-display` for headings · max 3 text sizes per screen.

App implementations: `apps/FitnessAI/shared/styles/design.ts` · `apps/Smart Shop/shared/`

## Patterns

| Pattern | Rule |
|---------|------|
| Home cards | ≤5 decision cards; one primary action each |
| Compact basket | Merchant + product + price + validity only |
| Today / Tonight | One focus + one metric + one action |
| Logging | Overlay flow, not destination tab |
| "Why?" | Inline expand — not a Coach tab |
| Empty state | Neutral — "not logged," not guilt red |

## Navigation target

| App | Current | Target |
|-----|---------|--------|
| SmartShop | Home·Plan·Analyse·Profil | Home·Plan·Profil |
| FitnessAI | 5 tabs incl. Coach | Today·Log·You |
| RecipeAI | 11-screen spec | Tonight + Cook |

## Motion

Subtle transitions · quiet loading · brief success on trip/meal complete · no gamification confetti.

## Next step

Figma AI redesign before implementation. See [`FIGMA.md`](FIGMA.md).
