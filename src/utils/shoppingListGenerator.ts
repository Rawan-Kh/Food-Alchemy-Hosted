
import { WeeklyMealPlan } from '@/types/mealPlanner';
import { Recipe } from '@/components/RecipeManager';
import { Ingredient } from '@/components/IngredientManager';
import { ShoppingList, ShoppingListItem } from '@/types/shoppingList';

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateShoppingList = (
  weekPlan: WeeklyMealPlan,
  recipes: Recipe[],
  ingredients: Ingredient[]
): ShoppingList => {
  const requiredIngredients = new Map<string, {
    quantity: number;
    unit: string;
    recipeNames: string[];
  }>();

  // Collect all required ingredients from recipes in the meal plan
  weekPlan.meals.forEach(meal => {
    [meal.breakfast, meal.snack, meal.lunch, meal.dinner].forEach(recipeId => {
      if (recipeId) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
          recipe.ingredients.forEach(recipeIngredient => {
            const key = recipeIngredient.name.toLowerCase();
            if (requiredIngredients.has(key)) {
              const existing = requiredIngredients.get(key)!;
              existing.quantity += recipeIngredient.quantity;
              existing.recipeNames.push(recipe.name);
            } else {
              requiredIngredients.set(key, {
                quantity: recipeIngredient.quantity,
                unit: recipeIngredient.unit,
                recipeNames: [recipe.name]
              });
            }
          });
        }
      }
    });
  });

  // Generate shopping list items for missing ingredients
  const shoppingListItems: ShoppingListItem[] = [];

  requiredIngredients.forEach((required, ingredientName) => {
    const availableIngredient = ingredients.find(ing =>
      ing.name.toLowerCase().includes(ingredientName) ||
      ingredientName.includes(ing.name.toLowerCase())
    );

    const availableQuantity = availableIngredient?.quantity || 0;
    const missingQuantity = Math.max(0, required.quantity - availableQuantity);

    if (missingQuantity > 0) {
      shoppingListItems.push({
        id: generateUniqueId(),
        ingredientName,
        requiredQuantity: required.quantity,
        unit: required.unit,
        availableQuantity,
        missingQuantity,
        recipeNames: [...new Set(required.recipeNames)], // Remove duplicates
        isChecked: false,
        dateAdded: new Date().toISOString()
      });
    }
  });

  return {
    id: generateUniqueId(),
    weekPlanId: weekPlan.id,
    items: shoppingListItems,
    dateCreated: new Date().toISOString()
  };
};
