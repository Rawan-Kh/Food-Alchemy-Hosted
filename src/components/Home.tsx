
import React from 'react';
import { Recipe } from './RecipeManager';
import { Ingredient } from './CategorizedIngredientManager';
import { WeeklyMealPlan } from '@/types/mealPlanner';
import { HomeGreeting } from './HomeGreeting';
import { QuickStats } from './QuickStats';
import { UpcomingMeals } from './UpcomingMeals';
import { QuickRecipeRecommendation } from './QuickRecipeRecommendation';

interface HomeProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  currentWeekPlan: WeeklyMealPlan | null;
  onViewRecipe: (recipe: Recipe) => void;
  onUseRecipe: (recipe: Recipe) => void;
  onNavigateToRecipes: () => void;
  onNavigateToMealPlanner: () => void;
}

export const Home: React.FC<HomeProps> = ({
  recipes,
  ingredients,
  currentWeekPlan,
  onViewRecipe,
  onUseRecipe,
  onNavigateToRecipes,
  onNavigateToMealPlanner
}) => {
  const calculateMatchPercentage = (recipe: Recipe): number => {
    const availableIngredientNames = ingredients.map(i => i.name.toLowerCase());
    const requiredIngredients = recipe.ingredients.length;
    
    if (requiredIngredients === 0) return 100;
    
    const matchedIngredients = recipe.ingredients.filter(recipeIngredient =>
      availableIngredientNames.some(availableIngredient =>
        availableIngredient.includes(recipeIngredient.name.toLowerCase()) ||
        recipeIngredient.name.toLowerCase().includes(availableIngredient)
      )
    ).length;

    return Math.round((matchedIngredients / requiredIngredients) * 100);
  };

  return (
    <div className="space-y-6">
      <HomeGreeting />
      
      <QuickStats 
        recipes={recipes}
        ingredients={ingredients}
        currentWeekPlan={currentWeekPlan}
        onNavigateToRecipes={onNavigateToRecipes}
        onNavigateToMealPlanner={onNavigateToMealPlanner}
      />

      <QuickRecipeRecommendation
        recipes={recipes}
        ingredients={ingredients}
        onViewRecipe={onViewRecipe}
        onUseRecipe={onUseRecipe}
        calculateMatchPercentage={calculateMatchPercentage}
      />

      <UpcomingMeals
        currentWeekPlan={currentWeekPlan}
        recipes={recipes}
        onNavigateToMealPlanner={onNavigateToMealPlanner}
      />
    </div>
  );
};
