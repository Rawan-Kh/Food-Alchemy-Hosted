
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { History, ChevronDown, ChevronRight } from 'lucide-react';
import { MealPlanHistory as MealPlanHistoryType } from '@/types/mealPlanner';
import { Recipe } from './RecipeManager';
import { DAYS_OF_WEEK } from '@/types/mealPlanner';

interface MealPlanHistoryProps {
  history: MealPlanHistoryType[];
  getRecipeById: (id: string) => Recipe | undefined;
}

export const MealPlanHistory: React.FC<MealPlanHistoryProps> = ({
  history,
  getRecipeById
}) => {
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());

  const toggleExpanded = (planId: string) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedPlans(newExpanded);
  };

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
          {history.map((historyEntry) => {
            const isExpanded = expandedPlans.has(historyEntry.id);
            
            return (
              <Collapsible key={historyEntry.id}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              Week of {getWeekDateRange(historyEntry.weeklyPlan.weekStarting)}
                            </Badge>
                            <Badge variant="secondary">
                              {getTotalMeals(historyEntry)} meals
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Consumed on {new Date(historyEntry.dateConsumed).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {DAYS_OF_WEEK.map(day => {
                          const dayMeal = historyEntry.weeklyPlan.meals.find(meal => meal.day === day);
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
            );
          })}

          {history.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p>No meal plan history yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Complete a meal plan to see it here.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
