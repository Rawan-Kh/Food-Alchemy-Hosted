
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IngredientSuggestion {
  name: string;
  category: string;
  commonUnits: string[];
  defaultQuantity: number;
  defaultUnit: string;
}

interface TinderStyleSuggestionsProps {
  input: string;
  onAcceptSuggestion: (suggestion: IngredientSuggestion) => void;
  onRejectSuggestion: (suggestion: IngredientSuggestion) => void;
  currentIngredients?: Array<{ name: string; [key: string]: any }>;
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
  currentIngredients = [],
  className
}) => {
  const [currentSuggestions, setCurrentSuggestions] = useState<IngredientSuggestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set());
  const cardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);

  useEffect(() => {
    if (!input.trim()) {
      setCurrentSuggestions([]);
      setCurrentIndex(0);
      // Reset rejected suggestions when input is cleared
      setRejectedSuggestions(new Set());
      return;
    }

    const searchTerm = input.toLowerCase().trim();
    
    // Get current ingredient names for filtering
    const currentIngredientNames = currentIngredients.map(ing => ing.name.toLowerCase());
    
    const filtered = commonIngredients.filter(ingredient => {
      const ingredientName = ingredient.name.toLowerCase();
      // Check if ingredient matches search term
      const matchesSearch = ingredientName.includes(searchTerm);
      // Check if ingredient is not already in pantry
      const notInPantry = !currentIngredientNames.some(pantryName => 
        pantryName.includes(ingredientName) || ingredientName.includes(pantryName)
      );
      // Check if ingredient hasn't been rejected in this session
      const notRejected = !rejectedSuggestions.has(ingredient.name);
      
      return matchesSearch && notInPantry && notRejected;
    }).slice(0, 5); // Limit to 5 suggestions for the stack

    setCurrentSuggestions(filtered);
    setCurrentIndex(0);
  }, [input, rejectedSuggestions, currentIngredients]);

  const handleAccept = (suggestion: IngredientSuggestion) => {
    setSwipeDirection('right');
    setIsAnimating(true);
    
    setTimeout(() => {
      onAcceptSuggestion(suggestion);
      moveToNext();
    }, 300);
  };

  const handleReject = (suggestion: IngredientSuggestion) => {
    setSwipeDirection('left');
    setIsAnimating(true);
    
    setTimeout(() => {
      setRejectedSuggestions(prev => new Set([...prev, suggestion.name]));
      onRejectSuggestion(suggestion);
      moveToNext();
    }, 300);
  };

  const moveToNext = () => {
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 100);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!cardRef.current || isAnimating) return;
    
    currentXRef.current = e.touches[0].clientX;
    const deltaX = currentXRef.current - startXRef.current;
    
    cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
    cardRef.current.style.opacity = String(1 - Math.abs(deltaX) / 300);
  };

  const handleTouchEnd = () => {
    if (!cardRef.current || isAnimating) return;
    
    const deltaX = currentXRef.current - startXRef.current;
    const threshold = 100;
    
    if (Math.abs(deltaX) > threshold && currentSuggestions[currentIndex]) {
      if (deltaX > 0) {
        handleAccept(currentSuggestions[currentIndex]);
      } else {
        handleReject(currentSuggestions[currentIndex]);
      }
    } else {
      // Reset position
      cardRef.current.style.transform = 'translateX(0px) rotate(0deg)';
      cardRef.current.style.opacity = '1';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.current || isAnimating) return;
    
    currentXRef.current = e.clientX;
    const deltaX = currentXRef.current - startXRef.current;
    
    cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
    cardRef.current.style.opacity = String(1 - Math.abs(deltaX) / 300);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    if (!cardRef.current || isAnimating) return;
    
    const deltaX = currentXRef.current - startXRef.current;
    const threshold = 100;
    
    if (Math.abs(deltaX) > threshold && currentSuggestions[currentIndex]) {
      if (deltaX > 0) {
        handleAccept(currentSuggestions[currentIndex]);
      } else {
        handleReject(currentSuggestions[currentIndex]);
      }
    } else {
      // Reset position
      cardRef.current.style.transform = 'translateX(0px) rotate(0deg)';
      cardRef.current.style.opacity = '1';
    }
  };

  if (currentSuggestions.length === 0 || currentIndex >= currentSuggestions.length) {
    return null;
  }

  const currentSuggestion = currentSuggestions[currentIndex];
  const remainingCount = currentSuggestions.length - currentIndex;

  return (
    <div className={cn("mt-4", className)}>
      <div className="text-sm text-gray-600 mb-3 text-center font-medium">
        Swipe or tap to choose • {remainingCount} suggestion{remainingCount !== 1 ? 's' : ''} remaining
      </div>
      
      <div className="relative h-80 flex items-center justify-center overflow-hidden">
        {/* Stack of cards in background */}
        {currentSuggestions.slice(currentIndex + 1, currentIndex + 3).map((suggestion, index) => (
          <Card
            key={`${suggestion.name}-${currentIndex + index + 1}`}
            className={cn(
              "absolute w-72 h-64 shadow-lg transition-all duration-200",
              index === 0 ? "scale-95 -rotate-1 z-10" : "scale-90 rotate-1 z-0"
            )}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }}
          />
        ))}
        
        {/* Main card */}
        <Card
          ref={cardRef}
          className={cn(
            "relative w-72 h-64 shadow-xl cursor-grab active:cursor-grabbing transition-all duration-300 z-20 bg-white border-2",
            isAnimating && swipeDirection === 'right' && "animate-pulse border-green-400",
            isAnimating && swipeDirection === 'left' && "animate-pulse border-red-400"
          )}
          style={{
            transform: isAnimating 
              ? swipeDirection === 'right' 
                ? 'translateX(400px) rotate(20deg)' 
                : 'translateX(-400px) rotate(-20deg)'
              : 'translateX(0px) rotate(0deg)',
            opacity: isAnimating ? 0 : 1,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="text-center">
              <div className="mb-4">
                <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <h3 className="text-2xl font-bold text-gray-800 capitalize">
                  {currentSuggestion.name}
                </h3>
              </div>
              
              <div className="space-y-3">
                <Badge 
                  className={cn("px-3 py-1 text-sm font-medium", getCategoryColor(currentSuggestion.category))}
                >
                  {currentSuggestion.category}
                </Badge>
                
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <div className="text-lg font-semibold text-orange-800">
                    {currentSuggestion.defaultQuantity} {currentSuggestion.defaultUnit}
                  </div>
                  <div className="text-sm text-orange-600">Suggested amount</div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Common units: {currentSuggestion.commonUnits.join(', ')}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                onClick={() => handleReject(currentSuggestion)}
                disabled={isAnimating}
              >
                <X className="w-5 h-5 mr-2" />
                Pass
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleAccept(currentSuggestion)}
                disabled={isAnimating}
              >
                <Heart className="w-5 h-5 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center mt-4">
        <div className="text-xs text-gray-500">
          💡 Tip: Swipe right to add, swipe left to pass
        </div>
      </div>
    </div>
  );
};
