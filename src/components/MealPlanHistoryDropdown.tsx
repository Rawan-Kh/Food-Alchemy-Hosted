
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, ChevronDown, Trash2 } from 'lucide-react';
import { MealPlanHistory as MealPlanHistoryType } from '@/types/mealPlanner';
import { Recipe } from './RecipeManager';
import { DAYS_OF_WEEK } from '@/types/mealPlanner';
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

interface MealPlanHistoryDropdownProps {
  history: MealPlanHistoryType[];
  getRecipeById: (id: string) => Recipe | undefined;
  onDeleteHistory: (historyId: string) => void;
}

export const MealPlanHistoryDropdown: React.FC<MealPlanHistoryDropdownProps> = ({
  history,
  getRecipeById,
  onDeleteHistory
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const getWeekDateRange = (weekStarting: string) => {
    const startDate = new Date(weekStarting);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  const getTotalMeals = (plan: MealPlanHistoryType) => {
    return plan.weeklyPlan.meals.reduce((count, meal) => {
      return count + [meal.breakfast, meal.snack, meal.lunch, meal.dinner].filter(Boolean).length;
    }, 0);
  };

  const selectedPlan = history.find(plan => plan.id === selectedPlanId);

  if (history.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Meal Plan History ({history.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a meal plan to view" />
            </SelectTrigger>
            <SelectContent>
              {history.map((historyEntry) => (
                <SelectItem key={historyEntry.id} value={historyEntry.id}>
                  Week of {getWeekDateRange(historyEntry.weeklyPlan.weekStarting)} 
                  ({getTotalMeals(historyEntry)} meals)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPlan && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Week of {getWeekDateRange(selectedPlan.weeklyPlan.weekStarting)}
                          </Badge>
                          <Badge variant="secondary">
                            {getTotalMeals(selectedPlan)} meals
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Consumed on {new Date(selectedPlan.dateConsumed).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => e.stopPropagation()}
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
                                onClick={() => {
                                  onDeleteHistory(selectedPlan.id);
                                  setSelectedPlanId('');
                                }}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {DAYS_OF_WEEK.map(day => {
                        const dayMeal = selectedPlan.weeklyPlan.meals.find(meal => meal.day === day);
                        const meals = [
                          { type: 'breakfast', id: dayMeal?.breakfast },
                          { type: 'snack', id: dayMeal?.snack },
                          { type: 'lunch', id: dayMeal?.lunch },
                          { type: 'dinner', id: dayMeal?.dinner }
                        ].filter(meal => meal.id);

                        return (
                          <div key={day} className="space-y-2">
                            <h4 className="font-semibold text-sm">{day}</h4>
                            {meals.length > 0 ? (
                              <div className="space-y-1">
                                {meals.map(meal => {
                                  const recipe = meal.id ? getRecipeById(meal.id) : undefined;
                                  return recipe ? (
                                    <div key={`${day}-${meal.type}`} className="text-xs p-2 bg-gray-50 rounded">
                                      <div className="font-medium capitalize">{meal.type}</div>
                                      <div className="text-gray-600">{recipe.name}</div>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 italic">No meals planned</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
