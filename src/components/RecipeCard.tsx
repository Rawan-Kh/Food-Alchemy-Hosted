import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Edit, Trash2, Eye, Image, ChefHat } from 'lucide-react';
import { Recipe } from './RecipeManager';
import { Ingredient } from './IngredientManager';
interface RecipeCardProps {
  recipe: Recipe;
  ingredients: Ingredient[];
  matchPercentage: number;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onUse: (recipe: Recipe) => void;
  onViewDetails: (recipe: Recipe) => void;
}
export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  ingredients,
  matchPercentage,
  onEdit,
  onDelete,
  onUse,
  onViewDetails
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };
  const handleImageLoad = () => {
    setImageLoading(false);
  };
  return <Card className="flex flex-col">
      {recipe.image && !imageError ? <div className="w-full h-48 overflow-hidden rounded-t-lg relative">
          {imageLoading && <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <ChefHat className="w-12 h-12 text-gray-400" />
            </div>}
          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" onError={handleImageError} onLoad={handleImageLoad} />
        </div> : <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
          <ChefHat className="w-16 h-16 text-gray-400" />
        </div>}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{recipe.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={matchPercentage === 100 ? 'default' : matchPercentage >= 75 ? 'secondary' : 'outline'} className={matchPercentage === 100 ? 'bg-green-500' : matchPercentage >= 75 ? 'bg-orange-500' : ''}>
              {matchPercentage}% match
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="ghost" size="sm" onClick={() => onViewDetails(recipe)} className="text-gray-600 hover:text-gray-800">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(recipe)} className="text-blue-600 hover:text-blue-800">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(recipe)} className="text-red-600 hover:text-red-800">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-600 ">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {recipe.cookingTime}m
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {recipe.servings} servings
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>

        <div className="flex-1">
          <p className="text-xs text-gray-500">Source: {recipe.source}</p>
        </div>

        <div className="space-y-2">
          <Button onClick={() => onViewDetails(recipe)} variant="outline" className="w-full">
            View Details
          </Button>
          <Button onClick={() => onUse(recipe)} className="w-full" disabled={matchPercentage < 100}>
            {matchPercentage === 100 ? 'Cook This Recipe' : 'Missing Ingredients'}
          </Button>
        </div>
      </CardContent>
    </Card>;
};