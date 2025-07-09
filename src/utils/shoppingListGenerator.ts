
import { WeeklyMealPlan } from '@/types/mealPlanner';
import { Recipe } from '@/components/RecipeManager';
import { Ingredient } from '@/components/CategorizedIngredientManager';
import { ShoppingList, ShoppingListItem } from '@/types/shoppingList';

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Improved ingredient name cleaning function
const cleanIngredientName = (name: string): string => {
  let cleaned = name.trim();
  
  // Remove common prefixes that describe quantity/measurement
  const prefixesToRemove = [
    /^\d+\s*tablespoons?\s*/i,
    /^\d+\s*teaspoons?\s*/i,
    /^\d+\s*cups?\s*/i,
    /^\d+\s*pounds?\s*/i,
    /^\d+\s*ounces?\s*/i,
    /^\d+\s*grams?\s*/i,
    /^\d+\s*kilograms?\s*/i,
    /^\d+\s*milliliters?\s*/i,
    /^\d+\s*liters?\s*/i,
    /^large\s*/i,
    /^medium\s*/i,
    /^small\s*/i,
    /^fresh\s*/i,
    /^dried\s*/i,
    /^whole\s*/i,
    /^ground\s*/i,
    /^chopped\s*/i,
    /^diced\s*/i,
    /^sliced\s*/i,
    /^undefined\s*/i,
    /^tablespoon\s*/i,
    /^teaspoon\s*/i,
  ];
  
  prefixesToRemove.forEach(prefix => {
    cleaned = cleaned.replace(prefix, '');
  });
  
  // Remove parenthetical descriptions and extra info
  cleaned = cleaned.replace(/\([^)]*\)/g, ''); // Remove anything in parentheses
  cleaned = cleaned.replace(/,.*$/g, ''); // Remove everything after first comma
  cleaned = cleaned.replace(/\s+/g, ' '); // Normalize whitespace
  cleaned = cleaned.trim();
  
  // Remove leading/trailing articles and descriptors
  cleaned = cleaned.replace(/^(a|an|the)\s+/i, '');
  cleaned = cleaned.replace(/\s+(or\s+more|plus\s+more|extra).*$/i, '');
  
  return cleaned.toLowerCase();
};

// Enhanced unit normalization
const normalizeUnit = (unit: string, quantity: number): { unit: string; quantity: number } => {
  const unitLower = unit.toLowerCase().trim();
  
  // Handle common unit conversions and normalizations
  const unitMappings: Record<string, string> = {
    'pcs': 'pieces',
    'pc': 'pieces',
    'piece': 'pieces',
    'tbsp': 'tablespoons',
    'tablespoon': 'tablespoons',
    'tsp': 'teaspoons',
    'teaspoon': 'teaspoons',
    'cup': 'cups',
    'lb': 'pounds',
    'pound': 'pounds',
    'oz': 'ounces',
    'ounce': 'ounces',
    'g': 'grams',
    'gram': 'grams',
    'kg': 'kilograms',
    'kilogram': 'kilograms',
    'ml': 'milliliters',
    'milliliter': 'milliliters',
    'l': 'liters',
    'liter': 'liters',
  };
  
  const normalizedUnit = unitMappings[unitLower] || unitLower;
  
  // Handle plural/singular consistency
  if (quantity === 1) {
    if (normalizedUnit === 'pieces') return { unit: 'piece', quantity };
    if (normalizedUnit === 'tablespoons') return { unit: 'tablespoon', quantity };
    if (normalizedUnit === 'teaspoons') return { unit: 'teaspoon', quantity };
    if (normalizedUnit === 'cups') return { unit: 'cup', quantity };
  }
  
  return { unit: normalizedUnit, quantity };
};

// Improved ingredient matching function
const findMatchingIngredient = (requiredName: string, availableIngredients: Ingredient[]): Ingredient | undefined => {
  const cleanRequired = cleanIngredientName(requiredName);
  
  console.log(`Looking for ingredient: "${requiredName}" -> cleaned: "${cleanRequired}"`);
  
  // First try exact match on cleaned names
  let match = availableIngredients.find(ing => 
    cleanIngredientName(ing.name) === cleanRequired
  );
  
  if (match) {
    console.log(`Found exact match: ${match.name}`);
    return match;
  }
  
  // Then try partial matches - available ingredient contains required name
  match = availableIngredients.find(ing => {
    const cleanAvailable = cleanIngredientName(ing.name);
    return cleanAvailable.includes(cleanRequired) || cleanRequired.includes(cleanAvailable);
  });
  
  if (match) {
    console.log(`Found partial match: ${match.name}`);
    return match;
  }
  
  // Try word-based matching for compound ingredients
  const requiredWords = cleanRequired.split(' ').filter(word => word.length > 2);
  if (requiredWords.length > 0) {
    match = availableIngredients.find(ing => {
      const availableWords = cleanIngredientName(ing.name).split(' ');
      return requiredWords.some(reqWord => 
        availableWords.some(availWord => 
          availWord.includes(reqWord) || reqWord.includes(availWord)
        )
      );
    });
    
    if (match) {
      console.log(`Found word-based match: ${match.name} for ${requiredName}`);
      return match;
    }
  }
  
  console.log(`No match found for: ${requiredName}`);
  return undefined;
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
    originalName: string;
    cleanedName: string;
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
            const cleanedName = cleanIngredientName(recipeIngredient.name);
            const { unit: normalizedUnit, quantity: normalizedQuantity } = normalizeUnit(
              recipeIngredient.unit, 
              recipeIngredient.quantity
            );
            
            // Create a unique key that includes the unit to handle different unit types
            const ingredientKey = `${cleanedName}__${normalizedUnit}`;
            
            console.log(`Processing ingredient: "${recipeIngredient.name}" -> "${cleanedName}" (${normalizedQuantity} ${normalizedUnit})`);
            
            if (requiredIngredients.has(ingredientKey)) {
              const existing = requiredIngredients.get(ingredientKey)!;
              existing.quantity += normalizedQuantity;
              if (!existing.recipeNames.includes(recipe.name)) {
                existing.recipeNames.push(recipe.name);
              }
            } else {
              requiredIngredients.set(ingredientKey, {
                quantity: normalizedQuantity,
                unit: normalizedUnit,
                recipeNames: [recipe.name],
                originalName: recipeIngredient.name,
                cleanedName
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
    const availableIngredient = findMatchingIngredient(required.cleanedName, ingredients);
    
    let availableQuantity = 0;
    let hasCompatibleUnit = false;
    
    if (availableIngredient) {
      const { unit: availableNormalizedUnit } = normalizeUnit(availableIngredient.unit, availableIngredient.quantity);
      
      // Check if units are compatible
      if (availableNormalizedUnit === required.unit) {
        availableQuantity = availableIngredient.quantity;
        hasCompatibleUnit = true;
        console.log(`Found compatible ingredient: ${availableIngredient.name} (${availableQuantity} ${availableNormalizedUnit})`);
      } else {
        console.log(`Unit mismatch for '${required.originalName}': required ${required.unit}, available ${availableNormalizedUnit}`);
      }
    }

    const missingQuantity = Math.max(0, required.quantity - availableQuantity);

    // Add to shopping list if we need more (or if no compatible ingredient found)
    if (missingQuantity > 0 || (!hasCompatibleUnit && availableIngredient)) {
      const displayQuantity = hasCompatibleUnit ? missingQuantity : required.quantity;
      
      const item: ShoppingListItem = {
        id: generateUniqueId(),
        ingredientName: required.originalName,
        requiredQuantity: required.quantity,
        unit: required.unit,
        availableQuantity: hasCompatibleUnit ? availableQuantity : 0,
        missingQuantity: displayQuantity,
        recipeNames: [...new Set(required.recipeNames)],
        isChecked: false,
        dateAdded: new Date().toISOString()
      };
      
      shoppingListItems.push(item);
      console.log(`Added to shopping list: ${required.originalName} - missing ${displayQuantity} ${required.unit}`);
    } else {
      console.log(`Skipped ${required.originalName} - have enough (${availableQuantity} ${required.unit})`);
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
