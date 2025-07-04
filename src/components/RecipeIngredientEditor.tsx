
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
}

interface RecipeIngredientEditorProps {
  ingredients: RecipeIngredient[];
  onUpdateIngredients: (ingredients: RecipeIngredient[]) => void;
}

export const RecipeIngredientEditor: React.FC<RecipeIngredientEditorProps> = ({
  ingredients,
  onUpdateIngredients
}) => {
  const addIngredient = () => {
    onUpdateIngredients([...ingredients, { name: '', quantity: 1, unit: 'pcs' }]);
  };

  const removeIngredient = (index: number) => {
    onUpdateIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string | number) => {
    const updatedIngredients = ingredients.map((ingredient, i) =>
      i === index ? { ...ingredient, [field]: value } : ingredient
    );
    onUpdateIngredients(updatedIngredients);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Ingredients</Label>
        <Button type="button" onClick={addIngredient} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </Button>
      </div>
      
      {ingredients.map((ingredient, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-5">
            <Input
              value={ingredient.name}
              onChange={(e) => updateIngredient(index, 'name', e.target.value)}
              placeholder="Ingredient name"
            />
          </div>
          <div className="col-span-3">
            <Input
              type="number"
              min="0"
              step="0.1"
              value={ingredient.quantity}
              onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
              placeholder="Quantity"
            />
          </div>
          <div className="col-span-3">
            <select
              value={ingredient.unit}
              onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="pcs">pieces</option>
              <option value="kg">kg</option>
              <option value="g">grams</option>
              <option value="l">liters</option>
              <option value="ml">ml</option>
              <option value="cups">cups</option>
              <option value="tbsp">tablespoons</option>
              <option value="tsp">teaspoons</option>
            </select>
          </div>
          <div className="col-span-1">
            <Button
              type="button"
              onClick={() => removeIngredient(index)}
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
      
      {ingredients.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          No ingredients added yet. Click "Add Ingredient" to start.
        </p>
      )}
    </div>
  );
};
