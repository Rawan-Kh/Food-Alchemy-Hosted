
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Edit3 } from 'lucide-react';

export interface PendingIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  expiryDate?: string;
}

interface IngredientEditorProps {
  ingredients: PendingIngredient[];
  onUpdateIngredient: (id: string, updates: Partial<PendingIngredient>) => void;
  onRemoveIngredient: (id: string) => void;
  onConfirmAll: () => void;
  onClearAll: () => void;
}

const commonUnits = [
  'pcs', 'g', 'kg', 'ml', 'l', 'cups', 'tbsp', 'tsp', 
  'cloves', 'slices', 'bunches', 'cans', 'bottles', 'packs'
];

const commonCategories = [
  'Vegetables', 'Fruits', 'Meat & Poultry', 'Seafood', 'Dairy', 
  'Grains & Cereals', 'Herbs & Spices', 'Condiments & Sauces', 
  'Beverages', 'Snacks', 'Frozen', 'Canned Goods', 'Baking', 'Other'
];

export const IngredientEditor: React.FC<IngredientEditorProps> = ({
  ingredients,
  onUpdateIngredient,
  onRemoveIngredient,
  onConfirmAll,
  onClearAll
}) => {
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());

  // Set all new ingredients to edit mode when they're added
  useEffect(() => {
    const newEditingIds = new Set(ingredients.map(ingredient => ingredient.id));
    setEditingIds(newEditingIds);
  }, [ingredients]);

  const toggleEditing = (id: string) => {
    setEditingIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (ingredients.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Review & Edit Ingredients ({ingredients.length})
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
            <Button
              size="sm"
              onClick={onConfirmAll}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Add All
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="font-medium truncate">{ingredient.name}</span>
                  {ingredient.category && (
                    <Badge variant="outline" className="text-xs w-fit">
                      {ingredient.category}
                    </Badge>
                  )}
                </div>
                
                {editingIds.has(ingredient.id) ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input
                      type="number"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        onUpdateIngredient(ingredient.id, {
                          quantity: parseFloat(e.target.value) || 0
                        })
                      }
                      className="w-20"
                      min="0"
                      step="0.1"
                    />
                    <Select
                      value={ingredient.unit}
                      onValueChange={(value) =>
                        onUpdateIngredient(ingredient.id, { unit: value })
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {commonUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={ingredient.category || ''}
                      onValueChange={(value) =>
                        onUpdateIngredient(ingredient.id, { category: value })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleEditing(ingredient.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {ingredient.quantity} {ingredient.unit}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleEditing(ingredient.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveIngredient(ingredient.id)}
                className="text-red-600 hover:text-red-700 ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
