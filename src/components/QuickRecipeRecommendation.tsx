
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Clock, Users } from 'lucide-react';
import { Recipe } from './RecipeManager';
import { Ingredient } from './CategorizedIngredientManager';

interface QuickRecipeRecommendationProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onViewRecipe: (recipe: Recipe) => void;
  onUseRecipe: (recipe: Recipe) => void;
  calculateMatchPercentage: (recipe: Recipe) => number;
}

export const QuickRecipeRecommendation: React.FC<QuickRecipeRecommendationProps> = ({
  recipes,
  ingredients,
  onViewRecipe,
  onUseRecipe,
  calculateMatchPercentage
}) => {
  const [currentRecommendation, setCurrentRecommendation] = useState<Recipe | null>(null);

  const getRecommendation = () => {
    // Get recipes with high match percentage
    const recipesWithMatch = recipes.map(recipe => ({
      recipe,
      matchPercentage: calculateMatchPercentage(recipe)
    }));

    // Filter recipes with at least 50% match and sort by match percentage
    const availableRecipes = recipesWithMatch
      .filter(item => item.matchPercentage >= 50)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    if (availableRecipes.length === 0) {
      // If no good matches, just pick a random recipe
      const randomIndex = Math.floor(Math.random() * recipes.length);
      return recipes[randomIndex] || null;
    }

    // Pick from top 3 matches randomly to add variety
    const topMatches = availableRecipes.slice(0, Math.min(3, availableRecipes.length));
    const randomIndex = Math.floor(Math.random() * topMatches.length);
    return topMatches[randomIndex]?.recipe || null;
  };

  const handleGetRecommendation = () => {
    const recommendation = getRecommendation();
    setCurrentRecommendation(recommendation);
  };

  React.useEffect(() => {
    if (recipes.length > 0 && !currentRecommendation) {
      handleGetRecommendation();
    }
  }, [recipes]);

  if (!currentRecommendation) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Button onClick={handleGetRecommendation} size="lg" className="gap-2">
              <Sparkles className="w-5 h-5" />
              What can I cook today?
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const matchPercentage = calculateMatchPercentage(currentRecommendation);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            What can I cook today?
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleGetRecommendation}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{currentRecommendation.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{currentRecommendation.description}</p>
            </div>
            <Badge 
              variant={matchPercentage === 100 ? 'default' : matchPercentage >= 75 ? 'secondary' : 'outline'}
              className={matchPercentage === 100 ? 'bg-green-500' : matchPercentage >= 75 ? 'bg-orange-500' : ''}
            >
              {matchPercentage}% match
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {currentRecommendation.cookingTime}m
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {currentRecommendation.servings} servings
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={() => onViewRecipe(currentRecommendation)} variant="outline" className="flex-1">
              View Recipe
            </Button>
            {matchPercentage === 100 && (
              <Button onClick={() => onUseRecipe(currentRecommendation)} className="flex-1">
                Cook Now
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
