
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

    setMealPlanHistory([historyEntry, ...mealPlanHistory]);

    toast({
      title: "Meal plan consumed!",
      description: "The ingredients have been permanently used and the plan is now in history.",
    });
  };

  const deleteFromHistory = (historyId: string) => {
    const updatedHistory = mealPlanHistory.filter(entry => entry.id !== historyId);
    setMealPlanHistory(updatedHistory);

    toast({
      title: "History deleted",
      description: "The meal plan history entry has been removed.",
    });
  };

  return {
    addToHistory,
    deleteFromHistory
  };
};
