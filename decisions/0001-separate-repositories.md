# ADR-0001: Separate Repositories for Applications

## Status

Accepted — **physical separation paused** after Phase 1.5. Colocated layout remains until further decision.

## Context

The workspace contained three applications under `apps/` inside one git repository. Smart Shop `core/*.md` accidentally became the de facto platform documentation. Applications need independence for CI, releases, and team ownership — while sharing a single ecosystem constitution.

## Decision

1. **Fadi-Core-Platform** is a docs-only master architecture repository (constitution).
2. **SmartShop**, **FitnessAI**, and **RecipeAI** remain completely independent applications.
3. Phase 1: platform docs colocated at repo root alongside `apps/` — no code moves.
4. Phase 2: physical separation into sibling git repositories.

## Consequences

- Single source of truth for ecosystem philosophy
- Apps retain full code autonomy
- Temporary duplication between platform docs and app `core/*.md` until Phase 2 pointer migration
- Registry files track colocated vs sibling paths

## References

- [`registry.yaml`](../registry.yaml)
- [`GOVERNANCE.md`](../GOVERNANCE.md)
