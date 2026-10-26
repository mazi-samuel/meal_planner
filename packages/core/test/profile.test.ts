import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildUserProfile,
  canAdvance,
  initialProfileFormState,
  profileFormReducer as reduce,
  type ProfileFormEvent,
  type ProfileFormState,
} from '../src';

function run(events: ProfileFormEvent[], from: ProfileFormState = initialProfileFormState) {
  return events.reduce(reduce, from);
}

describe('profile form state machine', () => {
  it('blocks NEXT until a diet is chosen', () => {
    assert.equal(canAdvance(initialProfileFormState), false);
    assert.equal(run([{ type: 'NEXT' }]).step, 'diet');
    assert.equal(run([{ type: 'SELECT_DIET', diet: 'keto' }, { type: 'NEXT' }]).step, 'exclusions');
  });

  it('allows skipping exclusions but requires a prep style', () => {
    const atPrep = run([{ type: 'SELECT_DIET', diet: 'keto' }, { type: 'NEXT' }, { type: 'NEXT' }]);
    assert.equal(atPrep.step, 'prepStyle');
    assert.equal(run([{ type: 'NEXT' }], atPrep).step, 'prepStyle');
  });

  it('toggles allergens and dislikes only on the exclusions step', () => {
    assert.deepEqual(run([{ type: 'TOGGLE_ALLERGEN', allergen: 'fish' }]).allergens, []);
    const s = run([
      { type: 'SELECT_DIET', diet: 'low-sugar' },
      { type: 'NEXT' },
      { type: 'TOGGLE_ALLERGEN', allergen: 'fish' },
      { type: 'TOGGLE_DISLIKE', ingredientId: 'ponmo' },
      { type: 'TOGGLE_ALLERGEN', allergen: 'egg' },
      { type: 'TOGGLE_ALLERGEN', allergen: 'fish' },
    ]);
    assert.deepEqual(s.allergens, ['egg']);
    assert.deepEqual(s.dislikedIngredientIds, ['ponmo']);
  });

  it('walks the full flow, clamps household size and builds a profile', () => {
    const state = run([
      { type: 'SELECT_DIET', diet: 'fit-fam-high-protein' },
      { type: 'NEXT' },
      { type: 'TOGGLE_ALLERGEN', allergen: 'nuts' },
      { type: 'NEXT' },
      { type: 'SELECT_PREP_STYLE', prepStyle: 'sunday-bulk-prep' },
      { type: 'NEXT' },
      { type: 'SET_HOUSEHOLD_SIZE', size: 99 },
      { type: 'SUBMIT' },
    ]);
    assert.equal(state.step, 'done');
    assert.equal(state.householdSize, 8);

    const profile = buildUserProfile(state, { id: 'u1', now: new Date('2026-03-01T10:00:00Z') });
    assert.equal(profile.dietaryPreference, 'fit-fam-high-protein');
    assert.equal(profile.prepStyle, 'sunday-bulk-prep');
    assert.deepEqual(profile.allergens, ['nuts']);
    assert.equal(profile.createdAt, '2026-03-01T10:00:00.000Z');
  });

  it('goes back but never past the first step', () => {
    const s = run([{ type: 'SELECT_DIET', diet: 'keto' }, { type: 'NEXT' }, { type: 'BACK' }, { type: 'BACK' }]);
    assert.equal(s.step, 'diet');
  });

  it('refuses to submit or build from an incomplete form', () => {
    assert.equal(run([{ type: 'SUBMIT' }]).step, 'diet');
    assert.throws(() => buildUserProfile(initialProfileFormState, { id: 'x' }));
  });
});
