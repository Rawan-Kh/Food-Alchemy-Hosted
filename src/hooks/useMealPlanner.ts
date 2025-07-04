
import { useState, useEffect } from 'react';
import { WeeklyMealPlan, MealPlan, MealPlanHistory, MealType, DAYS_OF_WEEK } from '@/types/mealPlanner';
import { Recipe } from '@/components/RecipeManager';
import { Ingredient } from '@/components/IngredientManager';
import { useToast } from '@/hooks/use-toast';

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getWeekStartDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday = 1
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  
  return monday.toISOString().split('T')[0];
};

export const useMealPlanner = (
  recipes: Recipe[],
  ingredients: Ingredient[],
  onUpdateIngredients: (ingredients: Ingredient[]) => void
) => {
  const [currentWeekPlan, setCurrentWeekPlan] = useState<WeeklyMealPlan | null>(null);
  const [mealPlanHistory, setMealPlanHistory] = useState<MealPlanHistory[]>([]);
  const [originalIngredients, setOriginalIngredients] = useState<Ingredient[]>([]);
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    const savedCurrentPlan = localStorage.getItem('meal-planner-current');
    const savedHistory = localStorage.getItem('meal-planner-history');
    
    if (savedCurrentPlan) {
      setCurrentWeekPlan(JSON.parse(savedCurrentPlan));
    }
    
    if (savedHistory) {
      setMealPlanHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (currentWeekPlan) {
      localStorage.setItem('meal-planner-current', JSON.stringify(currentWeekPlan));
    }
  }, [currentWeekPlan]);

  useEffect(() => {
    localStorage.setItem('meal-planner-history', JSON.stringify(mealPlanHistory));
  }, [mealPlanHistory]);

  const createNewWeekPlan = () => {
    const weekStarting = getWeekStartDate();
    const meals: MealPlan[] = DAYS_OF_WEEK.map(day => ({
      id: generateUniqueId(),
      day
    }));

    const newPlan: WeeklyMealPlan = {
      id: generateUniqueId(),
      weekStarting,
      meals,
      isConsumed: false,
      dateCreated: new Date().toISOString()
    };

    setCurrentWeekPlan(newPlan);
    setOriginalIngredients([...ingredients]);
    return newPlan;
  };

  const assignRecipeToMeal = (day: string, mealType: MealType, recipeId: string) => {
    if (!currentWeekPlan) return;

    const updatedPlan = { ...currentWeekPlan };
    const dayMeal = updatedPlan.meals.find(meal => meal.day === day);
    
    if (dayMeal) {
      dayMeal[mealType] = recipeId;
      setCurrentWeekPlan(updatedPlan);
      updateTemporaryIngredients(updatedPlan);
    }
  };

  const removeRecipeFromMeal = (day: string, mealType: MealType) => {
    if (!currentWeekPlan) return;

    const updatedPlan = { ...currentWeekPlan };
    const dayMeal = updatedPlan.meals.find(meal => meal.day === day);
    
    if (dayMeal) {
      delete dayMeal[mealType];
      setCurrentWeekPlan(updatedPlan);
      updateTemporaryIngredients(updatedPlan);
    }
  };

  const updateTemporaryIngredients = (plan: WeeklyMealPlan) => {
    if (originalIngredients.length === 0) return;

    let tempIngredients = [...originalIngredients];
    const usedRecipeIds: string[] = [];

    // Collect all recipe IDs used in the meal plan
    plan.meals.forEach(meal => {
      [meal.breakfast, meal.snack, meal.lunch, meal.dinner].forEach(recipeId => {
        if (recipeId) usedRecipeIds.push(recipeId);
      });
    });

    // Deduct ingredients for each used recipe
    usedRecipeIds.forEach(recipeId => {
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe) {
        recipe.ingredients.forEach(recipeIngredient => {
          const ingredientIndex = tempIngredients.findIndex(ingredient =>
            ingredient.name.toLowerCase().includes(recipeIngredient.name.toLowerCase()) ||
            recipeIngredient.name.toLowerCase().includes(ingredient.name.toLowerCase())
          );
          
          if (ingredientIndex !== -1) {
            const availableQuantity = tempIngredients[ingredientIndex].quantity;
            const requiredQuantity = recipeIngredient.quantity;
            
            if (availableQuantity >= requiredQuantity) {
              tempIngredients[ingredientIndex] = {
                ...tempIngredients[ingredientIndex],
                quantity: Math.max(0, availableQuantity - requiredQuantity)
              };
            }
          }
        });
      }
    });

    onUpdateIngredients(tempIngredients);
  };

  const consumeMealPlan = () => {
    if (!currentWeekPlan) return;

    // Mark as consumed and add to history
    const consumedPlan = { ...currentWeekPlan, isConsumed: true };
    const historyEntry: MealPlanHistory = {
      id: generateUniqueId(),
      weeklyPlan: consumedPlan,
      dateConsumed: new Date().toISOString()
    };

    setMealPlanHistory(prev => [historyEntry, ...prev]);
    setCurrentWeekPlan(null);
    setOriginalIngredients([]);

    toast({
      title: "Meal plan consumed!",
      description: "The ingredients have been permanently used and the plan is now in history.",
    });
  };

  const cancelMealPlan = () => {
    if (!currentWeekPlan) return;

    // Restore original ingredients
    if (originalIngredients.length > 0) {
      onUpdateIngredients(originalIngredients);
    }

    setCurrentWeekPlan(null);
    setOriginalIngredients([]);

    toast({
      title: "Meal plan cancelled",
      description: "Ingredients have been restored to their original quantities.",
    });
  };

  const getRecipeById = (id: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === id);
  };

  return {
    currentWeekPlan,
    mealPlanHistory,
    createNewWeekPlan,
    assignRecipeToMeal,
    removeRecipeFromMeal,
    consumeMealPlan,
    cancelMealPlan,
    getRecipeById
  };
};
