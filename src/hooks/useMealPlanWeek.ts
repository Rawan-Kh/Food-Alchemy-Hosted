
import { WeeklyMealPlan, MealPlan, MealType, DAYS_OF_WEEK } from '@/types/mealPlanner';
import { generateUniqueId, getWeekStartDate } from '@/utils/mealPlanHelpers';
import { Ingredient } from '@/components/IngredientManager';

export const useMealPlanWeek = (
  currentWeekPlan: WeeklyMealPlan | null,
  setCurrentWeekPlan: (plan: WeeklyMealPlan | null) => void,
  ingredients: Ingredient[],
  setOriginalIngredients: (ingredients: Ingredient[]) => void,
  setCurrentShoppingList: (list: any) => void
) => {
  const createNewWeekPlan = () => {
    const weekStarting = getWeekStartDate();
    const meals: MealPlan[] = DAYS_OF_WEEK.map(day => ({
      id: generateUniqueId(),
      day
    }));

    const newPlan: WeeklyMealPlan = {
      id: generateUniqueId(),
      weekStarting,
      meals,
      isConsumed: false,
      dateCreated: new Date().toISOString()
    };

    setCurrentWeekPlan(newPlan);
    setOriginalIngredients([...ingredients]);
    setCurrentShoppingList(null); // Clear shopping list when creating new plan
    return newPlan;
  };

  const assignRecipeToMeal = (day: string, mealType: MealType, recipeId: string) => {
    if (!currentWeekPlan) return;

    const updatedPlan = { ...currentWeekPlan };
    const dayMeal = updatedPlan.meals.find(meal => meal.day === day);
    
    if (dayMeal) {
      dayMeal[mealType] = recipeId;
      setCurrentWeekPlan(updatedPlan);
      return updatedPlan;
    }
  };

  const removeRecipeFromMeal = (day: string, mealType: MealType) => {
    if (!currentWeekPlan) return;

    const updatedPlan = { ...currentWeekPlan };
    const dayMeal = updatedPlan.meals.find(meal => meal.day === day);
    
    if (dayMeal) {
      delete dayMeal[mealType];
      setCurrentWeekPlan(updatedPlan);
      return updatedPlan;
    }
  };

  return {
    createNewWeekPlan,
    assignRecipeToMeal,
    removeRecipeFromMeal
  };
};
