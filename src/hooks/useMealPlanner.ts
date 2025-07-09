
import { Recipe } from '@/components/RecipeManager';
import { Ingredient } from '@/components/CategorizedIngredientManager';
import { useMealPlanStorage } from './useMealPlanStorage';
import { useMealPlanWeek } from './useMealPlanWeek';
import { useMealPlanIngredients } from './useMealPlanIngredients';
import { useMealPlanHistory } from './useMealPlanHistory';
import { useMealPlanShopping } from './useMealPlanShopping';
import { useToast } from '@/hooks/use-toast';

export const useMealPlanner = (
  recipes: Recipe[],
  ingredients: Ingredient[],
  onUpdateIngredients: (ingredients: Ingredient[]) => void
) => {
  const { toast } = useToast();
  
  // Storage management
  const {
    currentWeekPlan,
    setCurrentWeekPlan,
    mealPlanHistory,
    setMealPlanHistory,
    currentShoppingList,
    setCurrentShoppingList
  } = useMealPlanStorage();

  // Ingredient management
  const {
    originalIngredients,
    setOriginalIngredients,
    updateTemporaryIngredients,
    restoreOriginalIngredients
  } = useMealPlanIngredients(recipes, onUpdateIngredients);

  // Week plan management
  const {
    createNewWeekPlan,
    assignRecipeToMeal: assignRecipe,
    removeRecipeFromMeal: removeRecipe
  } = useMealPlanWeek(
    currentWeekPlan,
    setCurrentWeekPlan,
    ingredients,
    setOriginalIngredients,
    setCurrentShoppingList
  );

  // History management
  const { addToHistory, deleteFromHistory, clearAllHistory } = useMealPlanHistory(mealPlanHistory, setMealPlanHistory);

  // Shopping list management
  const {
    generateShoppingListForPlan,
    toggleShoppingListItem,
    addShoppingItemToPantry,
    completeShoppingList,
    clearAllShoppingItems
  } = useMealPlanShopping(
    currentShoppingList,
    setCurrentShoppingList,
    ingredients,
    onUpdateIngredients
  );

  // Enhanced assignment and removal functions that update ingredients
  const assignRecipeToMeal = (day: string, mealType: any, recipeId: string) => {
    const updatedPlan = assignRecipe(day, mealType, recipeId);
    if (updatedPlan) {
      updateTemporaryIngredients(updatedPlan);
    }
  };

  const removeRecipeFromMeal = (day: string, mealType: any) => {
    const updatedPlan = removeRecipe(day, mealType);
    if (updatedPlan) {
      updateTemporaryIngredients(updatedPlan);
    }
  };

  const consumeMealPlan = () => {
    if (!currentWeekPlan) return;

    // Calculate and permanently consume ingredients
    let updatedIngredients = [...ingredients];
    const usedRecipeIds: string[] = [];

    // Collect all recipe IDs used in the meal plan
    currentWeekPlan.meals.forEach(meal => {
      [meal.breakfast, meal.snack, meal.lunch, meal.dinner].forEach(recipeId => {
        if (recipeId) usedRecipeIds.push(recipeId);
      });
    });

    // Deduct ingredients for each used recipe
    usedRecipeIds.forEach(recipeId => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe) {
        recipe.ingredients.forEach(recipeIngredient => {
          const ingredientIndex = updatedIngredients.findIndex(ingredient =>
            ingredient.name.toLowerCase().includes(recipeIngredient.name.toLowerCase()) ||
            recipeIngredient.name.toLowerCase().includes(ingredient.name.toLowerCase())
          );
          
          if (ingredientIndex !== -1) {
            const availableQuantity = updatedIngredients[ingredientIndex].quantity;
            const requiredQuantity = recipeIngredient.quantity;
            
            if (availableQuantity >= requiredQuantity) {
              updatedIngredients[ingredientIndex] = {
                ...updatedIngredients[ingredientIndex],
                quantity: Math.max(0, availableQuantity - requiredQuantity)
              };
            }
          }
        });
      }
    });

    // Remove ingredients with zero quantity
    updatedIngredients = updatedIngredients.filter(ingredient => ingredient.quantity > 0);

    // Update the ingredients permanently
    onUpdateIngredients(updatedIngredients);

    addToHistory(currentWeekPlan);
    setCurrentWeekPlan(null);
    setCurrentShoppingList(null);
    setOriginalIngredients([]);

    toast({
      title: "Meal plan consumed!",
      description: "Ingredients have been permanently used and zero-quantity items removed from pantry.",
    });
  };

  const cancelMealPlan = () => {
    if (!currentWeekPlan) return;

    restoreOriginalIngredients();
    setCurrentWeekPlan(null);
    setCurrentShoppingList(null);
    setOriginalIngredients([]);

    toast({
      title: "Meal plan cancelled",
      description: "Ingredients have been restored to their original quantities.",
    });
  };

  const getRecipeById = (id: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === id);
  };

  const generateShoppingListForCurrentPlan = () => {
    if (currentWeekPlan) {
      generateShoppingListForPlan(currentWeekPlan, recipes);
    }
  };

  return {
    currentWeekPlan,
    mealPlanHistory,
    currentShoppingList,
    createNewWeekPlan,
    assignRecipeToMeal,
    removeRecipeFromMeal,
    consumeMealPlan,
    cancelMealPlan,
    generateShoppingListForPlan: generateShoppingListForCurrentPlan,
    toggleShoppingListItem,
    addShoppingItemToPantry,
    completeShoppingList,
    clearAllShoppingItems,
    getRecipeById,
    deleteFromHistory,
    clearAllHistory
  };
};
