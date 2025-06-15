
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Heart, Star, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IngredientSuggestion {
  name: string;
  category: string;
  commonUnits: string[];
  defaultQuantity: number;
  defaultUnit: string;
}

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  category: string;
  dateAdded: string;
}

interface TinderStyleSuggestionsProps {
  input: string;
  onAcceptSuggestion: (suggestion: IngredientSuggestion) => void;
  onRejectSuggestion: (suggestion: IngredientSuggestion) => void;
  currentIngredients: Ingredient[];
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

const getCategoryColor = (category: string) => {
  const colors = {
    vegetables: 'bg-green-100 text-green-800 border-green-200',
    meat: 'bg-red-100 text-red-800 border-red-200',
    protein: 'bg-purple-100 text-purple-800 border-purple-200',
    grains: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dairy: 'bg-blue-100 text-blue-800 border-blue-200',
    condiments: 'bg-orange-100 text-orange-800 border-orange-200',
    spices: 'bg-pink-100 text-pink-800 border-pink-200',
  };
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const TinderStyleSuggestions: React.FC<TinderStyleSuggestionsProps> = ({
  input,
  onAcceptSuggestion,
  onRejectSuggestion,
  currentIngredients,
  className
}) => {
  const [currentSuggestions, setCurrentSuggestions] = useState<IngredientSuggestion[]>([]);
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set());
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<string>>(new Set());
  const [processingCard, setProcessingCard] = useState<string | null>(null);

  useEffect(() => {
    if (!input.trim()) {
      setCurrentSuggestions([]);
      return;
    }

    const searchTerm = input.toLowerCase().trim();
    
    // Get ingredients already in pantry for state checking
    const pantryIngredientNames = new Set(
      currentIngredients.map(ingredient => ingredient.name.toLowerCase())
    );
    
    // Show all matching suggestions regardless of pantry status
    const filtered = commonIngredients.filter(ingredient => 
      ingredient.name.toLowerCase().includes(searchTerm)
    ).slice(0, 6); // Show up to 6 suggestions

    setCurrentSuggestions(filtered);
    
    // Reset rejected and accepted suggestions when input changes
    setRejectedSuggestions(new Set());
    setAcceptedSuggestions(new Set());
  }, [input, currentIngredients]);

  const handleAccept = (suggestion: IngredientSuggestion) => {
    console.log('Accept button clicked for:', suggestion.name);
    setProcessingCard(suggestion.name);
    
    setTimeout(() => {
      setAcceptedSuggestions(prev => new Set([...prev, suggestion.name]));
      onAcceptSuggestion(suggestion);
      setProcessingCard(null);
    }, 300);
  };

  const handleReject = (suggestion: IngredientSuggestion) => {
    console.log('Reject button clicked for:', suggestion.name);
    setProcessingCard(suggestion.name);
    
    setTimeout(() => {
      setRejectedSuggestions(prev => new Set([...prev, suggestion.name]));
      onRejectSuggestion(suggestion);
      setProcessingCard(null);
    }, 300);
  };

  // Only hide when input is empty
  if (!input.trim()) {
    return null;
  }

  // If no suggestions match the search, show a message
  if (currentSuggestions.length === 0) {
    return (
      <div className={cn("mt-4", className)}>
        <div className="text-sm text-gray-500 text-center py-8">
          No ingredient suggestions found for "{input}"
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mt-4", className)}>
      <div className="text-sm text-gray-600 mb-3 text-center font-medium">
        {currentSuggestions.length} suggestion{currentSuggestions.length !== 1 ? 's' : ''} found
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentSuggestions.map((suggestion) => {
          // Check different states
          const isInPantry = currentIngredients.some(
            ingredient => ingredient.name.toLowerCase() === suggestion.name.toLowerCase()
          );
          const isAccepted = acceptedSuggestions.has(suggestion.name);
          const isRejected = rejectedSuggestions.has(suggestion.name);
          
          return (
            <Card
              key={suggestion.name}
              className={cn(
                "relative shadow-lg transition-all duration-300 bg-white border-2 h-64",
                processingCard === suggestion.name && "animate-pulse opacity-50",
                isAccepted && "border-green-300 bg-green-50",
                isRejected && "border-red-300 bg-red-50",
                isInPantry && "border-blue-300 bg-blue-50"
              )}
            >
              <CardContent className="p-4 h-full flex flex-col justify-between">
                <div className="text-center">
                  <div className="mb-3">
                    {isAccepted ? (
                      <Check className="w-6 h-6 mx-auto text-green-600 mb-2" />
                    ) : isRejected ? (
                      <X className="w-6 h-6 mx-auto text-red-600 mb-2" />
                    ) : isInPantry ? (
                      <Package className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                    ) : (
                      <Star className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                    )}
                    <h3 className="text-lg font-bold text-gray-800 capitalize">
                      {suggestion.name}
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge 
                      className={cn("px-2 py-1 text-xs font-medium", getCategoryColor(suggestion.category))}
                    >
                      {suggestion.category}
                    </Badge>
                    
                    <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
                      <div className="text-base font-semibold text-orange-800">
                        {suggestion.defaultQuantity} {suggestion.defaultUnit}
                      </div>
                      <div className="text-xs text-orange-600">Suggested amount</div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Units: {suggestion.commonUnits.slice(0, 3).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-2 mt-3">
                  {isAccepted ? (
                    <div className="flex-1 text-center py-2 text-green-600 font-medium text-sm">
                      ✓ Added to pantry
                    </div>
                  ) : isRejected ? (
                    <div className="flex-1 text-center py-2 text-red-600 font-medium text-sm">
                      ✗ Rejected
                    </div>
                  ) : isInPantry ? (
                    <div className="flex-1 text-center py-2 text-blue-600 font-medium text-sm">
                      📦 Already in pantry
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleReject(suggestion);
                        }}
                        disabled={processingCard === suggestion.name}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Pass
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAccept(suggestion);
                        }}
                        disabled={processingCard === suggestion.name}
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center mt-4">
        <div className="text-xs text-gray-500">
          💡 Tip: Click "Add" to add ingredients to your pantry
        </div>
      </div>
    </div>
  );
};
