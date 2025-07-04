
import { MealPlanHistory, WeeklyMealPlan } from '@/types/mealPlanner';
import { generateUniqueId } from '@/utils/mealPlanHelpers';
import { useToast } from '@/hooks/use-toast';

export const useMealPlanHistory = (
  mealPlanHistory: MealPlanHistory[],
  setMealPlanHistory: (history: MealPlanHistory[]) => void
) => {
  const { toast } = useToast();

  const addToHistory = (weeklyPlan: WeeklyMealPlan) => {
    const consumedPlan = { ...weeklyPlan, isConsumed: true };
    const historyEntry: MealPlanHistory = {
      id: generateUniqueId(),
      weeklyPlan: consumedPlan,
      dateConsumed: new Date().toISOString()
    };

    setMealPlanHistory(prev => [historyEntry, ...prev]);

    toast({
      title: "Meal plan consumed!",
      description: "The ingredients have been permanently used and the plan is now in history.",
    });
  };

  return {
    addToHistory
  };
};
