
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat, Calendar, Package } from 'lucide-react';
import { Recipe } from './RecipeManager';
import { Ingredient } from './CategorizedIngredientManager';
import { WeeklyMealPlan } from '@/types/mealPlanner';

interface QuickStatsProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  currentWeekPlan: WeeklyMealPlan | null;
  onNavigateToRecipes: () => void;
  onNavigateToMealPlanner: () => void;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  recipes,
  ingredients,
  currentWeekPlan,
  onNavigateToRecipes,
  onNavigateToMealPlanner
}) => {
  const getNextMeal = () => {
    if (!currentWeekPlan) return null;
    
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[today.getDay()];
    const currentHour = today.getHours();
    
    // Find today's meals
    const todayMeal = currentWeekPlan.meals.find(meal => meal.day === currentDay);
    
    if (todayMeal) {
      // Determine next meal based on time of day
      if (currentHour < 10 && todayMeal.breakfast) return { meal: 'Breakfast', day: currentDay, recipeId: todayMeal.breakfast };
      if (currentHour < 14 && todayMeal.lunch) return { meal: 'Lunch', day: currentDay, recipeId: todayMeal.lunch };
      if (currentHour < 18 && todayMeal.snack) return { meal: 'Snack', day: currentDay, recipeId: todayMeal.snack };
      if (currentHour < 22 && todayMeal.dinner) return { meal: 'Dinner', day: currentDay, recipeId: todayMeal.dinner };
    }
    
    // Find tomorrow's first meal
    const tomorrowIndex = (today.getDay() + 1) % 7;
    const tomorrowDay = dayNames[tomorrowIndex];
    const tomorrowMeal = currentWeekPlan.meals.find(meal => meal.day === tomorrowDay);
    
    if (tomorrowMeal) {
      if (tomorrowMeal.breakfast) return { meal: 'Breakfast', day: tomorrowDay, recipeId: tomorrowMeal.breakfast };
      if (tomorrowMeal.lunch) return { meal: 'Lunch', day: tomorrowDay, recipeId: tomorrowMeal.lunch };
      if (tomorrowMeal.snack) return { meal: 'Snack', day: tomorrowDay, recipeId: tomorrowMeal.snack };
      if (tomorrowMeal.dinner) return { meal: 'Dinner', day: tomorrowDay, recipeId: tomorrowMeal.dinner };
    }
    
    return null;
  };

  const nextMeal = getNextMeal();
  const nextMealRecipe = nextMeal ? recipes.find(r => r.id === nextMeal.recipeId) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onNavigateToRecipes}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{recipes.length}</p>
              <p className="text-sm text-gray-600">Recipes Available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onNavigateToMealPlanner}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-500" />
            <div>
              {nextMeal && nextMealRecipe ? (
                <>
                  <p className="text-sm font-medium line-clamp-1">{nextMealRecipe.name}</p>
                  <p className="text-xs text-gray-600">Next: {nextMeal.meal} - {nextMeal.day}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">No meals planned</p>
                  <p className="text-xs text-gray-600">Create a meal plan</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{ingredients.length}</p>
              <p className="text-sm text-gray-600">Pantry Items</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
