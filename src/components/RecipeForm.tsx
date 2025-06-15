
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface RecipeFormData {
  name: string;
  description: string;
  ingredients: { name: string; quantity: number; unit: string }[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  source: string;
}

interface RecipeFormProps {
  formData: RecipeFormData;
  isEditing: boolean;
  onFormDataChange: (data: RecipeFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  formData,
  isEditing,
  onFormDataChange,
  onSubmit,
  onCancel
}) => {
  const updateFormData = (updates: Partial<RecipeFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  const addIngredientField = () => {
    updateFormData({
      ingredients: [...formData.ingredients, { name: '', quantity: 1, unit: 'pcs' }]
    });
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    updateFormData({ ingredients: updatedIngredients });
  };

  const addInstructionField = () => {
    updateFormData({
      instructions: [...formData.instructions, '']
    });
  };

  const updateInstruction = (index: number, value: string) => {
    const updatedInstructions = [...formData.instructions];
    updatedInstructions[index] = value;
    updateFormData({ instructions: updatedInstructions });
  };

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Recipe' : 'Add New Recipe'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recipeName">Recipe Name</Label>
            <Input
              id="recipeName"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="e.g., Spaghetti Bolognese"
            />
          </div>
          <div>
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              value={formData.source}
              onChange={(e) => updateFormData({ source: e.target.value })}
              placeholder="e.g., Family Recipe, Website URL"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Brief description of the recipe..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cookingTime">Cooking Time (minutes)</Label>
            <Input
              id="cookingTime"
              type="number"
              min="1"
              value={formData.cookingTime}
              onChange={(e) => updateFormData({ cookingTime: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="servings">Servings</Label>
            <Input
              id="servings"
              type="number"
              min="1"
              value={formData.servings}
              onChange={(e) => updateFormData({ servings: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <Label>Ingredients</Label>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 mt-2">
              <Input
                placeholder="Ingredient name"
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={ingredient.quantity}
                onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
              />
              <select
                value={ingredient.unit}
                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
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
          ))}
          <Button type="button" variant="outline" onClick={addIngredientField} className="mt-2">
            <Plus className="w-4 h-4 mr-2" />
            Add Ingredient
          </Button>
        </div>

        <div>
          <Label>Instructions</Label>
          {formData.instructions.map((instruction, index) => (
            <Textarea
              key={index}
              placeholder={`Step ${index + 1}...`}
              value={instruction}
              onChange={(e) => updateInstruction(index, e.target.value)}
              className="mt-2"
            />
          ))}
          <Button type="button" variant="outline" onClick={addInstructionField} className="mt-2">
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={onSubmit}>
            {isEditing ? 'Update Recipe' : 'Save Recipe'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
