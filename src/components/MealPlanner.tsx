
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, X, RefreshCw, ShoppingCart } from 'lucide-react';
import { MealPlanGrid } from './MealPlanGrid';
import { MealPlanHistoryDropdown } from './MealPlanHistoryDropdown';
import { Recipe } from './RecipeManager';
import { Ingredient } from './CategorizedIngredientManager';
import { useMealPlanner } from '@/hooks/useMealPlanner';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface MealPlannerProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onUpdateIngredients: (ingredients: Ingredient[]) => void;
  onNavigateToShopping?: () => void;
}

export const MealPlanner: React.FC<MealPlannerProps> = ({
  recipes,
  ingredients,
  onUpdateIngredients,
  onNavigateToShopping
}) => {
  const { toast } = useToast();
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
    getRecipeById,
    deleteFromHistory
  } = useMealPlanner(recipes, ingredients, onUpdateIngredients);

  const handleGenerateShoppingList = () => {
    generateShoppingListForPlan();
    toast({
      title: "Shopping list generated!",
      description: "Check the Shopping tab to view your list.",
      action: onNavigateToShopping ? (
        <ToastAction altText="View Shopping List" onClick={onNavigateToShopping}>
          View Shopping List
        </ToastAction>
      ) : undefined
    });
  };

  const handleRegenerateShoppingList = () => {
    generateShoppingListForPlan();
    toast({
      title: "Shopping list updated!",
      description: "Your shopping list has been regenerated with current meal plan.",
      action: onNavigateToShopping ? (
        <ToastAction altText="View Shopping List" onClick={onNavigateToShopping}>
          View Shopping List
        </ToastAction>
      ) : undefined
    });
  };

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
            <div className="space-y-6 overflow-auto">
              <div className="flex justify-between items-center flex-wrap">
                <div>
                  <h3 className="font-semibold text-base">
                    Week Starting: {new Date(currentWeekPlan.weekStarting).toLocaleDateString()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Plan your meals for the week and track ingredient usage
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap mt-6">
                  {!currentShoppingList ? (
                    <Button 
                      onClick={handleGenerateShoppingList}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Generate Shopping List
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => onNavigateToShopping?.()}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        View Shopping List
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleRegenerateShoppingList}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate List
                      </Button>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={cancelMealPlan} 
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel Plan
                  </Button>
                  <Button 
                    onClick={consumeMealPlan} 
                    className="bg-green-600 hover:bg-green-700"
                  >
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

      <MealPlanHistoryDropdown 
        history={mealPlanHistory} 
        getRecipeById={getRecipeById} 
        onDeleteHistory={deleteFromHistory} 
      />
    </div>
  );
};
