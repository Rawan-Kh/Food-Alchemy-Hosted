
import { Recipe } from '@/components/RecipeManager';
import { Ingredient } from '@/components/IngredientManager';
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
  const { addToHistory } = useMealPlanHistory(mealPlanHistory, setMealPlanHistory);

  // Shopping list management
  const {
    generateShoppingListForPlan,
    toggleShoppingListItem,
    addShoppingItemToPantry,
    completeShoppingList
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

    addToHistory(currentWeekPlan);
    setCurrentWeekPlan(null);
    setCurrentShoppingList(null);
    setOriginalIngredients([]);
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
    getRecipeById
  };
};
