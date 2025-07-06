import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { RecipeIngredientEditor } from './RecipeIngredientEditor';
import { RecipeImageUpload } from './RecipeImageUpload';

interface RecipeFormProps {
  formData: {
    name: string;
    description: string;
    ingredients: { name: string; quantity: number; unit: string }[];
    instructions: string[];
    cookingTime: number;
    servings: number;
    source: string;
    image?: string;
  };
  isEditing?: boolean;
  onFormDataChange: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  formData,
  isEditing = false,
  onFormDataChange,
  onSubmit,
  onCancel
}) => {
  const updateFormData = (field: string, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const addInstruction = () => {
    updateFormData('instructions', [...formData.instructions, '']);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    updateFormData('instructions', newInstructions);
  };

  const removeInstruction = (index: number) => {
    const newInstructions = formData.instructions.filter((_, i) => i !== index);
    updateFormData('instructions', newInstructions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Recipe' : 'Add New Recipe'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Recipe Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Enter recipe name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Describe your recipe"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cookingTime">Cooking Time (minutes)</Label>
                <Input
                  id="cookingTime"
                  type="number"
                  value={formData.cookingTime}
                  onChange={(e) => updateFormData('cookingTime', parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  value={formData.servings}
                  onChange={(e) => updateFormData('servings', parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => updateFormData('source', e.target.value)}
                placeholder="Where did you find this recipe?"
              />
            </div>
          </div>

          <div>
            <RecipeImageUpload
              currentImage={formData.image}
              onImageChange={(image) => updateFormData('image', image)}
            />
          </div>
        </div>

        <RecipeIngredientEditor
          ingredients={formData.ingredients}
          onUpdateIngredients={(ingredients) => updateFormData('ingredients', ingredients)}
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Instructions</Label>
            <Button
              type="button"
              onClick={addInstruction}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Step
            </Button>
          </div>
          <div className="space-y-2">
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-medium text-orange-600">
                  {index + 1}
                </div>
                <Textarea
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                  rows={2}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onSubmit} className="flex-1">
            {isEditing ? 'Update Recipe' : 'Add Recipe'}
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
