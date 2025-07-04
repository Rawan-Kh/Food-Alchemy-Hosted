
import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Search } from 'lucide-react';
import { Recipe } from './RecipeManager';
import { MealType } from '@/types/mealPlanner';
import { categorizeRecipe } from '@/utils/recipeCategories';

interface RecipeSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
  recipes: Recipe[];
  mealType: MealType;
  day: string;
}

export const RecipeSelectionDialog: React.FC<RecipeSelectionDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
  recipes,
  mealType,
  day
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecipes = useMemo(() => {
    const searchFiltered = recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by meal type match (matching meal types first)
    return searchFiltered.sort((a, b) => {
      const aMatches = categorizeRecipe(a) === mealType;
      const bMatches = categorizeRecipe(b) === mealType;
      
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [recipes, searchTerm, mealType]);

  const getMealTypeColor = (recipe: Recipe) => {
    const category = categorizeRecipe(recipe);
    const colors = {
      breakfast: 'bg-yellow-100 text-yellow-800',
      snack: 'bg-green-100 text-green-800',
      lunch: 'bg-blue-100 text-blue-800',
      dinner: 'bg-purple-100 text-purple-800'
    };
    return colors[category];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Select Recipe for {day} {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredRecipes.map((recipe) => {
              const isRecommended = categorizeRecipe(recipe) === mealType;
              return (
                <div
                  key={recipe.id}
                  className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isRecommended ? 'border-blue-300 bg-blue-50' : ''
                  }`}
                  onClick={() => onSelect(recipe)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm">{recipe.name}</h3>
                      {isRecommended && (
                        <Badge variant="secondary" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {recipe.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.cookingTime}m
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {recipe.servings}
                      </div>
                    </div>
                    
                    <Badge className={getMealTypeColor(recipe)} variant="secondary">
                      {categorizeRecipe(recipe).charAt(0).toUpperCase() + categorizeRecipe(recipe).slice(1)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRecipes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No recipes found matching your search.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
