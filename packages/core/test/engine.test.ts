import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_CATALOG,
  MEAL_SLOTS,
  NoSafeMealError,
  applyBrainDeadMode,
  buildGroceryList,
  generateWeeklyPlan,
  getCandidates,
  isMealSafe,
  matchesDiet,
  type DietaryPreference,
  type MealSlot,
  type PrepStyle,
  type UserProfile,
} from '../src';

const DIETS: DietaryPreference[] = [
  'fit-fam-high-protein',
  'keto',
  'weight-loss',
  'low-sugar',
  'no-restrictions',
];
const PREP_STYLES: PrepStyle[] = ['daily-quick-cook', 'sunday-bulk-prep', 'ready-to-eat-order'];

function profile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'test-user',
    dietaryPreference: 'no-restrictions',
    allergens: [],
    dislikedIngredientIds: [],
    prepStyle: 'daily-quick-cook',
    householdSize: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('catalog', () => {
  it('has unique meal and ingredient ids', () => {
    const mealIds = DEFAULT_CATALOG.meals.map((m) => m.id);
    const ingredientIds = DEFAULT_CATALOG.ingredients.map((i) => i.id);
    assert.equal(new Set(mealIds).size, mealIds.length);
    assert.equal(new Set(ingredientIds).size, ingredientIds.length);
  });

  it('covers every diet x slot with enough variety, with and without brain-dead', () => {
    for (const diet of DIETS) {
      for (const slot of MEAL_SLOTS) {
        const p = profile({ dietaryPreference: diet });
        const all = getCandidates(p, slot).filter((m) => matchesDiet(m, slot, diet));
        const easy = getCandidates(p, slot, DEFAULT_CATALOG, (m) => m.effort === 'brain-dead').filter(
          (m) => matchesDiet(m, slot, diet),
        );
        assert.ok(all.length >= 3, `${diet}/${slot}: only ${all.length} meals`);
        assert.ok(easy.length >= 1, `${diet}/${slot}: no brain-dead meal`);
      }
    }
  });
});

describe('generateWeeklyPlan', () => {
  it('is deterministic for the same inputs', () => {
    const a = generateWeeklyPlan({ profile: profile(), startDate: '2026-03-02' });
    const b = generateWeeklyPlan({ profile: profile(), startDate: '2026-03-02' });
    const ids = (p: typeof a) => p.days.map((d) => MEAL_SLOTS.map((s) => d.meals[s].meal.id));
    assert.deepEqual(ids(a), ids(b));
  });

  it('plans 7 consecutive days with three meals each and no same-day repeats', () => {
    const plan = generateWeeklyPlan({ profile: profile(), startDate: '2026-02-26' });
    assert.equal(plan.days.length, 7);
    assert.deepEqual(
      plan.days.map((d) => d.date),
      ['2026-02-26', '2026-02-27', '2026-02-28', '2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04'],
    );
    for (const day of plan.days) {
      const ids = MEAL_SLOTS.map((s) => day.meals[s].meal.id);
      assert.equal(new Set(ids).size, 3);
    }
  });

  it('respects every diet for every prep style', () => {
    for (const diet of DIETS) {
      for (const prepStyle of PREP_STYLES) {
        const p = profile({ dietaryPreference: diet, prepStyle });
        const plan = generateWeeklyPlan({ profile: p, startDate: '2026-03-02' });
        for (const day of plan.days) {
          for (const slot of MEAL_SLOTS) {
            assert.ok(
              matchesDiet(day.meals[slot].meal, slot, diet),
              `${diet}/${prepStyle}/${slot}: ${day.meals[slot].meal.id}`,
            );
          }
        }
      }
    }
  });

  it('never includes an allergen, even combined with a strict diet', () => {
    const p = profile({
      dietaryPreference: 'keto',
      allergens: ['egg', 'fish'],
      prepStyle: 'sunday-bulk-prep',
    });
    const plan = generateWeeklyPlan({ profile: p, startDate: '2026-03-02' });
    for (const day of plan.days) {
      for (const slot of MEAL_SLOTS) {
        assert.ok(isMealSafe(day.meals[slot].meal, p), day.meals[slot].meal.id);
      }
    }
  });

  it('honours disliked ingredients when alternatives exist', () => {
    const p = profile({ dislikedIngredientIds: ['ponmo', 'smoked-fish', 'plantain'] });
    const plan = generateWeeklyPlan({ profile: p, startDate: '2026-03-02' });
    for (const day of plan.days) {
      for (const slot of MEAL_SLOTS) {
        const ids = day.meals[slot].meal.ingredients.map((i) => i.ingredientId);
        for (const banned of p.dislikedIngredientIds) assert.ok(!ids.includes(banned));
      }
    }
  });

  it('batches lunches and dinners for Sunday bulk prep', () => {
    const p = profile({ prepStyle: 'sunday-bulk-prep' });
    const plan = generateWeeklyPlan({ profile: p, startDate: '2026-03-01' });
    const uniqueDinners = new Set(plan.days.map((d) => d.meals.dinner.meal.id));
    assert.ok(uniqueDinners.size <= 4, `expected batching, got ${uniqueDinners.size} unique dinners`);
  });

  it('throws NoSafeMealError instead of returning an unsafe plan', () => {
    const p = profile({ allergens: ['egg', 'fish', 'shellfish', 'gluten', 'legumes', 'nuts', 'dairy'] });
    assert.throws(() => generateWeeklyPlan({ profile: p, startDate: '2026-03-02' }), NoSafeMealError);
  });
});

describe('applyBrainDeadMode', () => {
  it('leaves only brain-dead meals, flags swaps, and keeps the original plan untouched', () => {
    for (const diet of DIETS) {
      const p = profile({ dietaryPreference: diet, prepStyle: 'sunday-bulk-prep' });
      const plan = generateWeeklyPlan({ profile: p, startDate: '2026-03-02' });
      const snapshot = JSON.stringify(plan);
      const easy = applyBrainDeadMode(plan, p);

      assert.equal(JSON.stringify(plan), snapshot, 'input plan must not be mutated');
      assert.equal(easy.lowEffort, true);

      for (const [i, day] of easy.days.entries()) {
        for (const slot of MEAL_SLOTS as readonly MealSlot[]) {
          const planned = day.meals[slot];
          assert.equal(planned.meal.effort, 'brain-dead', `${diet}/${slot}: ${planned.meal.id}`);
          assert.ok(matchesDiet(planned.meal, slot, diet));
          const original = plan.days[i]!.meals[slot].meal;
          assert.equal(planned.swappedForLowEffort, original.effort !== 'brain-dead');
          if (planned.swappedForLowEffort) assert.equal(planned.originalMealId, original.id);
        }
      }
    }
  });

  it('keeps allergens out of swapped meals', () => {
    const p = profile({ allergens: ['egg'], prepStyle: 'sunday-bulk-prep' });
    const easy = applyBrainDeadMode(generateWeeklyPlan({ profile: p, startDate: '2026-03-02' }), p);
    for (const day of easy.days) {
      for (const slot of MEAL_SLOTS) assert.ok(isMealSafe(day.meals[slot].meal, p));
    }
  });
});

describe('buildGroceryList', () => {
  it('sums quantities across meals, scales by servings and rounds up to buyable amounts', () => {
    const indomie = DEFAULT_CATALOG.meals.find((m) => m.id === 'elevated-indomie-egg')!;
    const list = buildGroceryList([{ meal: indomie, servings: 3 }]);
    const items = list.groups.flatMap((g) => g.items);
    const noodles = items.find((i) => i.ingredientId === 'indomie')!;
    const eggs = items.find((i) => i.ingredientId === 'eggs')!;
    const oil = items.find((i) => i.ingredientId === 'vegetable-oil')!;
    assert.equal(noodles.quantity, 6);
    assert.equal(eggs.quantity, 6);
    assert.equal(oil.quantity, 0.25);
    assert.equal(list.itemCount, items.length);
    assert.equal(list.totalEstimatedNgn, items.reduce((n, i) => n + i.estimatedCostNgn, 0));
  });

  it('merges shared ingredients across different meals', () => {
    const [a, b] = ['dodo-and-eggs', 'avocado-boiled-eggs'].map(
      (id) => DEFAULT_CATALOG.meals.find((m) => m.id === id)!,
    );
    const list = buildGroceryList([
      { meal: a!, servings: 1 },
      { meal: b!, servings: 1 },
    ]);
    const eggs = list.groups.flatMap((g) => g.items).filter((i) => i.ingredientId === 'eggs');
    assert.equal(eggs.length, 1);
    assert.equal(eggs[0]!.quantity, 5);
  });
});
