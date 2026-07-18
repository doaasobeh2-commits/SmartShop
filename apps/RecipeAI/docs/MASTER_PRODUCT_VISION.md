# ShareYum — Master Product Vision (Locked)

> **Working product name:** ShareYum  
> **Codebase / path (legacy):** RecipeAI · `apps/RecipeAI/` · `@recipe-ai/*` packages until controlled rename  
> **Status:** Canonical north star for all UI, content, and engineering.  
> **Supersedes:** Earlier briefs where they conflict — especially Premium: **contextual cook assistant**, not chat.

---

## Architecture boundary (approved)

| Layer | Responsibility |
|-------|----------------|
| **FadiCore** | Shared identity, household, membership, enrollment, permissions, platform concerns only |
| **ShareYum backend** | Recipes, recommendation logic, scoring, meal planning, allergen logic, feedback intelligence, food-domain algorithms — **server-side only** |
| **ShareYum client** | UI, navigation, cook experience — consumes ShareYum APIs; no decision logic in browser bundles |

FadiCore must not own recipe, meal, or recommendation domain logic.

---
## What Recipe AI is

| Layer | Definition |
|-------|------------|
| **Category** | Household meal **decision engine** |
| **One question** | *What should we cook today?* |
| **Product** | The **decision** + the **household** — not the recipe |
| **Recipe** | The answer, delivered calmly |

**Quality bar:** Apple simplicity · Airbnb warmth · Oura calmness · timeless through 2030.

**Never feel like:** recipe website · cooking blog · shopping site · dashboard · ChatGPT · AI demo.

**One sentence for the team:**

> Recipe AI is the world's most enjoyable household meal companion — it decides what to cook, knows your kitchen, helps you cook it, learns from dinner, and never asks you to manage recipes.

---

## Background philosophy

Every primary screen should **immediately communicate its purpose through its background**.

The background is **part of the experience**, not decoration. Each screen has its own **emotional atmosphere**.

### General rules

- Backgrounds must never feel like stock photos
- Never use generic illustrations or cartoon graphics
- Use premium lifestyle photography: real homes, real kitchens, real ingredients, real meals
- Soft natural light · large breathing space

### Product feeling

The application should feel like:

- Apple simplicity
- Airbnb warmth
- Oura calmness
- A beautiful cookbook
- A trusted family companion

Never like: Pinterest · recipe websites · cooking blogs · food marketplaces

**Remember:** The background tells the story of the current moment. If a user looks at the screen for one second, they should immediately understand where they are **without reading a single word**.

---

## Screen backgrounds

| Screen | Atmosphere | Details |
|--------|------------|---------|
| **Welcome** | Premium real kitchen | Natural wood, stone, ceramic, **morning light**, warm, inviting |
| **Food Preferences** | Fresh vegetables & herbs | Tomatoes, parsley, basil, garlic, onions, lemons; natural colors; water droplets; healthy and alive |
| **Tonight** | Recommended meal | Large premium food photography; warm **evening** atmosphere; soft gradient into interface |
| **Recipe Preview** | Same meal | Meal remains visible; interface floats naturally above |
| **Cook Mode** | Dark premium cookbook | Minimal; warm dark colors; typography is hero; **only dark screen** |
| **Weekly Plan** *(optional)* | Calm planning | Bright, clean; calm dining table; notebook feeling; no dashboard |
| **Feedback** | Post-dinner satisfaction | Warm family dinner; finished meal; clean table; soft lighting; dinner is complete |

No dark colorful UI except Cook Mode. Warm whites · natural colors · large spacing · premium typography.

---

## The Living Kitchen (approved visual direction)

> **Status:** Locked art direction for all backgrounds and photography. Supersedes ad-hoc per-screen decoration.

### Core principle

**One household · one coherent home/material world.** Meals and cuisines change; **the home stays.**

The user moves through chapters of one story in **one believable kitchen** — not a travel magazine of different countries per dish.

### What this means

| Rule | Detail |
|------|--------|
| **No cuisine tourism** | Ramen, kibbeh, and pasta must feel photographed **on the same table**, with the same wood, linen, and light — not in Tokyo, Beirut, and Rome |
| **Two visual grammars** | **Raw ingredients** (Preferences, Cook With What I Have) vs **finished meals** (Tonight, Preview, Feedback) — never mix on the wrong screen |
| **Meal continuity** | Tonight → Preview → Feedback share **one meal identity** where possible: same hero photograph reframed; Feedback may show aftermath (empty plate, same table) |
| **Cook Mode** | Deep charcoal + subtle paper/canvas texture + **extremely restrained** blurred meal/kitchen atmosphere (2–4% opacity). Instructions remain hero |
| **Weekly Plan** | Functionally **non-linear** — optional branch, not a forced step in a “one day” sequence. Atmosphere: notebook on calm table |
| **No real-time-of-day switching in V1** | Light arc is **designed into assets**, not switched by clock at runtime |
| **Scales to dynamic recipes** | System must **not** depend on bespoke photography per generated recipe. Use: canonical home atmospheres + meal image slot + graded overlays + fallback material library |

### Screen atmospheres (emotional purpose)

| Screen | Story beat | Atmosphere |
|--------|------------|------------|
| **Welcome** | Arrive home | Real family kitchen — morning light, wood, ceramic, herbs; alive, not staged |
| **Food Preferences** | Before cooking | Raw vegetables & herbs at counter — restriction/safety, not shopping |
| **Tonight** | Dinner is waiting | Selected meal as hero — desirable, warm evening feel |
| **Preview** | You're still making this | **Same meal** visible above; content floats on Warm White below |
| **Cook Mode** | Focus at the stove | Dark cookbook; minimal; peripheral kitchen warmth only |
| **Weekly Plan** | Notebook planning | Bright, calm table/notebook — never spreadsheet |
| **Cook With What I Have** | What's possible? | Ingredients/pantry — not a finished plate |
| **Feedback** | Quiet completion | Post-dinner table — satisfaction, not celebration |

### Visual asset strategy (V1+)

1. **Canonical home library** — one kitchen, one ingredient set, one table — reused across screens  
2. **Meal slot** — `imageUrl` per recommendation; Preview reuses Tonight asset; Feedback uses paired aftermath when available  
3. **Fallback gradients** — acceptable dev placeholder only; production targets photography  
4. **Reject** — stock grids, cuisine banners, per-cuisine color themes, illustration, cartoon, oversaturation  

### Legacy client data (pending review)

The following files exist in the client repo but are **legacy / non-authoritative**. Do not remove or refactor until catalog and Living Kitchen asset strategy is reviewed:

- `apps/recipe-ai/src/data/worldKitchens.ts`
- `apps/recipe-ai/src/data/cuisines/cuisines.ts`

They conflict with The Living Kitchen (cuisine-tourism patterns) and are not wired to active navigation.

---

## Product architecture (three layers)

```text
┌─────────────────────────────────────────────────────────┐
│  EXPERIENCE LAYER (what user sees)                      │
│  Welcome → Preferences → Tonight → Preview → Cook →   │
│  Feedback  (+ optional Weekly Plan)                     │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│  DECISION LAYER (what user feels)                       │
│  decideToday · Cook With What I Have · feedback memory  │
│  · optional week plan · allergen gate                   │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│  CONTENT LAYER (what user never browses)                │
│  Curated world recipes (~50 × cuisine) · inventory     │
│  · household taste (inferred, not forms)               │
└─────────────────────────────────────────────────────────┘
```

The user never enters a "library." The engine pulls from curated content invisibly.

---

## Design language

Photography first · Typography second · Everything else third.

| Token | Value | Use |
|-------|-------|-----|
| Warm White | `#FAF9F7` | Backgrounds |
| Soft Beige | `#F0EDE8` | Dividers, subtle fills |
| Warm Gray | `#9A9590` | Secondary text |
| Deep Charcoal | `#1A1918` | Primary text; Cook background |
| Orange | brand token | Primary actions **only** |

Large whitespace · rounded corners · no colorful illustrations · no gradient noise · no AI branding.

---

## Core user flows

### Flow A — Daily loop

```text
Open → Tonight → Preview → Cook → Feedback → Tonight
```

### Flow B — First launch

```text
Welcome → Auth → (FadiCore household gate) → Weekly Plan opt-in → Tonight
Food Preferences (allergies) — required in vision; wire when product-profile phase lands
```

**Not now** = never ask again (stored preference; no nagging).

**Note:** Weekly Plan is an **optional branch**, not a mandatory step in a linear “one day” sequence.

### Flow C — Cook With What I Have (secondary)

```text
Entry from Tonight (secondary — not home)
User: "I have chicken" or "potatoes and yogurt"
Search order: favourite cuisines → household preferences → available ingredients → other cuisines
→ Single recommendation → Preview → Cook
```

Not a search results grid. One best answer, same Tonight treatment.

### Flow D — Weekly Plan (opt-in only)

```text
If enabled: Mon–Sun, one meal per day, Save
No stats · no calendar chrome · no dashboard
If disabled: engine may whisper "tomorrow" on Tonight — no full planner
```

---

## Content model — World Recipes

**Not** an endless database. A **curated collection**.

| Rule | Spec |
|------|------|
| Scale | ~50 excellent recipes per major cuisine |
| Cuisines | Turkish, Syrian, Lebanese, Moroccan, Italian, Greek, French, Spanish, Mexican, Indian, Japanese, Chinese, Thai, Korean, American (+ pilot locale) |
| Difficulty | Easy · Medium · Advanced in each |
| Categories | Breakfast, soups, mains, sides, desserts, drinks |
| Dedup | Max ~2 similar style per cuisine |
| Principle | **Quality >> quantity** |

No marketplace · no endless scroll · no browse home.

---

## Free vs Premium

### Free — fully usable, no AI required

- Full recipe: ingredients, quantities, prep, cook steps
- Static cooking tips + storage tips (metadata, not LLM)
- Tonight decision (deterministic)
- Cook With What I Have (rule-based)
- Intelligent inventory (bridge or conservative standalone)
- Feedback memory
- Allergen safety (fail-closed)

### Premium — contextual cook assistant (NOT chat)

| Rule | Detail |
|------|--------|
| **Where** | Only during Cook Mode for the **selected recipe** |
| **What** | Structured intents: replace butter · no oven · cook for six · reduce calories · increase protein · make vegetarian |
| **UI** | Inline cards / sheets — **no chat thread, no history, no conversation screen** |
| **When cook ends** | Assistant **disappears completely** |
| **Tone** | Calm home chef — never technical, never "AI" |
| **Safety** | Never overrides allergen gate; never picks a different meal |

---

## Feedback contract

| Action | Behavior |
|--------|----------|
| **Loved it / It was good / Not for us** | One tap, warm UI |
| **Same recipe again** | Never ask feedback again for that recipe |
| **Engine** | Stored; improves Tonight + Cook With What I Have ranking |

---

## Hard exclusions (never ship)

- Dashboard · statistics · social feed
- Recipe marketplace · endless browsing · recipe grid home
- AI branding · technical language · feature overload
- ChatGPT-style chat · chat history · conversational home
- Macro dashboard · pantry admin UI · settings dashboard

---

## Invisible intelligence (what users never see)

- Taste profile weights · KRS scores · search ranking
- Favourite cuisine inference from behavior + locale
- Feedback → recommendation tuning
- Pantry confidence levels (shown as human copy only)
- Premium LLM paths — never labeled

---

## Final quality test (gate every screen)

Before any screen is "done":

1. Would **Apple** ship this?
2. Would **Airbnb** feel proud of this warmth?
3. Would **Oura** accept this simplicity?
4. Still modern in **2030**?
5. Trusted **household companion** — not a recipe app?

**Any "No" → refine before next screen.**

---

## Implementation sequence

| Phase | Deliverable |
|-------|-------------|
| **0** | Design tokens + photo/gradient system + shared components |
| **1** | Welcome + Food Preferences + weekly opt-in |
| **2** | Tonight + Preview + inventory rows |
| **3** | Cook Mode + Feedback |
| **4** | Cook With What I Have (secondary entry) |
| **5** | Weekly Plan (opt-in path only) |
| **6** | Curated catalog (content pipeline, not browse UI) |
| **7** | Premium contextual assistant (Cook only, V1.1) |

---

## References

- Current state audit: [`CURRENT_STATE_AUDIT.md`](CURRENT_STATE_AUDIT.md)
- Logic spec: [`V1_PRODUCT_BLUEPRINT.md`](V1_PRODUCT_BLUEPRINT.md)
- Platform product: [`../../../products/recipeai.md`](../../../products/recipeai.md)
- ADR-0005 override: building from approved design direction (this document)

## Planned next phase

**Phase A1** — ShareYum identity + onboarding/navigation cleanup only (not started; awaiting approval).
