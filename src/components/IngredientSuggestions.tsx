
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Plus } from 'lucide-react';

interface IngredientSuggestion {
  name: string;
  category: string;
  commonUnits: string[];
  defaultQuantity: number;
  defaultUnit: string;
}

interface IngredientSuggestionsProps {
  input: string;
  onAcceptSuggestion: (suggestion: IngredientSuggestion) => void;
  onRejectSuggestion: (suggestion: IngredientSuggestion) => void;
  className?: string;
}

const commonIngredients: IngredientSuggestion[] = [
  // Vegetables
  { name: 'tomatoes', category: 'vegetables', commonUnits: ['pcs', 'kg', 'g'], defaultQuantity: 3, defaultUnit: 'pcs' },
  { name: 'onions', category: 'vegetables', commonUnits: ['pcs', 'kg', 'g'], defaultQuantity: 2, defaultUnit: 'pcs' },
  { name: 'garlic', category: 'vegetables', commonUnits: ['cloves', 'pcs', 'g'], defaultQuantity: 3, defaultUnit: 'cloves' },
  { name: 'carrots', category: 'vegetables', commonUnits: ['pcs', 'kg', 'g'], defaultQuantity: 2, defaultUnit: 'pcs' },
  { name: 'potatoes', category: 'vegetables', commonUnits: ['pcs', 'kg', 'g'], defaultQuantity: 4, defaultUnit: 'pcs' },
  { name: 'bell peppers', category: 'vegetables', commonUnits: ['pcs', 'g'], defaultQuantity: 2, defaultUnit: 'pcs' },
  { name: 'mushrooms', category: 'vegetables', commonUnits: ['g', 'pcs', 'cups'], defaultQuantity: 200, defaultUnit: 'g' },
  { name: 'spinach', category: 'vegetables', commonUnits: ['g', 'cups', 'bunches'], defaultQuantity: 150, defaultUnit: 'g' },
  
  // Meat & Protein
  { name: 'chicken breast', category: 'meat', commonUnits: ['g', 'kg', 'pcs'], defaultQuantity: 400, defaultUnit: 'g' },
  { name: 'ground beef', category: 'meat', commonUnits: ['g', 'kg', 'lbs'], defaultQuantity: 500, defaultUnit: 'g' },
  { name: 'salmon', category: 'meat', commonUnits: ['g', 'kg', 'fillets'], defaultQuantity: 300, defaultUnit: 'g' },
  { name: 'eggs', category: 'protein', commonUnits: ['pcs', 'dozen'], defaultQuantity: 6, defaultUnit: 'pcs' },
  
  // Grains & Staples
  { name: 'rice', category: 'grains', commonUnits: ['cups', 'g', 'kg'], defaultQuantity: 1, defaultUnit: 'cups' },
  { name: 'pasta', category: 'grains', commonUnits: ['g', 'kg', 'packs'], defaultQuantity: 250, defaultUnit: 'g' },
  { name: 'bread', category: 'grains', commonUnits: ['slices', 'loaves', 'pcs'], defaultQuantity: 8, defaultUnit: 'slices' },
  { name: 'flour', category: 'grains', commonUnits: ['cups', 'g', 'kg'], defaultQuantity: 2, defaultUnit: 'cups' },
  
  // Dairy
  { name: 'milk', category: 'dairy', commonUnits: ['ml', 'l', 'cups'], defaultQuantity: 500, defaultUnit: 'ml' },
  { name: 'cheese', category: 'dairy', commonUnits: ['g', 'slices', 'cups'], defaultQuantity: 100, defaultUnit: 'g' },
  { name: 'butter', category: 'dairy', commonUnits: ['g', 'tbsp', 'sticks'], defaultQuantity: 100, defaultUnit: 'g' },
  
  // Condiments & Spices
  { name: 'olive oil', category: 'condiments', commonUnits: ['tbsp', 'ml', 'cups'], defaultQuantity: 2, defaultUnit: 'tbsp' },
  { name: 'salt', category: 'spices', commonUnits: ['tsp', 'tbsp', 'g'], defaultQuantity: 1, defaultUnit: 'tsp' },
  { name: 'black pepper', category: 'spices', commonUnits: ['tsp', 'tbsp', 'g'], defaultQuantity: 0.5, defaultUnit: 'tsp' },
];

export const IngredientSuggestions: React.FC<IngredientSuggestionsProps> = ({
  input,
  onAcceptSuggestion,
  onRejectSuggestion,
  className
}) => {
  const [suggestions, setSuggestions] = useState<IngredientSuggestion[]>([]);
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    const searchTerm = input.toLowerCase().trim();
    const filtered = commonIngredients.filter(ingredient => 
      ingredient.name.toLowerCase().includes(searchTerm) &&
      !rejectedSuggestions.has(ingredient.name)
    ).slice(0, 6); // Limit to 6 suggestions

    setSuggestions(filtered);
  }, [input, rejectedSuggestions]);

  const handleAccept = (suggestion: IngredientSuggestion) => {
    onAcceptSuggestion(suggestion);
    // Remove from suggestions after accepting
    setSuggestions(prev => prev.filter(s => s.name !== suggestion.name));
  };

  const handleReject = (suggestion: IngredientSuggestion) => {
    setRejectedSuggestions(prev => new Set([...prev, suggestion.name]));
    onRejectSuggestion(suggestion);
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className={`mt-2 ${className}`}>
      <CardContent className="p-3">
        <div className="text-sm text-gray-600 mb-2 font-medium">Suggested ingredients:</div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.name}
              className="flex items-center gap-1 bg-gray-50 rounded-lg p-2 border"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{suggestion.name}</span>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {suggestion.defaultQuantity} {suggestion.defaultUnit}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.category}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => handleAccept(suggestion)}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleReject(suggestion)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
