
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onIngredientsDetected: (ingredients: string[]) => void;
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

      speechRecognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log('Voice input received:', transcript);
        
        // Parse ingredients from transcript
        const ingredients = parseIngredientsFromText(transcript);
        if (ingredients.length > 0) {
          onIngredientsDetected(ingredients);
          toast({
            title: "Ingredients detected!",
            description: `Found: ${ingredients.join(', ')}`,
          });
        }
      };

      speechRecognition.onerror = (event) => {
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

  const parseIngredientsFromText = (text: string): string[] => {
    // Simple ingredient parsing - look for common food words
    const commonIngredients = [
      'tomato', 'tomatoes', 'onion', 'onions', 'garlic', 'chicken', 'beef', 'pork',
      'rice', 'pasta', 'cheese', 'milk', 'eggs', 'bread', 'flour', 'sugar',
      'salt', 'pepper', 'oil', 'butter', 'potato', 'potatoes', 'carrot', 'carrots',
      'bell pepper', 'mushroom', 'mushrooms', 'spinach', 'lettuce', 'cucumber',
      'lemon', 'lime', 'apple', 'banana', 'orange', 'fish', 'salmon', 'tuna'
    ];

    const words = text.toLowerCase().split(/[\s,]+/);
    const foundIngredients: string[] = [];

    commonIngredients.forEach(ingredient => {
      if (text.toLowerCase().includes(ingredient)) {
        foundIngredients.push(ingredient);
      }
    });

    return [...new Set(foundIngredients)]; // Remove duplicates
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
        description: "Speak your ingredients now",
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
