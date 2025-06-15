
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Edit, Trash2 } from 'lucide-react';
import { Recipe } from './RecipeManager';
import { Ingredient } from './IngredientManager';
import { RecipeIngredientsList } from './RecipeIngredientsList';
import { RecipeInstructions } from './RecipeInstructions';

interface RecipeCardProps {
  recipe: Recipe;
  ingredients: Ingredient[];
  matchPercentage: number;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onUse: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  ingredients,
  matchPercentage,
  onEdit,
  onDelete,
  onUse
}) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{recipe.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={matchPercentage === 100 ? 'default' : matchPercentage >= 75 ? 'secondary' : 'outline'}
              className={matchPercentage === 100 ? 'bg-green-500' : matchPercentage >= 75 ? 'bg-orange-500' : ''}
            >
              {matchPercentage}% match
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
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
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {recipe.cookingTime}m
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {recipe.servings} servings
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description">
            <AccordionTrigger className="text-sm font-medium">
              Description
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-600">{recipe.description}</p>
            </AccordionContent>
          </AccordionItem>
          
          <RecipeIngredientsList 
            ingredients={recipe.ingredients}
            availableIngredients={ingredients}
          />
          <RecipeInstructions instructions={recipe.instructions} />
        </Accordion>

        <div className="flex-1">
          <p className="text-xs text-gray-500">Source: {recipe.source}</p>
        </div>

        <Button 
          onClick={() => onUse(recipe)} 
          className="w-full"
          disabled={matchPercentage < 100}
        >
          {matchPercentage === 100 ? 'Cook This Recipe' : 'Missing Ingredients'}
        </Button>
      </CardContent>
    </Card>
  );
};
