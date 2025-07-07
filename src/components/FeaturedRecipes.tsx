
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users } from 'lucide-react';
import { Recipe } from './RecipeManager';
import { Ingredient } from './CategorizedIngredientManager';

interface FeaturedRecipesProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onViewRecipe: (recipe: Recipe) => void;
  calculateMatchPercentage: (recipe: Recipe) => number;
}

export const FeaturedRecipes: React.FC<FeaturedRecipesProps> = ({
  recipes,
  ingredients,
  onViewRecipe,
  calculateMatchPercentage
}) => {
  const getFeaturedRecipes = () => {
    // Get recipes with good match percentages
    const recipesWithMatch = recipes.map(recipe => ({
      recipe,
      matchPercentage: calculateMatchPercentage(recipe)
    }));

    // Sort by match percentage and get top recipes
    const topRecipes = recipesWithMatch
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 3);

    return topRecipes;
  };

  const featuredRecipes = getFeaturedRecipes();

  if (featuredRecipes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Featured Recipes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredRecipes.map(({ recipe, matchPercentage }) => (
            <div
              key={recipe.id}
              className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onViewRecipe(recipe)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium line-clamp-2">{recipe.name}</h4>
                  <Badge 
                    variant={matchPercentage === 100 ? 'default' : matchPercentage >= 75 ? 'secondary' : 'outline'}
                    className={matchPercentage === 100 ? 'bg-green-500' : matchPercentage >= 75 ? 'bg-orange-500' : ''}
                  >
                    {matchPercentage}%
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {recipe.cookingTime}m
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {recipe.servings} servings
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
