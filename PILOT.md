# St. Pölten Pilot

Validate SmartShop **free tier** before Premium AI.

## Target

- **City:** St. Pölten, Austria
- **Users:** Arabic and Turkish families
- **Goal:** Weekly retention with manual offers and rule-based baskets — no LLM

## In scope

Family profile · manual local offers · compact deterministic baskets · merchant profiles

## Out of scope

OpenAI/LLM · payments · auth backend · OCR runtime · maps · Premium AI

## Success

Families maintain local restaurant/supermarket offers; baskets stay useful; week-over-week return without AI.

## Localization gap

UI is German-only; pilot communities are Arabic/Turkish — address in Figma/localization pass.

## Ops

Manual offer capture may be pilot ops tooling, not consumer burden. Admin screen (`13-admin`) is internal only.

Implementation: `apps/Smart Shop/` (unchanged)
