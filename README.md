# Lagos Meal Planner

Meal planning for busy Lagos professionals with decision fatigue. Opinionated Naija meal engine, a Brain-Dead Mode for exhausted evenings, and one-tap ordering through Chowdeck (deep link, no in-app checkout).

## Layout

```
apps/
  mobile/          Expo + React Native + NativeWind (expo-router)
    app/             Route files (thin wrappers only)
    src/screens/     DashboardScreen, OnboardingScreen
    src/components/  ui/, onboarding/, dashboard/, order/
    src/store/       zustand store persisted to AsyncStorage
    src/services/    chowdeckLinking (Linking.openURL), planService
  api/             Node.js + TypeScript HTTP API (no framework dependencies)
    src/http/        Router, error handling, body parsing
    src/modules/     routes, validation, profile repository (swap in a real DB here)
packages/
  core/            Platform-agnostic TypeScript. No React, no Node APIs.
    src/types/       UserProfile, MealPlan, Ingredient, Meal, ChowdeckOrderIntent
    src/data/        Lagos ingredient + meal catalog
    src/engine/      Filtering, weekly plan generation, Brain-Dead swaps, grocery lists
    src/chowdeck/    URL builders and order intents
    src/profile/     Onboarding state machine (pure reducer)
    test/            node:test suites
```

The mobile app and the API both import `@mealplanner/core`. Moving planning to the server is a change inside `apps/mobile/src/services/planService.ts` only; the API already exposes the same engine.

## Run it

```bash
npm install            # from the repo root
npm test               # core unit tests
npm run typecheck      # all workspaces

npm run mobile         # Expo dev server (scan with Expo Go, or press a / i)
npm run api            # http://localhost:4000
```

## Behaviour

- **Onboarding** is a reducer in `packages/core/src/profile/machine.ts`: diet, allergies and dislikes, prep style, review. Every transition is guarded (you cannot advance without a diet or prep style).
- **Plan generation** is deterministic for `(profile, startDate, seed)`. Allergens are a hard filter and never relaxed; diet and dislikes relax in that order only if nothing else is available. Sunday Bulk Prep repeats a batch-friendly lunch/dinner for up to three days; Daily Quick Cook favours meals under 30 minutes; Ready-to-Eat favours restaurant-style dishes.
- **Brain-Dead Mode** swaps every meal needing real cooking for the closest-calorie option that takes 20 minutes or less, still respecting allergies, dislikes and diet. Both plans are computed up front, so the toggle is instant and works offline.
- **Ordering** (`Order via Chowdeck`):
  - Ready-to-eat: `chowdeck://search?query=Efo+Riro`, fallback `https://chowdeck.com/search?query=Efo+Riro`.
  - Ingredients: an aggregated, category-grouped grocery list (quantities rounded up to buyable amounts, cost estimated), then `chowdeck://groceries`, fallback `https://chowdeck.com/groceries`.
  - The default mode follows the user's prep style and can be flipped per meal.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness |
| GET | `/v1/catalog` | Meals and ingredients |
| POST | `/v1/profiles` | Create a profile |
| GET | `/v1/profiles/:id` | Fetch a profile |
| POST | `/v1/profiles/:id/plans` | Generate a plan (`startDate`, `seed`, `brainDeadMode`) |
| POST | `/v1/orders/chowdeck` | Build an order intent (`mode`, `mealIds`, `servings`) |

## Things to verify before shipping

1. **Chowdeck URLs.** The `chowdeck://search`, `chowdeck://groceries` schemes and the `chowdeck.com` fallback paths come from the project brief. They have not been confirmed against Chowdeck's real URL scheme or any partnership terms. If they differ, change `CHOWDECK_CONFIG` in `packages/core/src/chowdeck/links.ts`; nothing else hard-codes them. The fallback logic itself (try the app, catch, open the web URL) does not depend on the exact scheme.
2. **Catalog data.** Macros and naira prices are rough estimates and not medical or pricing advice. Replace with vetted nutrition data and live Chowdeck pricing.
3. **Chowdeck cannot receive the cart.** Deep links open Groceries but do not pre-fill items, which is why the list is shown on screen and shareable.
