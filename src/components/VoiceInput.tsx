import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface ParsedIngredient {
  name: string;
  quantity?: number;
  unit?: string;
}

interface VoiceInputProps {
  onIngredientsDetected: (ingredients: ParsedIngredient[]) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onIngredientsDetected,
  isListening,
  setIsListening
}) => {
  const { toast } = useToast();
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const speechRecognition = new SpeechRecognition();
      
      speechRecognition.continuous = true;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'en-US';

      speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log('Voice input received:', transcript);
        
        // Parse ingredients with quantity and unit from transcript
        const ingredients = parseIngredientsFromText(transcript);
        if (ingredients.length > 0) {
          onIngredientsDetected(ingredients);
          const ingredientNames = ingredients.map(ing => 
            `${ing.quantity || ''} ${ing.unit || ''} ${ing.name}`.trim()
          );
          toast({
            title: "Ingredients detected!",
            description: `Found: ${ingredientNames.join(', ')}`,
          });
        }
      };

      speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice recognition error",
          description: "Please try again",
          variant: "destructive",
        });
      };

      speechRecognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(speechRecognition);
    }
  }, [onIngredientsDetected, setIsListening, toast]);

  const parseIngredientsFromText = (text: string): ParsedIngredient[] => {
    const commonIngredients = [
      'tomato', 'tomatoes', 'onion', 'onions', 'garlic', 'chicken', 'beef', 'pork',
      'rice', 'pasta', 'cheese', 'milk', 'eggs', 'bread', 'flour', 'sugar',
      'salt', 'pepper', 'oil', 'butter', 'potato', 'potatoes', 'carrot', 'carrots',
      'bell pepper', 'mushroom', 'mushrooms', 'spinach', 'lettuce', 'cucumber',
      'lemon', 'lime', 'apple', 'banana', 'orange', 'fish', 'salmon', 'tuna'
    ];

    const units = [
      'cups?', 'cup', 'tablespoons?', 'tbsp', 'teaspoons?', 'tsp', 'pounds?', 'lbs?', 'lb',
      'ounces?', 'oz', 'grams?', 'g', 'kilograms?', 'kg', 'liters?', 'l', 'milliliters?', 'ml',
      'pieces?', 'pcs?', 'cloves?', 'slices?', 'cans?', 'bottles?', 'bags?'
    ];

    // Regex to match patterns like "2 cups flour", "3 tomatoes", "1 pound chicken"
    const ingredientPattern = new RegExp(
      `(\\d+(?:\\.\\d+)?|\\w+)\\s+(${units.join('|')})\\s+(\\w+(?:\\s+\\w+)*)`,
      'gi'
    );

    const foundIngredients: ParsedIngredient[] = [];
    const processedIngredients = new Set<string>();

    // First, try to match quantity + unit + ingredient patterns
    let match;
    while ((match = ingredientPattern.exec(text)) !== null) {
      const [, quantityStr, unit, ingredientName] = match;
      const quantity = parseFloat(quantityStr) || 1;
      const normalizedIngredient = ingredientName.toLowerCase().trim();
      
      if (!processedIngredients.has(normalizedIngredient)) {
        foundIngredients.push({
          name: normalizedIngredient,
          quantity: quantity,
          unit: unit.toLowerCase().replace(/s$/, '') // Remove plural 's'
        });
        processedIngredients.add(normalizedIngredient);
      }
    }

    // Then, try to match just quantity + ingredient (without unit)
    const quantityPattern = new RegExp(`(\\d+(?:\\.\\d+)?)\\s+(\\w+(?:\\s+\\w+)*)`, 'gi');
    let quantityMatch;
    while ((quantityMatch = quantityPattern.exec(text)) !== null) {
      const [, quantityStr, ingredientName] = quantityMatch;
      const quantity = parseFloat(quantityStr);
      const normalizedIngredient = ingredientName.toLowerCase().trim();
      
      if (!processedIngredients.has(normalizedIngredient) && 
          commonIngredients.some(common => 
            normalizedIngredient.includes(common) || common.includes(normalizedIngredient)
          )) {
        foundIngredients.push({
          name: normalizedIngredient,
          quantity: quantity
        });
        processedIngredients.add(normalizedIngredient);
      }
    }

    // Finally, match standalone ingredients without quantity/unit
    commonIngredients.forEach(ingredient => {
      const normalizedIngredient = ingredient.toLowerCase();
      if (text.toLowerCase().includes(ingredient) && !processedIngredients.has(normalizedIngredient)) {
        foundIngredients.push({
          name: ingredient
        });
        processedIngredients.add(normalizedIngredient);
      }
    });

    return foundIngredients;
  };

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Voice recognition not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Say ingredients with quantity and unit (e.g., '2 cups flour, 3 tomatoes')",
      });
    }
  };

  return (
    <Button
      onClick={toggleListening}
      variant={isListening ? "destructive" : "default"}
      size="lg"
      className={`transition-all duration-300 ${
        isListening 
          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
          : 'bg-green-600 hover:bg-green-700'
      }`}
    >
      {isListening ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
      {isListening ? 'Stop Listening' : 'Start Voice Input'}
    </Button>
  );
};
