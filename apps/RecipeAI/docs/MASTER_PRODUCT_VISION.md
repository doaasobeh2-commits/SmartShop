# Recipe AI — Master Product Vision (Locked)

> **Status:** Canonical north star for all UI, content, and engineering.  
> **Supersedes:** Earlier briefs where they conflict — especially Premium: **contextual cook assistant**, not chat.

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
Welcome → Food Preferences (allergies)
        → "Plan your week's meals?" → Yes | Not now
        → Tonight
```

**Not now** = never ask again (stored preference; no nagging).

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

- Logic spec: [`V1_PRODUCT_BLUEPRINT.md`](V1_PRODUCT_BLUEPRINT.md)
- Platform product: [`../../../products/recipeai.md`](../../../products/recipeai.md)
- ADR-0005 override: building from approved design direction (this document)
