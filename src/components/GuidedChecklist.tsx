
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, X, ChevronRight, Lightbulb, ChevronDown } from 'lucide-react';
import { Recipe } from './RecipeManager';
import { Ingredient } from './CategorizedIngredientManager';
import { WeeklyMealPlan } from '@/types/mealPlanner';
import { ShoppingList } from '@/types/shoppingList';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  targetTab?: string;
}

interface GuidedChecklistProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  currentWeekPlan: WeeklyMealPlan | null;
  shoppingList: ShoppingList | null;
  onNavigateToTab: (tab: string) => void;
}

export const GuidedChecklist: React.FC<GuidedChecklistProps> = ({
  recipes,
  ingredients,
  currentWeekPlan,
  shoppingList,
  onNavigateToTab
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const checklistItems: ChecklistItem[] = [
    {
      id: 'search-recipe',
      title: 'Find Your First Recipe',
      description: 'Search and add your first recipe to get started',
      isCompleted: recipes.length > 0,
      targetTab: 'recipes'
    },
    {
      id: 'add-pantry',
      title: 'Stock Your Pantry',
      description: 'Add ingredients you have at home',
      isCompleted: ingredients.length > 0,
      targetTab: 'ingredients'
    },
    {
      id: 'create-plan',
      title: 'Create Weekly Plan',
      description: 'Plan your meals for the week',
      isCompleted: !!currentWeekPlan,
      targetTab: 'meal-planner'
    },
    {
      id: 'shopping-list',
      title: 'Generate Shopping List',
      description: 'Create a shopping list from your meal plan',
      isCompleted: !!shoppingList,
      targetTab: 'shopping'
    }
  ];

  const completedItems = checklistItems.filter(item => item.isCompleted).length;
  const totalItems = checklistItems.length;
  const progressPercentage = (completedItems / totalItems) * 100;
  const isAllCompleted = completedItems === totalItems;

  // Show checklist on first visit, but hide permanently once all items are completed
  useEffect(() => {
    const hasSeenChecklist = localStorage.getItem('recipe-app-checklist-seen');
    const hasCompletedAll = localStorage.getItem('recipe-app-checklist-completed');
    
    if (!hasCompletedAll && (!hasSeenChecklist || !isAllCompleted)) {
      setIsVisible(true);
    }
    
    // Mark as completed permanently when all items are done
    if (isAllCompleted && !hasCompletedAll) {
      localStorage.setItem('recipe-app-checklist-completed', 'true');
      // Auto-hide after 3 seconds when completed
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }
  }, [isAllCompleted]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('recipe-app-checklist-seen', 'true');
  };

  const handleItemClick = (item: ChecklistItem) => {
    if (item.targetTab && !item.isCompleted) {
      onNavigateToTab(item.targetTab);
    }
  };

  if (!isVisible) {
    // Don't show the guide button if all items are completed
    const hasCompletedAll = localStorage.getItem('recipe-app-checklist-completed');
    if (hasCompletedAll) return null;
    
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 z-40 bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-300"
      >
        <Lightbulb className="w-4 h-4 mr-1" />
        Guide
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-20 right-4 w-80 z-50 shadow-lg border-orange-200">
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="w-4 h-4 text-orange-600" />
              Getting Started
            </CardTitle>
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <CollapsibleContent>
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-gray-600">
                {completedItems} of {totalItems} steps completed
              </p>
            </div>
          </CollapsibleContent>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {checklistItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    item.isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer'
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {item.isCompleted ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${item.isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                      {item.title}
                    </h4>
                    <p className={`text-xs ${item.isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                    {item.isCompleted && (
                      <Badge variant="secondary" className="mt-1 text-xs bg-green-100 text-green-700">
                        Completed
                      </Badge>
                    )}
                  </div>
                  {!item.isCompleted && (
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
            
            {isAllCompleted && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800">Great job!</p>
                <p className="text-xs text-green-600">You've completed all the basic steps.</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
