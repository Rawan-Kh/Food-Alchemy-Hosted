
import { Recipe } from '@/components/RecipeManager';
import { MealType } from '@/types/mealPlanner';

// Keywords to help categorize recipes into meal types
const MEAL_KEYWORDS = {
  breakfast: [
    'pancake', 'waffle', 'toast', 'cereal', 'oatmeal', 'eggs', 'bacon',
    'sausage', 'coffee', 'tea', 'smoothie', 'yogurt', 'granola', 'muesli',
    'breakfast', 'morning', 'brunch'
  ],
  snack: [
    'snack', 'chip', 'cracker', 'nuts', 'fruit', 'cookie', 'muffin',
    'bar', 'bite', 'popcorn', 'pretzel', 'trail mix'
  ],
  lunch: [
    'sandwich', 'salad', 'soup', 'wrap', 'burger', 'pizza', 'pasta',
    'rice', 'noodle', 'lunch', 'bowl', 'quinoa'
  ],
  dinner: [
    'steak', 'chicken', 'fish', 'roast', 'casserole', 'stew', 'curry',
    'dinner', 'main', 'entree', 'grill', 'bake', 'slow cook'
  ]
};

export const categorizeRecipe = (recipe: Recipe): MealType => {
  const searchText = `${recipe.name} ${recipe.description}`.toLowerCase();
  
  // Check each meal type for keyword matches
  for (const [mealType, keywords] of Object.entries(MEAL_KEYWORDS)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return mealType as MealType;
    }
  }
  
  // Default categorization based on cooking time
  if (recipe.cookingTime <= 15) return 'snack';
  if (recipe.cookingTime <= 30) return 'breakfast';
  if (recipe.cookingTime <= 45) return 'lunch';
  return 'dinner';
};

export const getRecipesByMealType = (recipes: Recipe[], mealType: MealType): Recipe[] => {
  return recipes.filter(recipe => categorizeRecipe(recipe) === mealType);
};
