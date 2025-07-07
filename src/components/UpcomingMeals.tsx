
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users } from 'lucide-react';
import { Recipe } from './RecipeManager';
import { WeeklyMealPlan } from '@/types/mealPlanner';

interface UpcomingMealsProps {
  currentWeekPlan: WeeklyMealPlan | null;
  recipes: Recipe[];
  onNavigateToMealPlanner: () => void;
}

export const UpcomingMeals: React.FC<UpcomingMealsProps> = ({
  currentWeekPlan,
  recipes,
  onNavigateToMealPlanner
}) => {
  const getUpcomingMeals = () => {
    if (!currentWeekPlan) return [];
    
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = today.getDay();
    const currentHour = today.getHours();
    
    const upcomingMeals: Array<{
      day: string;
      mealType: string;
      recipe: Recipe;
      isToday: boolean;
    }> = [];

    // Get next 3 days including today
    for (let i = 0; i < 3; i++) {
      const dayIndex = (currentDayIndex + i) % 7;
      const day = dayNames[dayIndex];
      const isToday = i === 0;
      
      const dayMeal = currentWeekPlan.meals.find(meal => meal.day === day);
      if (dayMeal) {
        const mealTypes = [
          { key: 'breakfast', name: 'Breakfast', hour: 8 },
          { key: 'lunch', name: 'Lunch', hour: 12 },
          { key: 'snack', name: 'Snack', hour: 15 },
          { key: 'dinner', name: 'Dinner', hour: 18 }
        ];
        
        mealTypes.forEach(mealType => {
          const recipeId = dayMeal[mealType.key as keyof typeof dayMeal];
          if (recipeId) {
            // Skip past meals for today
            if (isToday && currentHour > mealType.hour + 2) return;
            
            const recipe = recipes.find(r => r.id === recipeId);
            if (recipe) {
              upcomingMeals.push({
                day,
                mealType: mealType.name,
                recipe,
                isToday
              });
            }
          }
        });
      }
    }
    
    return upcomingMeals.slice(0, 4); // Show max 4 upcoming meals
  };

  const upcomingMeals = getUpcomingMeals();

  if (!currentWeekPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Meals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No meal plan created yet</p>
            <Button onClick={onNavigateToMealPlanner}>
              Create Meal Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Meals
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onNavigateToMealPlanner}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingMeals.length > 0 ? (
          <div className="space-y-3">
            {upcomingMeals.map((meal, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{meal.recipe.name}</h4>
                  <p className="text-sm text-gray-600">
                    {meal.mealType} • {meal.isToday ? 'Today' : meal.day}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {meal.recipe.cookingTime}m
                  <Users className="w-3 h-3 ml-2" />
                  {meal.recipe.servings}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No upcoming meals scheduled</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
