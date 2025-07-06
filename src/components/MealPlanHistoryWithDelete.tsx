
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ChefHat, Trash2 } from 'lucide-react';
import { MealPlanHistory, DAYS_OF_WEEK } from '@/types/mealPlanner';
import { Recipe } from './RecipeManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MealPlanHistoryWithDeleteProps {
  history: MealPlanHistory[];
  getRecipeById: (id: string) => Recipe | undefined;
  onDeleteHistory: (historyId: string) => void;
}

export const MealPlanHistoryWithDelete: React.FC<MealPlanHistoryWithDeleteProps> = ({
  history,
  getRecipeById,
  onDeleteHistory
}) => {
  if (history.length === 0) return null;

  const getWeekDateRange = (weekStarting: string) => {
    const startDate = new Date(weekStarting);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  const getTotalMealsInHistory = (historyEntry: MealPlanHistory) => {
    return historyEntry.weeklyPlan.meals.reduce((count, meal) => {
      return count + [meal.breakfast, meal.snack, meal.lunch, meal.dinner].filter(Boolean).length;
    }, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Meal Plan History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((historyEntry) => (
            <div
              key={historyEntry.id}
              className="border rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Week of {getWeekDateRange(historyEntry.weeklyPlan.weekStarting)}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {getTotalMealsInHistory(historyEntry)} meals consumed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Consumed: {new Date(historyEntry.dateConsumed).toLocaleDateString()}
                  </span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Meal Plan History</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this meal plan history? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteHistory(historyEntry.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {historyEntry.weeklyPlan.meals.map((meal, index) => {
                  const day = DAYS_OF_WEEK[index];
                  const dayMeals = [
                    { type: 'Breakfast', recipeId: meal.breakfast },
                    { type: 'Snack', recipeId: meal.snack },
                    { type: 'Lunch', recipeId: meal.lunch },
                    { type: 'Dinner', recipeId: meal.dinner }
                  ].filter(m => m.recipeId);

                  return (
                    <div key={day} className="text-center">
                      <h4 className="font-medium text-sm mb-1">{day}</h4>
                      <div className="space-y-1">
                        {dayMeals.length > 0 ? (
                          dayMeals.map(({ type, recipeId }) => {
                            const recipe = getRecipeById(recipeId!);
                            return (
                              <div key={type} className="text-xs bg-white rounded p-1">
                                <div className="font-medium text-gray-600">{type}</div>
                                <div className="text-gray-800 truncate">
                                  {recipe?.name || 'Unknown Recipe'}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-xs text-gray-400">No meals</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
