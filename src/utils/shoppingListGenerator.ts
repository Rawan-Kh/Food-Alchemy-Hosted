import { WeeklyMealPlan } from '@/types/mealPlanner';
import { Recipe } from '@/components/RecipeManager';
import { Ingredient } from '@/components/CategorizedIngredientManager';
import { ShoppingList, ShoppingListItem } from '@/types/shoppingList';

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Improved ingredient matching function
const findMatchingIngredient = (requiredName: string, availableIngredients: Ingredient[]): Ingredient | undefined => {
  const normalizedRequired = requiredName.toLowerCase().trim();
  
  // First try exact match
  let match = availableIngredients.find(ing => 
    ing.name.toLowerCase().trim() === normalizedRequired
  );
  
  if (match) return match;
  
  // Then try partial matches - ingredient name contains required name
  match = availableIngredients.find(ing => 
    ing.name.toLowerCase().includes(normalizedRequired)
  );
  
  if (match) return match;
  
  // Finally try reverse - required name contains ingredient name
  match = availableIngredients.find(ing => 
    normalizedRequired.includes(ing.name.toLowerCase())
  );
  
  return match;
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
            const key = recipeIngredient.name.toLowerCase().trim();
            if (requiredIngredients.has(key)) {
              const existing = requiredIngredients.get(key)!;
              // Only add quantity if units match, otherwise keep separate entries
              if (existing.unit === recipeIngredient.unit) {
                existing.quantity += recipeIngredient.quantity;
                if (!existing.recipeNames.includes(recipe.name)) {
                  existing.recipeNames.push(recipe.name);
                }
              } else {
                // Create a new key with unit suffix for different units
                const unitKey = `${key}_${recipeIngredient.unit}`;
                if (requiredIngredients.has(unitKey)) {
                  const existingUnit = requiredIngredients.get(unitKey)!;
                  existingUnit.quantity += recipeIngredient.quantity;
                  if (!existingUnit.recipeNames.includes(recipe.name)) {
                    existingUnit.recipeNames.push(recipe.name);
                  }
                } else {
                  requiredIngredients.set(unitKey, {
                    quantity: recipeIngredient.quantity,
                    unit: recipeIngredient.unit,
                    recipeNames: [recipe.name]
                  });
                }
              }
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

  requiredIngredients.forEach((required, ingredientKey) => {
    // Extract original ingredient name (remove unit suffix if present)
    const ingredientName = ingredientKey.includes('_') && 
      ['g', 'kg', 'ml', 'l', 'cups', 'tbsp', 'tsp', 'pcs', 'pieces'].some(unit => ingredientKey.endsWith(`_${unit}`))
      ? ingredientKey.substring(0, ingredientKey.lastIndexOf('_'))
      : ingredientKey;

    const availableIngredient = findMatchingIngredient(ingredientName, ingredients);
    
    let availableQuantity = 0;
    let matchingUnit = required.unit;
    
    if (availableIngredient) {
      // Use available ingredient's unit and quantity if found
      availableQuantity = availableIngredient.quantity;
      matchingUnit = availableIngredient.unit;
      
      // Only subtract if units match, otherwise treat as unavailable
      if (availableIngredient.unit !== required.unit) {
        availableQuantity = 0; // Different units, can't directly compare
      }
    }

    const missingQuantity = Math.max(0, required.quantity - availableQuantity);

    // Always create an item, even if we have enough (for user reference)
    // But only add to shopping list if we actually need more
    if (missingQuantity > 0) {
      shoppingListItems.push({
        id: generateUniqueId(),
        ingredientName: ingredientName,
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
