# ADR-0003: No Chat-as-Product

## Status

Accepted

## Context

Fitness apps default to AI chat coaches. Recipe apps default to conversational meal planning. Both create cognitive overload and position the product as "another ChatGPT wrapper."

## Decision

No application in the ecosystem uses conversational AI as a primary interface.

- Coach/guidance = short daily cards and inline "why" on outcomes
- Explanation on demand — not a destination tab
- Future AI may narrate brain output — never replace brain output

## Consequences

- FitnessAI Coach tab is a redesign candidate (move inline)
- RecipeAI blueprint explicitly excludes chat-first AI UI
- SmartShop `09-ai-assistant` dead route should not ship

## References

- [`philosophy/PRINCIPLES.md`](../philosophy/PRINCIPLES.md) · [`ai/PRINCIPLES.md`](../ai/PRINCIPLES.md)
