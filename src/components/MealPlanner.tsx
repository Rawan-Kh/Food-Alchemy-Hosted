
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, X } from 'lucide-react';
import { MealPlanGrid } from './MealPlanGrid';
import { MealPlanHistoryDropdown } from './MealPlanHistoryDropdown';
import { ShoppingListManager } from './ShoppingListManager';
import { Recipe } from './RecipeManager';
import { Ingredient } from './CategorizedIngredientManager';
import { useMealPlanner } from '@/hooks/useMealPlanner';

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
    currentShoppingList,
    createNewWeekPlan,
    assignRecipeToMeal,
    removeRecipeFromMeal,
    consumeMealPlan,
    cancelMealPlan,
    generateShoppingListForPlan,
    toggleShoppingListItem,
    addShoppingItemToPantry,
    completeShoppingList,
    getRecipeById,
    deleteFromHistory
  } = useMealPlanner(recipes, ingredients, onUpdateIngredients);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Meal Planner
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!currentWeekPlan ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Meal Plan</h3>
              <p className="text-gray-600 mb-4">
                Create a new weekly meal plan to get started with organized meal planning.
              </p>
              <Button onClick={createNewWeekPlan} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Meal Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    Week Starting: {new Date(currentWeekPlan.weekStarting).toLocaleDateString()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Plan your meals for the week and track ingredient usage
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={generateShoppingListForPlan}
                    disabled={!!currentShoppingList}
                  >
                    Generate Shopping List
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelMealPlan}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel Plan
                  </Button>
                  <Button onClick={consumeMealPlan} className="bg-green-600 hover:bg-green-700">
                    Complete Week
                  </Button>
                </div>
              </div>

              <MealPlanGrid
                weekPlan={currentWeekPlan}
                recipes={recipes}
                onAssignRecipe={assignRecipeToMeal}
                onRemoveRecipe={removeRecipeFromMeal}
                getRecipeById={getRecipeById}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {currentShoppingList && (
        <ShoppingListManager
          shoppingList={currentShoppingList}
          onToggleItem={toggleShoppingListItem}
          onAddToPantry={addShoppingItemToPantry}
          onCompleteShoppingList={completeShoppingList}
        />
      )}

      <MealPlanHistoryDropdown
        history={mealPlanHistory}
        getRecipeById={getRecipeById}
        onDeleteHistory={deleteFromHistory}
      />
    </div>
  );
};
