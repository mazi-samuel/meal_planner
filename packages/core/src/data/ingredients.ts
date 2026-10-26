import type { Ingredient } from '../types';

/**
 * Lagos pantry. Prices are rough market estimates in naira and exist only to
 * give users a ballpark; swap for live Chowdeck pricing once an API exists.
 */
export const INGREDIENTS: readonly Ingredient[] = [
  // Tubers
  { id: 'yam', name: 'Yam', localName: 'Isu', category: 'tubers', unit: 'kg', unitPriceNgn: 1800, allergens: [], chowdeckQuery: 'Yam' },
  { id: 'plantain', name: 'Plantain', localName: 'Ogede', category: 'tubers', unit: 'piece', unitPriceNgn: 400, allergens: [], chowdeckQuery: 'Plantain' },
  { id: 'sweet-potato', name: 'Sweet potato', localName: 'Anamo', category: 'tubers', unit: 'kg', unitPriceNgn: 1500, allergens: [], chowdeckQuery: 'Sweet Potato' },

  // Grains
  { id: 'basmati-rice', name: 'Basmati rice', category: 'grains', unit: 'kg', unitPriceNgn: 4000, allergens: [], chowdeckQuery: 'Basmati Rice' },
  { id: 'local-rice', name: 'Local (ofada) rice', localName: 'Ofada', category: 'grains', unit: 'kg', unitPriceNgn: 2500, allergens: [], chowdeckQuery: 'Ofada Rice' },
  { id: 'oats', name: 'Oats', category: 'grains', unit: 'pack', unitPriceNgn: 3000, allergens: ['gluten'], chowdeckQuery: 'Oats' },

  // Swallow
  { id: 'poundo-yam', name: 'Poundo yam flour', category: 'swallow', unit: 'kg', unitPriceNgn: 3200, allergens: [], chowdeckQuery: 'Poundo Yam' },
  { id: 'amala', name: 'Amala (yam flour)', category: 'swallow', unit: 'kg', unitPriceNgn: 2800, allergens: [], chowdeckQuery: 'Amala Flour' },
  { id: 'semo', name: 'Semovita', localName: 'Semo', category: 'swallow', unit: 'kg', unitPriceNgn: 2200, allergens: ['gluten'], chowdeckQuery: 'Semovita' },
  { id: 'garri', name: 'Garri', localName: 'Eba', category: 'swallow', unit: 'kg', unitPriceNgn: 1600, allergens: [], chowdeckQuery: 'Garri' },

  // Proteins
  { id: 'eggs', name: 'Eggs', category: 'proteins', unit: 'piece', unitPriceNgn: 250, allergens: ['egg'], chowdeckQuery: 'Eggs' },
  { id: 'chicken', name: 'Chicken', category: 'proteins', unit: 'kg', unitPriceNgn: 5500, allergens: [], chowdeckQuery: 'Chicken' },
  { id: 'turkey', name: 'Turkey', category: 'proteins', unit: 'kg', unitPriceNgn: 8500, allergens: [], chowdeckQuery: 'Turkey' },
  { id: 'beef', name: 'Beef', category: 'proteins', unit: 'kg', unitPriceNgn: 8000, allergens: [], chowdeckQuery: 'Beef' },
  { id: 'ponmo', name: 'Ponmo', localName: 'Cow skin', category: 'proteins', unit: 'pack', unitPriceNgn: 1500, allergens: [], chowdeckQuery: 'Ponmo' },
  { id: 'smoked-fish', name: 'Smoked fish', localName: 'Eja kika', category: 'proteins', unit: 'piece', unitPriceNgn: 2500, allergens: ['fish'], chowdeckQuery: 'Smoked Fish' },
  { id: 'catfish', name: 'Catfish', localName: 'Eja aro', category: 'proteins', unit: 'piece', unitPriceNgn: 4000, allergens: ['fish'], chowdeckQuery: 'Catfish' },
  { id: 'sardine', name: 'Sardine', category: 'proteins', unit: 'tin', unitPriceNgn: 1500, allergens: ['fish'], chowdeckQuery: 'Sardine' },
  { id: 'roasted-chicken', name: 'Roast chicken', category: 'proteins', unit: 'piece', unitPriceNgn: 9000, allergens: [], chowdeckQuery: 'Roast Chicken' },
  { id: 'crayfish', name: 'Crayfish', category: 'proteins', unit: 'cup', unitPriceNgn: 900, allergens: ['shellfish'], chowdeckQuery: 'Crayfish' },

  // Legumes
  { id: 'beans', name: 'Beans', localName: 'Ewa', category: 'legumes', unit: 'kg', unitPriceNgn: 2800, allergens: ['legumes'], chowdeckQuery: 'Beans' },
  { id: 'baked-beans', name: 'Baked beans', category: 'legumes', unit: 'tin', unitPriceNgn: 1500, allergens: ['legumes'], chowdeckQuery: 'Baked Beans' },
  { id: 'egusi', name: 'Egusi (melon seed)', category: 'legumes', unit: 'cup', unitPriceNgn: 1200, allergens: [], chowdeckQuery: 'Egusi' },

  // Vegetables
  { id: 'tomatoes', name: 'Tomatoes', localName: 'Tomato', category: 'vegetables', unit: 'kg', unitPriceNgn: 2500, allergens: [], chowdeckQuery: 'Tomatoes' },
  { id: 'tatashe', name: 'Tatashe (red bell pepper)', category: 'vegetables', unit: 'kg', unitPriceNgn: 2800, allergens: [], chowdeckQuery: 'Tatashe' },
  { id: 'scotch-bonnet', name: 'Scotch bonnet', localName: 'Ata rodo', category: 'vegetables', unit: 'cup', unitPriceNgn: 600, allergens: [], chowdeckQuery: 'Scotch Bonnet' },
  { id: 'onions', name: 'Onions', category: 'vegetables', unit: 'kg', unitPriceNgn: 2000, allergens: [], chowdeckQuery: 'Onions' },
  { id: 'ugu', name: 'Ugu (pumpkin leaf)', category: 'vegetables', unit: 'bunch', unitPriceNgn: 500, allergens: [], chowdeckQuery: 'Ugu' },
  { id: 'ewedu', name: 'Ewedu', category: 'vegetables', unit: 'bunch', unitPriceNgn: 300, allergens: [], chowdeckQuery: 'Ewedu' },
  { id: 'cabbage', name: 'Cabbage', category: 'vegetables', unit: 'piece', unitPriceNgn: 1500, allergens: [], chowdeckQuery: 'Cabbage' },
  { id: 'carrots', name: 'Carrots', category: 'vegetables', unit: 'kg', unitPriceNgn: 1800, allergens: [], chowdeckQuery: 'Carrots' },
  { id: 'cucumber', name: 'Cucumber', category: 'vegetables', unit: 'piece', unitPriceNgn: 500, allergens: [], chowdeckQuery: 'Cucumber' },
  { id: 'avocado', name: 'Avocado', category: 'vegetables', unit: 'piece', unitPriceNgn: 800, allergens: [], chowdeckQuery: 'Avocado' },

  // Fruits
  { id: 'banana', name: 'Banana', category: 'fruits', unit: 'piece', unitPriceNgn: 150, allergens: [], chowdeckQuery: 'Banana' },
  { id: 'groundnut', name: 'Groundnut', localName: 'Epa', category: 'fruits', unit: 'cup', unitPriceNgn: 800, allergens: ['nuts'], chowdeckQuery: 'Groundnut' },

  // Oils
  { id: 'palm-oil', name: 'Palm oil', category: 'oils', unit: 'L', unitPriceNgn: 3800, allergens: [], chowdeckQuery: 'Palm Oil' },
  { id: 'vegetable-oil', name: 'Vegetable oil', category: 'oils', unit: 'L', unitPriceNgn: 3500, allergens: [], chowdeckQuery: 'Vegetable Oil' },

  // Bakery
  { id: 'bread', name: 'Bread', category: 'bakery', unit: 'loaf', unitPriceNgn: 1800, allergens: ['gluten'], chowdeckQuery: 'Bread' },

  // Pantry & shortcuts
  { id: 'indomie', name: 'Indomie noodles', category: 'pantry', unit: 'pack', unitPriceNgn: 300, allergens: ['gluten'], chowdeckQuery: 'Indomie' },
  { id: 'tomato-paste', name: 'Tomato paste', category: 'pantry', unit: 'tin', unitPriceNgn: 450, allergens: [], chowdeckQuery: 'Tomato Paste' },
  { id: 'pepper-soup-spice', name: 'Pepper soup spice', category: 'pantry', unit: 'sachet', unitPriceNgn: 200, allergens: [], chowdeckQuery: 'Pepper Soup Spice' },
  { id: 'efo-base', name: 'Blended Efo Riro base', localName: 'Efo riro', category: 'pantry', unit: 'pack', unitPriceNgn: 2500, allergens: [], chowdeckQuery: 'Efo Riro' },
  { id: 'pre-made-stew', name: 'Pre-made stew', category: 'pantry', unit: 'pack', unitPriceNgn: 3000, allergens: [], chowdeckQuery: 'Ready Made Stew' },
];

export const CATEGORY_LABELS: Record<Ingredient['category'], string> = {
  tubers: 'Tubers & plantain',
  grains: 'Rice & grains',
  swallow: 'Swallow',
  proteins: 'Proteins',
  legumes: 'Beans & seeds',
  vegetables: 'Vegetables & peppers',
  fruits: 'Fruits & nuts',
  oils: 'Oils',
  bakery: 'Bakery',
  pantry: 'Pantry & shortcuts',
};

/** Display order for grocery lists (how a market run actually flows). */
export const CATEGORY_ORDER: readonly Ingredient['category'][] = [
  'proteins',
  'vegetables',
  'tubers',
  'grains',
  'swallow',
  'legumes',
  'fruits',
  'bakery',
  'oils',
  'pantry',
];
