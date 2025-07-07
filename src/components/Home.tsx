
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Search, Calendar, Clock, Users, Star, Sparkles } from 'lucide-react';
import { Recipe } from './RecipeManager';
import { Ingredient } from './CategorizedIngredientManager';
import { WeeklyMealPlan } from '@/types/mealPlanner';
import { HomeGreeting } from './HomeGreeting';
import { QuickStats } from './QuickStats';
import { FeaturedRecipes } from './FeaturedRecipes';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      const results = recipes.filter(recipe => {
        const searchLower = term.toLowerCase();
        
        // Search by recipe name
        const nameMatch = recipe.name.toLowerCase().includes(searchLower);
        
        // Search by description for meal type hints
        const descriptionMatch = recipe.description.toLowerCase().includes(searchLower);
        
        // Search by ingredients
        const ingredientMatch = recipe.ingredients.some(ingredient => 
          ingredient.name.toLowerCase().includes(searchLower)
        );
        
        // Search by meal type keywords
        const mealTypeMatch = 
          (searchLower.includes('breakfast') && (recipe.name.toLowerCase().includes('breakfast') || recipe.description.toLowerCase().includes('breakfast'))) ||
          (searchLower.includes('lunch') && (recipe.name.toLowerCase().includes('lunch') || recipe.description.toLowerCase().includes('lunch'))) ||
          (searchLower.includes('dinner') && (recipe.name.toLowerCase().includes('dinner') || recipe.description.toLowerCase().includes('dinner'))) ||
          (searchLower.includes('snack') && (recipe.name.toLowerCase().includes('snack') || recipe.description.toLowerCase().includes('snack'))) ||
          (searchLower.includes('dessert') && (recipe.name.toLowerCase().includes('dessert') || recipe.description.toLowerCase().includes('dessert')));
        
        return nameMatch || descriptionMatch || ingredientMatch || mealTypeMatch;
      });
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

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

      {/* Enhanced Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by recipe name, ingredients, or meal type (breakfast, lunch, dinner)..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {showSearchResults && (
            <div className="mt-4 max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.slice(0, 5).map((recipe) => {
                    const matchPercentage = calculateMatchPercentage(recipe);
                    return (
                      <div
                        key={recipe.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          onViewRecipe(recipe);
                          setShowSearchResults(false);
                          setSearchTerm('');
                        }}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{recipe.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-1">{recipe.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={matchPercentage === 100 ? 'default' : matchPercentage >= 75 ? 'secondary' : 'outline'}
                            className={matchPercentage === 100 ? 'bg-green-500' : matchPercentage >= 75 ? 'bg-orange-500' : ''}
                          >
                            {matchPercentage}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No recipes found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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

      <FeaturedRecipes
        recipes={recipes}
        ingredients={ingredients}
        onViewRecipe={onViewRecipe}
        calculateMatchPercentage={calculateMatchPercentage}
      />
    </div>
  );
};
