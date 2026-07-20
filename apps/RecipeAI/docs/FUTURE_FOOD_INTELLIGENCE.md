# ShareYum — Future Food Intelligence

> **Documentation only.** No runtime implementation. Not A2.3.  
> **Companion:** [`FUTURE_INFORMATION_ARCHITECTURE.md`](FUTURE_INFORMATION_ARCHITECTURE.md) (boundaries, membership, entitlements)  
> **Platform principles:** [`../../philosophy/PRINCIPLES.md`](../../philosophy/PRINCIPLES.md) — invisible intelligence, behavior over forms, one question per screen

## Core product principle

**Complex inside. Simple outside.**

Users must not configure dozens of filters, food-science parameters, cultural matrices, flavor profiles, or scoring controls. For most decision moments, expose **one or two simple questions**, then deliver useful recommendations.

Example flow:

1. **“Who are you cooking for?”**
   - My household
   - Friends
   - Guests
   - A special occasion

2. **“What would you like?”** *(only if the first answer materially changes the recommendation)*
   - Something I already know how to cook
   - Help me choose
   - Surprise them
   - Teach me something from their preferred cuisine

That may be enough. Everything else is inferred from safe, permissioned context and handled by the intelligence layer.

---

## 1. Simple outside — intelligent inside

### User experience

```
question → one tap → (maybe one follow-up) → useful recommendation
```

### Non-goals

- Do not expose the full decision-engine complexity.
- Do not turn ShareYum into a settings dashboard.
- Do not repeat questions when context is already known.

### Progressive disclosure

Ask another question **only when the answer materially changes the recommendation**. Reuse:

- FadiCore household/member identity
- ShareYum member food profiles and feedback history
- Cook Mode / cooking history
- Meal participation for tonight
- Permissioned ShareCart inventory (future)
- Permissioned ShareFit constraints (future)

---

## 2. “Cook for someone”

Future ShareYum supports:

> “I want to cook for someone.”

**Scenario:** An Austrian host invites an Arab/Syrian family. The host does **not** necessarily need to learn a completely unfamiliar Syrian recipe.

The engine must understand:

| Signal | Source |
|--------|--------|
| What the host can successfully cook | Cook history, skill model, feedback |
| What guests explicitly like/dislike | Guest food profile, stated preferences |
| Dietary/safety constraints | Allergies, restrictions — deterministic |
| Compatible preparation styles | Technique overlap, texture familiarity |
| Valid culinary adaptation | Compatibility engine — not arbitrary swap |

### Recommendation paths

| Path | When |
|------|------|
| **A. Familiar host dish** | Already fits guest constraints and preferences |
| **B. Adapted host dish** | Host knows the base; validated adaptations bridge to guest needs |
| **C. Achievable authentic guest-cuisine dish** | Host skill + time support it; safety and compatibility pass |

**Objective:** Find the safest and most delicious **bridge** between the cook and the people eating — not “pick a cuisine and browse.”

---

## 3. Do not model culture as a stereotype

### Forbidden

Never encode deterministic rules such as:

- “Arab = likes X”
- “Austrian = dislikes Y”
- “Kurdish = dislikes Z”

**Nationality and ethnicity are not personal food preferences.**

### Preference confidence hierarchy

Use signals in this order (strongest first):

1. **Explicit individual preference** — user or guest stated
2. **Household/guest feedback history** — meal-level outcomes
3. **Known dietary restrictions** — safety layer
4. **Previous successful/unsuccessful meals** — same dish, same context
5. **Explicitly selected cuisine/context** — user chose “Levantine tonight”
6. **Broad culinary patterns** — weak suggestion only; never decisive alone

### When confidence is insufficient

**Ask one simple question.**

Example:

> “Would your guests prefer something familiar to their cuisine, or would you rather serve your own style?”

One tap. No matrix. No nationality picker disguised as preference.

---

## 4. Ingredient ≠ dish ≠ preparation

Food preference must eventually be modeled across dimensions, not collapsed to a single “likes artichokes” boolean.

| Dimension | Examples |
|-----------|----------|
| Ingredient | artichoke |
| Flavor | lemon, umami |
| Aroma | garlic-forward |
| Texture | crispy, creamy |
| Cooking technique | fried, braised, raw |
| Sauce / base | tomato, yogurt, béchamel |
| Seasoning | heat level, herb profile |
| Temperature | hot served vs cold salad |
| Presentation / serving | shared platter vs plated |
| Dish context | weekday dinner vs celebration |

### Feedback granularity

**“Did not like this artichoke dish”** must **not** automatically become **“Dislikes artichokes.”**

Attach feedback to the most appropriate level:

- dish
- preparation style
- component (sauce, side, garnish)
- ingredient-in-context (optional, with evidence)

Negative feedback on one preparation should not over-penalize unrelated preparations of the same ingredient.

---

## 5. Culinary compatibility engine

Cross-cuisine adaptation must **not** be arbitrary ingredient substitution.

### Bad architecture

```
Guest dislikes yogurt → replace yogurt with tomato
```

This may destroy the dish’s structure, acidity balance, and cultural coherence.

### Required layer: Culinary Compatibility / Food Transformation

Before suggesting an adaptation, evaluate:

- Flavor compatibility (sweet, sour, salty, bitter, umami)
- Aroma compounds / flavor families where useful
- Acidity, sweetness, salt, fat, moisture, texture
- Spice/heat tolerance
- Cooking reaction / technique (Maillard, emulsion, fermentation)
- Sauce structure and ingredient **functional role**
- Temperature and serving context
- Traditional dish structure
- **Food safety** (allergens, cross-contact, temperature danger zone)

### Ingredient functional roles

A replacement must preserve necessary culinary function, not merely share a culturally familiar name.

| Role | Examples |
|------|----------|
| Acid | lemon, vinegar, yogurt (also fat) |
| Fat / emulsifier | oil, butter, tahini |
| Thickener | starch, reduction |
| Moisture | broth, tomato, wine |
| Fermentation | pickle, miso, labneh |
| Binding | egg, starch |
| Sweetness | honey, onion caramelization |
| Aroma | herbs, spices, alliums |

---

## 6. Three levels of adaptation

Every recommendation that modifies a base recipe must be classified:

| Level | Name | Description | Default preference |
|-------|------|-------------|------------------|
| **1** | Proven recipe | Existing trusted recipe that already fits | **Preferred whenever possible** |
| **2** | Validated adaptation | Limited substitutions or technique changes supported by compatibility rules | When bridge needed |
| **3** | AI creative adaptation | Novel proposal when user wants creativity or no validated match exists | Last resort; must pass validation |

### Level 2 examples (validated)

- Adjust seasoning or heat
- Change an appropriate side
- Modify garnish or presentation
- Reduce spice with compatible mellowing
- Choose a validated substitute (same functional role)

### Level 3 guardrails

- Never let generative AI freely replace ingredients and assume the dish works.
- Must pass deterministic safety and compatibility checks before surfacing.
- Clearly labeled (see §11 Authenticity labeling).

---

## 7. Food knowledge before generative AI

AI is **not** the source of truth for safety or culinary validity. It assists after constraints are applied.

### Pipeline (conceptual)

```
Safety Rules (deterministic, fail-closed)
        ↓
Recipe / Ingredient Knowledge (catalog, techniques, roles)
        ↓
Culinary Compatibility Engine (validated transforms)
        ↓
Household + Guest Preferences (explicit + feedback)
        ↓
Context / Occasion (guests, celebration, budget, time)
        ↓
Candidate Recipes / Adaptations (L1 / L2 / L3)
        ↓
AI reasoning / explanation / ranking / creative variation
        ↓
Validation (safety + compatibility re-check)
        ↓
Recommendation (small set, with clear reasons)
```

### AI is NOT authoritative for

- Allergy and dietary safety
- Ingredient functional compatibility
- Validated substitutions
- Declaring a dish “authentic traditional”

### AI IS useful for

- Interpreting simple natural-language intent (“something impressive for Saturday guests”)
- Explaining **why** a recommendation fits
- Ranking contextual options within safe candidates
- Personalization within constraints
- Creative variations **after** constraints are fixed
- Generating understandable cooking guidance

---

## 8. Host skill matters

A recommendation is useless if the cook cannot execute it.

### Future skill / confidence model (inputs)

- Dishes successfully cooked (Cook Mode completion)
- Techniques previously completed
- Explicit skill level when necessary (rare — one simple question max)
- Feedback on difficulty vs outcome
- Time and equipment available

### Bridge example

Host comfortably cooks Schnitzel and pasta. Guests prefer Levantine-style food.

**Do not** force a technically difficult unfamiliar dish by default.

**Do** search for:

```
what host cooks well
+ validated flavor/serving adaptations
+ guest explicit preferences
+ culinary coherence check
```

If no coherent bridge exists → recommend a different **proven** recipe (Level 1), not a risky fusion.

---

## 9. Learn from real outcomes

Feedback improves future decisions. Keep the UI minimal.

### After a meal (examples)

**Primary:** “Did everyone enjoy it?” → Yes / Mostly / No

**Optional single follow-up** (only if No or Mostly):

“What was the issue?”

- Flavor
- Texture
- Too spicy
- Too heavy
- Ingredient
- Other

No surveys. No multi-page forms. Richer signals are inferred internally and attached at appropriate granularity (§4).

---

## 10. Example: cultural bridge without stereotyping

**User:** “I’m inviting friends. I know how to make Schnitzel and pasta. Help me serve something they’ll enjoy.”

**Wrong:** Assume preferences from guest ethnicity → “Here are Syrian recipes.”

**Right:**

1. One question if needed: **“What kind of food would you like to serve?”**
   - Something familiar to them
   - My style, adapted for the occasion
   - Help me choose

2. Use **explicit** guest preferences and feedback history only.

3. Discover skill overlap (e.g. crispy breaded technique → accessible texture for many palates).

4. If adaptation is valid: adjust sides, seasoning, or presentation **with compatibility checks** — not “Syrian Schnitzel” without validation and labeling.

Forcing an unfamiliar recipe solely because guests selected another cuisine is **worse** than a well-bridged dish the host can execute.

---

## 11. Authenticity labeling

Never call an invented adaptation an authentic traditional dish.

| Label | Meaning |
|-------|---------|
| **Traditional** | Documented traditional preparation; no material structural change |
| **Adapted** | Same dish family with validated substitutions or technique adjustments |
| **Inspired by** | Flavor or presentation cues from a cuisine; structurally different |
| **Fusion** | Intentional cross-cuisine combination; explicitly marked |

**Bad:** “Authentic Syrian Schnitzel”  
**Good:** “Levantine-inspired adaptation of your usual Schnitzel — adjusted sides and seasoning.”

Honesty builds trust. Mislabeling destroys it.

---

## 12. Confidence + fallback

The system must know when **not** to invent.

If culinary compatibility confidence is low:

1. **Do not** create a risky substitution.
2. **Fallback order:**
   - Recommend a proven recipe (Level 1)
   - Recommend a compatible **side** instead of altering the main dish
   - Ask **one** clarification question
   - Offer an AI idea only as **experimental / adapted**, after validation, with low-confidence warning

> A safe “Keep the original recipe; change the side” beats a bad creative dish.

---

## 13. Long-term architectural goal

ShareYum should eventually answer:

> **“What can I successfully cook, for these particular people, in this situation, using what I have, within my time and budget, that they are most likely to enjoy?”**

Not:

> “Choose a cuisine and browse recipes.”

| Visible to user | Hidden in intelligence layer |
|-----------------|------------------------------|
| 1–2 calm questions | Safety, compatibility, skill, inventory, scoring |
| Small set of strong options | Candidate generation, validation, ranking |
| Clear, honest reasons | Feedback learning, preference dimensions |

**Complexity belongs behind the interface.** The product remains calm.

---

## Data model implications (future — do not implement now)

These structures are **conceptual targets** so A2.3+ work does not paint into a corner:

### MemberFoodProfile (ShareYum, keyed by FadiCore `memberId`)

- Safety: allergies, restrictions (hard constraints)
- Preferences: multi-dimensional, confidence-scored — not flat ingredient booleans
- Feedback history: meal-linked, preparation-aware
- Skill profile (host): techniques mastered, dishes completed

### MealDecisionContext (per decision)

- Participation: who is eating (household members + guests)
- Intent: household / friends / guests / special occasion
- User choice: known dish / help choose / surprise / teach me
- Time, budget, inventory snapshot (permissioned)
- Occasion metadata (celebration, guest count)

### RecipeAdaptationRecord

- `adaptationLevel`: 1 | 2 | 3
- `authenticityLabel`: traditional | adapted | inspired_by | fusion
- `compatibilityScore` + validation audit trail
- `substitutions[]` with functional role mapping

### FeedbackEvent

- `scope`: dish | preparation | component | ingredient_in_context
- `outcome`: enjoyed | mixed | rejected
- `issueTag`: flavor | texture | spice | heavy | ingredient | other
- Links to recipe, adaptation record, participants

---

## Architecture readiness audit (current codebase)

Read-only check: does **today’s** implementation block this future model?

| Area | Current state | Blocks future? |
|------|---------------|--------------|
| FadiCore vs ShareYum boundaries | Identity in FadiCore; food prefs planned in ShareYum | **No** — aligned |
| Household vs meal participation | Documented separate; `familySize` unused | **No** — participation model still open |
| Onboarding cuisine IDs | Canonical A2.2 families; no nationality stereotypes in UI | **No** |
| Preference storage | `favoriteCuisines[]`, `allergies[]` in localStorage; not consumed by engine | **No** — shallow today; room for rich profiles later |
| Tonight / Weekly Plan | Static fixtures (`mockRecommendation`, `defaultWeekPlan`) | **No** — not falsely personalized |
| Feedback UI | Simple rating exists; no granular learning yet | **No** — can extend without breaking |
| SPA / food-core boundary | SPA cannot import `@recipe-ai/food-core` | **No** — server-side engine fits pipeline |
| AI placement | No generative runtime in SPA | **No** — matches “knowledge before AI” |

### Risks to avoid in future work

1. **Flat preference booleans** — do not model “dislikes artichokes” from one dish failure.
2. **Cuisine-as-proxy-for-person** — do not score guests by nationality.
3. **UI leakage** — do not expose compatibility scores, flavor matrices, or adaptation levels as user settings.
4. **AI-first substitutions** — any Level 3 output must pass deterministic validation.
5. **Static headcount** — servings must derive from meal participation, not a single `familySize` field.

---

## Related documents

| Document | Scope |
|----------|--------|
| [`FUTURE_INFORMATION_ARCHITECTURE.md`](FUTURE_INFORMATION_ARCHITECTURE.md) | Ecosystem boundaries, membership, guest hosting context, entitlements |
| [`V1_PRODUCT_BLUEPRINT.md`](V1_PRODUCT_BLUEPRINT.md) | V1 logic spec (partially superseded by platform for UI scope) |
| [`../../products/recipeai.md`](../../products/recipeai.md) | Platform product direction |
| [`../../ai/PRINCIPLES.md`](../../ai/PRINCIPLES.md) | Platform AI principles |

**Status:** Architecture / product documentation only. No runtime feature. Not A2.3.
