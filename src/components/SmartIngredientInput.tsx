import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TinderStyleSuggestions } from './TinderStyleSuggestions';
import { IngredientEditor, PendingIngredient } from './IngredientEditor';
import { VoiceInput } from './VoiceInput';
import { Plus, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParsedIngredient {
  name: string;
  quantity?: number;
  unit?: string;
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

interface SmartIngredientInputProps {
  onAddIngredients: (ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    expiryDate: string;
    category: string;
  }>) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  currentIngredients: Ingredient[];
}

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const SmartIngredientInput: React.FC<SmartIngredientInputProps> = ({
  onAddIngredients,
  isListening,
  setIsListening,
  currentIngredients
}) => {
  const [textInput, setTextInput] = useState('');
  const [pendingIngredients, setPendingIngredients] = useState<PendingIngredient[]>([]);
  const { toast } = useToast();

  const parseIngredientsFromText = (text: string): ParsedIngredient[] => {
    const ingredientStrings = text
      .split(/[,;]+/)
      .map(str => str.trim())
      .filter(str => str.length > 0);

    return ingredientStrings.map(ingredientStr => {
      // Try to match patterns like "2 cups flour", "3 tomatoes", "1 kg chicken"
      const quantityUnitMatch = ingredientStr.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+(.+)$/);
      if (quantityUnitMatch) {
        const [, quantity, unit, name] = quantityUnitMatch;
        return {
          name: name.trim().toLowerCase(),
          quantity: parseFloat(quantity),
          unit: unit.toLowerCase()
        };
      }

      // Try to match patterns like "3 tomatoes" (quantity + ingredient)
      const quantityMatch = ingredientStr.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
      if (quantityMatch) {
        const [, quantity, name] = quantityMatch;
        return {
          name: name.trim().toLowerCase(),
          quantity: parseFloat(quantity)
        };
      }

      // Just the ingredient name
      return {
        name: ingredientStr.toLowerCase()
      };
    });
  };

  const addPendingIngredient = (
    name: string,
    quantity: number = 1,
    unit: string = 'pcs',
    category: string = 'other'
  ) => {
    const newIngredient: PendingIngredient = {
      id: generateUniqueId(),
      name,
      quantity,
      unit,
      category
    };
    setPendingIngredients(prev => [...prev, newIngredient]);
  };

  const handleTextInputSubmit = () => {
    if (!textInput.trim()) return;

    const parsed = parseIngredientsFromText(textInput);
    parsed.forEach(ingredient => {
      addPendingIngredient(
        ingredient.name,
        ingredient.quantity || 1,
        ingredient.unit || 'pcs',
        'other' // Default category for manually typed ingredients
      );
    });

    setTextInput('');
    toast({
      title: "Ingredients added for review",
      description: `Added ${parsed.length} ingredient(s) to review queue`,
    });
  };

  const handleAcceptSuggestion = (suggestion: any) => {
    // Add directly to pantry instead of pending queue
    const ingredientToAdd = {
      name: suggestion.name,
      quantity: suggestion.defaultQuantity,
      unit: suggestion.defaultUnit,
      expiryDate: '',
      category: suggestion.category
    };
    
    onAddIngredients([ingredientToAdd]);
    setTextInput('');
    toast({
      title: "Added to pantry!",
      description: `${suggestion.name} has been added to your pantry`,
    });
  };

  const handleRejectSuggestion = (suggestion: any) => {
    toast({
      title: "Suggestion rejected",
      description: `${suggestion.name} will not be suggested again`,
    });
  };

  const handleVoiceIngredientsDetected = (detectedIngredients: ParsedIngredient[]) => {
    detectedIngredients.forEach(ingredient => {
      addPendingIngredient(
        ingredient.name,
        ingredient.quantity || 1,
        ingredient.unit || 'pcs',
        'other' // Default category for voice-detected ingredients
      );
    });
    toast({
      title: "Voice ingredients detected",
      description: `Added ${detectedIngredients.length} ingredient(s) for review`,
    });
  };

  const handleUpdatePendingIngredient = (id: string, updates: Partial<PendingIngredient>) => {
    setPendingIngredients(prev =>
      prev.map(ingredient =>
        ingredient.id === id ? { ...ingredient, ...updates } : ingredient
      )
    );
  };

  const handleRemovePendingIngredient = (id: string) => {
    setPendingIngredients(prev => prev.filter(ingredient => ingredient.id !== id));
  };

  const handleConfirmAllIngredients = () => {
    const ingredientsToAdd = pendingIngredients.map(ingredient => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      expiryDate: ingredient.expiryDate || '',
      category: ingredient.category || 'other'
    }));

    onAddIngredients(ingredientsToAdd);
    setPendingIngredients([]);
    
    toast({
      title: "Ingredients added!",
      description: `Added ${ingredientsToAdd.length} ingredient(s) to your pantry`,
    });
  };

  const handleClearAllIngredients = () => {
    setPendingIngredients([]);
    toast({
      title: "Queue cleared",
      description: "All pending ingredients have been removed",
    });
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-600" />
            Smart Ingredient Input
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <Input
                  placeholder="Type ingredients (e.g., '2 cups flour, 3 tomatoes, 1 kg chicken')"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTextInputSubmit()}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleTextInputSubmit} 
                  disabled={!textInput.trim()}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add to Queue
                </Button>
                <VoiceInput
                  onIngredientsDetected={handleVoiceIngredientsDetected}
                  isListening={isListening}
                  setIsListening={setIsListening}
                />
              </div>
            </div>

            <TinderStyleSuggestions
              input={textInput}
              onAcceptSuggestion={handleAcceptSuggestion}
              onRejectSuggestion={handleRejectSuggestion}
              currentIngredients={currentIngredients}
            />
          </div>
        </CardContent>
      </Card>

      <IngredientEditor
        ingredients={pendingIngredients}
        onUpdateIngredient={handleUpdatePendingIngredient}
        onRemoveIngredient={handleRemovePendingIngredient}
        onConfirmAll={handleConfirmAllIngredients}
        onClearAll={handleClearAllIngredients}
      />
    </div>
  );
};
