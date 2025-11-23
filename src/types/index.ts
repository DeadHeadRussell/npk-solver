export interface Fertilizer {
  id: string;
  name: string;
  n: number; // Nitrogen percentage
  p: number; // Phosphorus percentage
  k: number; // Potassium percentage
}

export interface RecipeIngredient {
  fertilizer: Fertilizer;
  amount: number; // in grams
}

export interface Blend {
  id: string;
  name: string;
  date: string;
  targetNPK: {
    n: number;
    p: number;
    k: number;
  };
  totalWeight: number; // in grams
  recipe: RecipeIngredient[];
}
