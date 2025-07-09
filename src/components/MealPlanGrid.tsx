
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { WeeklyMealPlan, MealType, DAYS_OF_WEEK } from '@/types/mealPlanner';
import { Recipe } from './RecipeManager';
import { RecipeSelectionDialog } from './RecipeSelectionDialog';

interface MealPlanGridProps {
  weekPlan: WeeklyMealPlan;
  recipes: Recipe[];
  onAssignRecipe: (day: string, mealType: MealType, recipeId: string) => void;
  onRemoveRecipe: (day: string, mealType: MealType) => void;
  getRecipeById: (id: string) => Recipe | undefined;
}

const MEAL_TYPES: {
  type: MealType;
  label: string;
  color: string;
}[] = [{
  type: 'breakfast',
  label: 'Breakfast',
  color: 'bg-yellow-100 text-yellow-800'
}, {
  type: 'snack',
  label: 'Snack',
  color: 'bg-green-100 text-green-800'
}, {
  type: 'lunch',
  label: 'Lunch',
  color: 'bg-blue-100 text-blue-800'
}, {
  type: 'dinner',
  label: 'Dinner',
  color: 'bg-purple-100 text-purple-800'
}];

export const MealPlanGrid: React.FC<MealPlanGridProps> = ({
  weekPlan,
  recipes,
  onAssignRecipe,
  onRemoveRecipe,
  getRecipeById
}) => {
  const [selectedSlot, setSelectedSlot] = useState<{
    day: string;
    mealType: MealType;
  } | null>(null);

  const handleRecipeSelect = (recipe: Recipe) => {
    if (selectedSlot) {
      onAssignRecipe(selectedSlot.day, selectedSlot.mealType, recipe.id);
      setSelectedSlot(null);
    }
  };

  const getMealForDay = (day: string) => {
    return weekPlan.meals.find(meal => meal.day === day);
  };

  return (
    <>
      <div className="grid grid-cols-8 gap-4 min-w-[768px]">
        {/* Header row */}
        <div className="font-semibold text-left py-2">Meal</div>
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="font-semibold text-center py-2">
            {day.slice(0, 3)}
          </div>
        ))}

        {/* Meal rows */}
        {MEAL_TYPES.map(({ type, label, color }) => (
          <React.Fragment key={type}>
            <div className="flex items-center py-2">
              <Badge className={color}>{label}</Badge>
            </div>
            {DAYS_OF_WEEK.map(day => {
              const dayMeal = getMealForDay(day);
              const recipeId = dayMeal?.[type];
              const recipe = recipeId ? getRecipeById(recipeId) : undefined;
              
              return (
                <Card key={`${day}-${type}`} className="min-h-[80px]">
                  <CardContent className="p-2">
                    {recipe ? (
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-medium line-clamp-2">
                            {recipe.name}
                          </h4>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onRemoveRecipe(day, type)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500">
                          {recipe.cookingTime}m • {recipe.servings} servings
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        className="w-full h-full flex items-center justify-center" 
                        onClick={() => setSelectedSlot({ day, mealType: type })}
                      >
                        <Plus className="h-4 w-4 text-gray-400" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {selectedSlot && (
        <RecipeSelectionDialog 
          isOpen={true}
          onClose={() => setSelectedSlot(null)}
          onSelect={handleRecipeSelect}
          recipes={recipes}
          mealType={selectedSlot.mealType}
          day={selectedSlot.day}
        />
      )}
    </>
  );
};
