
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Ingredient } from './IngredientManager';

interface RecipeIngredientsListProps {
  ingredients: { name: string; quantity: number; unit: string }[];
  availableIngredients: Ingredient[];
}

export const RecipeIngredientsList: React.FC<RecipeIngredientsListProps> = ({ 
  ingredients, 
  availableIngredients 
}) => {
  return (
    <AccordionItem value="ingredients">
      <AccordionTrigger className="text-sm font-medium">
        Ingredients ({ingredients.length})
      </AccordionTrigger>
      <AccordionContent>
        <ul className="text-sm space-y-1">
          {ingredients.map((ingredient, index) => {
            const hasIngredient = availableIngredients.some(i => 
              i.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
              ingredient.name.toLowerCase().includes(i.name.toLowerCase())
            );
            return (
              <li key={index} className={`flex items-center gap-2 ${hasIngredient ? 'text-green-600' : 'text-red-500'}`}>
                <span className={`w-2 h-2 rounded-full ${hasIngredient ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
              </li>
            );
          })}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
};
