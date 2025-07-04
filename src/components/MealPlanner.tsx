
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChefHat, Plus, Trash2 } from 'lucide-react';
import { Recipe } from './RecipeManager';
import { Ingredient } from './IngredientManager';
import { useMealPlanner } from '@/hooks/useMealPlanner';
import { MealPlanGrid } from './MealPlanGrid';
import { MealPlanHistory } from './MealPlanHistory';
import { DAYS_OF_WEEK } from '@/types/mealPlanner';

interface MealPlannerProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onUpdateIngredients: (ingredients: Ingredient[]) => void;
}

export const MealPlanner: React.FC<MealPlannerProps> = ({
  recipes,
  ingredients,
  onUpdateIngredients
}) => {
  const {
    currentWeekPlan,
    mealPlanHistory,
    createNewWeekPlan,
    assignRecipeToMeal,
    removeRecipeFromMeal,
    consumeMealPlan,
    cancelMealPlan,
    getRecipeById
  } = useMealPlanner(recipes, ingredients, onUpdateIngredients);

  const getWeekDateRange = () => {
    if (!currentWeekPlan) return '';
    
    const startDate = new Date(currentWeekPlan.weekStarting);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Meal Planner
            </CardTitle>
            <div className="flex items-center gap-2">
              {!currentWeekPlan ? (
                <Button onClick={createNewWeekPlan} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Week Plan
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={consumeMealPlan} 
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Consume Plan
                  </Button>
                  <Button 
                    onClick={cancelMealPlan} 
                    variant="outline"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Plan
                  </Button>
                </div>
              )}
            </div>
          </div>
          {currentWeekPlan && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Badge variant="secondary">
                Week of {getWeekDateRange()}
              </Badge>
              <span>
                {currentWeekPlan.meals.reduce((count, meal) => {
                  return count + [meal.breakfast, meal.snack, meal.lunch, meal.dinner].filter(Boolean).length;
                }, 0)} meals planned
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {currentWeekPlan ? (
            <MealPlanGrid
              weekPlan={currentWeekPlan}
              recipes={recipes}
              onAssignRecipe={assignRecipeToMeal}
              onRemoveRecipe={removeRecipeFromMeal}
              getRecipeById={getRecipeById}
            />
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Meal Plan</h3>
              <p className="text-gray-500 mb-4">
                Create a weekly meal plan to organize your recipes and manage ingredients.
              </p>
              <Button onClick={createNewWeekPlan} size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Start Planning
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {mealPlanHistory.length > 0 && (
        <MealPlanHistory 
          history={mealPlanHistory}
          getRecipeById={getRecipeById}
        />
      )}
    </div>
  );
};
