
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Edit, Trash2, ChefHat } from 'lucide-react';
import { Recipe } from './RecipeManager';
import { Ingredient } from './CategorizedIngredientManager';
import { RecipeIngredientsList } from './RecipeIngredientsList';
import { RecipeInstructions } from './RecipeInstructions';

interface RecipeDetailsModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  matchPercentage: number;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onUse: (recipe: Recipe) => void;
}

export const RecipeDetailsModal: React.FC<RecipeDetailsModalProps> = ({
  recipe,
  isOpen,
  onClose,
  ingredients,
  matchPercentage,
  onEdit,
  onDelete,
  onUse
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!recipe) return null;

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{recipe.name}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {recipe.cookingTime}m
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {recipe.servings} servings
                </div>
                <Badge 
                  variant={matchPercentage === 100 ? 'default' : matchPercentage >= 75 ? 'secondary' : 'outline'}
                  className={matchPercentage === 100 ? 'bg-green-500' : matchPercentage >= 75 ? 'bg-orange-500' : ''}
                >
                  {matchPercentage}% match
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(recipe)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(recipe)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {recipe.image && !imageError ? (
            <div className="w-full h-64 overflow-hidden rounded-lg relative">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <ChefHat className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
          ) : recipe.image ? (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <ChefHat className="w-20 h-20 text-gray-400" />
            </div>
          ) : null}

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{recipe.description}</p>
          </div>

          <RecipeIngredientsList 
            ingredients={recipe.ingredients}
            availableIngredients={ingredients}
          />

          <RecipeInstructions instructions={recipe.instructions} />

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-gray-500">Source: {recipe.source}</p>
            <Button 
              onClick={() => onUse(recipe)} 
              disabled={matchPercentage < 100}
              className="min-w-[120px]"
            >
              {matchPercentage === 100 ? 'Cook This Recipe' : 'Missing Ingredients'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
