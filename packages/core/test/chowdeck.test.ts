import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_CATALOG,
  buildGroceryLinks,
  buildOrderIntent,
  buildSearchLinks,
  defaultOrderMode,
  encodeSearchQuery,
} from '../src';

const efo = DEFAULT_CATALOG.meals.find((m) => m.id === 'efo-riro-turkey-low-carb')!;

describe('chowdeck links', () => {
  it('encodes spaces as + to match chowdeck://search?query=Efo+Riro', () => {
    assert.equal(encodeSearchQuery('Efo Riro'), 'Efo+Riro');
    assert.equal(buildSearchLinks('Efo Riro').nativeUrl, 'chowdeck://search?query=Efo+Riro');
    assert.equal(buildSearchLinks('Efo Riro').webUrl, 'https://chowdeck.com/search?query=Efo+Riro');
  });

  it('escapes reserved characters', () => {
    assert.equal(encodeSearchQuery('Rice & Stew'), 'Rice+%26+Stew');
  });

  it('points grocery orders at the groceries category with a web fallback', () => {
    assert.deepEqual(buildGroceryLinks(), {
      nativeUrl: 'chowdeck://groceries',
      webUrl: 'https://chowdeck.com/groceries',
    });
  });

  it('maps prep styles to the right default order mode', () => {
    assert.equal(defaultOrderMode('ready-to-eat-order'), 'ready-to-eat');
    assert.equal(defaultOrderMode('sunday-bulk-prep'), 'ingredients');
    assert.equal(defaultOrderMode('daily-quick-cook'), 'ingredients');
  });
});

describe('buildOrderIntent', () => {
  it('ready-to-eat searches the dish and carries no grocery list', () => {
    const intent = buildOrderIntent({ mode: 'ready-to-eat', servings: [{ meal: efo, servings: 1 }] });
    assert.equal(intent.nativeUrl, 'chowdeck://search?query=Efo+Riro');
    assert.equal(intent.title, efo.name);
    assert.equal(intent.groceryList, undefined);
  });

  it('ingredients mode groups a grocery list and opens the groceries category', () => {
    const intent = buildOrderIntent({ mode: 'ingredients', servings: [{ meal: efo, servings: 2 }] });
    assert.equal(intent.nativeUrl, 'chowdeck://groceries');
    assert.ok(intent.groceryList && intent.groceryList.itemCount > 0);
    const turkey = intent.groceryList!.groups.flatMap((g) => g.items).find((i) => i.ingredientId === 'turkey')!;
    assert.equal(turkey.quantity, 0.5);
  });

  it('refuses an empty order', () => {
    assert.throws(() => buildOrderIntent({ mode: 'ingredients', servings: [] }));
  });
});
