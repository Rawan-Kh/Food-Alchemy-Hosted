
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
  console.log('=== Shopping List Generation Debug ===');
  console.log('Week plan meals:', weekPlan.meals);
  console.log('Available recipes:', recipes.length);
  console.log('Available ingredients:', ingredients.length);

  const requiredIngredients = new Map<string, {
    quantity: number;
    unit: string;
    recipeNames: string[];
    originalName: string; // Keep track of original name
  }>();

  // Collect all required ingredients from recipes in the meal plan
  let totalRecipesUsed = 0;
  weekPlan.meals.forEach(meal => {
    [meal.breakfast, meal.snack, meal.lunch, meal.dinner].forEach(recipeId => {
      if (recipeId) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
          totalRecipesUsed++;
          console.log(`Processing recipe: ${recipe.name} with ${recipe.ingredients.length} ingredients`);
          
          recipe.ingredients.forEach(recipeIngredient => {
            const normalizedKey = recipeIngredient.name.toLowerCase().trim();
            
            if (requiredIngredients.has(normalizedKey)) {
              const existing = requiredIngredients.get(normalizedKey)!;
              // Only add quantity if units match
              if (existing.unit === recipeIngredient.unit) {
                existing.quantity += recipeIngredient.quantity;
                if (!existing.recipeNames.includes(recipe.name)) {
                  existing.recipeNames.push(recipe.name);
                }
              } else {
                // Create a new key with unit suffix for different units
                const unitKey = `${normalizedKey}_${recipeIngredient.unit}`;
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
                    recipeNames: [recipe.name],
                    originalName: recipeIngredient.name
                  });
                }
              }
            } else {
              requiredIngredients.set(normalizedKey, {
                quantity: recipeIngredient.quantity,
                unit: recipeIngredient.unit,
                recipeNames: [recipe.name],
                originalName: recipeIngredient.name
              });
            }
          });
        }
      }
    });
  });

  console.log(`Total recipes used: ${totalRecipesUsed}`);
  console.log(`Total unique required ingredients: ${requiredIngredients.size}`);

  // Generate shopping list items for missing ingredients
  const shoppingListItems: ShoppingListItem[] = [];

  requiredIngredients.forEach((required, ingredientKey) => {
    // Extract original ingredient name (remove unit suffix if present)
    const ingredientName = ingredientKey.includes('_') && 
      ['g', 'kg', 'ml', 'l', 'cups', 'tbsp', 'tsp', 'pcs', 'pieces'].some(unit => ingredientKey.endsWith(`_${unit}`))
      ? ingredientKey.substring(0, ingredientKey.lastIndexOf('_'))
      : ingredientKey;

    // Use the original name from the recipe for display
    const displayName = required.originalName;

    const availableIngredient = findMatchingIngredient(ingredientName, ingredients);
    
    let availableQuantity = 0;
    
    if (availableIngredient) {
      // Only subtract if units match, otherwise treat as unavailable
      if (availableIngredient.unit === required.unit) {
        availableQuantity = availableIngredient.quantity;
      } else {
        console.log(`Unit mismatch for '${displayName}': required ${required.unit}, available ${availableIngredient.unit}`);
      }
    } else {
      console.log(`No matching ingredient found for '${displayName}'`);
    }

    const missingQuantity = Math.max(0, required.quantity - availableQuantity);

    // Only add to shopping list if we actually need more
    if (missingQuantity > 0) {
      const item: ShoppingListItem = {
        id: generateUniqueId(),
        ingredientName: displayName,
        requiredQuantity: required.quantity,
        unit: required.unit,
        availableQuantity,
        missingQuantity,
        recipeNames: [...new Set(required.recipeNames)], // Remove duplicates
        isChecked: false,
        dateAdded: new Date().toISOString()
      };
      
      shoppingListItems.push(item);
      console.log(`Added to shopping list: ${displayName} - missing ${missingQuantity} ${required.unit}`);
    } else {
      console.log(`Skipped ${displayName} - have enough (${availableQuantity} ${required.unit})`);
    }
  });

  console.log(`Final shopping list items: ${shoppingListItems.length}`);
  console.log('=== End Shopping List Generation Debug ===');

  return {
    id: generateUniqueId(),
    weekPlanId: weekPlan.id,
    items: shoppingListItems,
    dateCreated: new Date().toISOString()
  };
};
