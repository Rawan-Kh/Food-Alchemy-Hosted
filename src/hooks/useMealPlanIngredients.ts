
import { useState } from 'react';
import { WeeklyMealPlan } from '@/types/mealPlanner';
import { Recipe } from '@/components/RecipeManager';
import { Ingredient } from '@/components/IngredientManager';

export const useMealPlanIngredients = (
  recipes: Recipe[],
  onUpdateIngredients: (ingredients: Ingredient[]) => void
) => {
  const [originalIngredients, setOriginalIngredients] = useState<Ingredient[]>([]);

  const updateTemporaryIngredients = (plan: WeeklyMealPlan) => {
    if (originalIngredients.length === 0) return;

    let tempIngredients = [...originalIngredients];
    const usedRecipeIds: string[] = [];

    // Collect all recipe IDs used in the meal plan
    plan.meals.forEach(meal => {
      [meal.breakfast, meal.snack, meal.lunch, meal.dinner].forEach(recipeId => {
        if (recipeId) usedRecipeIds.push(recipeId);
      });
    });

    // Deduct ingredients for each used recipe
    usedRecipeIds.forEach(recipeId => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe) {
        recipe.ingredients.forEach(recipeIngredient => {
          const ingredientIndex = tempIngredients.findIndex(ingredient =>
            ingredient.name.toLowerCase().includes(recipeIngredient.name.toLowerCase()) ||
            recipeIngredient.name.toLowerCase().includes(ingredient.name.toLowerCase())
          );
          
          if (ingredientIndex !== -1) {
            const availableQuantity = tempIngredients[ingredientIndex].quantity;
            const requiredQuantity = recipeIngredient.quantity;
            
            if (availableQuantity >= requiredQuantity) {
              tempIngredients[ingredientIndex] = {
                ...tempIngredients[ingredientIndex],
                quantity: Math.max(0, availableQuantity - requiredQuantity)
              };
            }
          }
        });
      }
    });

    onUpdateIngredients(tempIngredients);
  };

  const restoreOriginalIngredients = () => {
    if (originalIngredients.length > 0) {
      onUpdateIngredients(originalIngredients);
    }
  };

  return {
    originalIngredients,
    setOriginalIngredients,
    updateTemporaryIngredients,
    restoreOriginalIngredients
  };
};
