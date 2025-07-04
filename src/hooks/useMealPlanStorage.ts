
import { useState, useEffect } from 'react';
import { WeeklyMealPlan, MealPlanHistory } from '@/types/mealPlanner';
import { ShoppingList } from '@/types/shoppingList';

export const useMealPlanStorage = () => {
  const [currentWeekPlan, setCurrentWeekPlan] = useState<WeeklyMealPlan | null>(null);
  const [mealPlanHistory, setMealPlanHistory] = useState<MealPlanHistory[]>([]);
  const [currentShoppingList, setCurrentShoppingList] = useState<ShoppingList | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedCurrentPlan = localStorage.getItem('meal-planner-current');
    const savedHistory = localStorage.getItem('meal-planner-history');
    const savedShoppingList = localStorage.getItem('meal-planner-shopping-list');
    
    if (savedCurrentPlan) {
      setCurrentWeekPlan(JSON.parse(savedCurrentPlan));
    }
    
    if (savedHistory) {
      setMealPlanHistory(JSON.parse(savedHistory));
    }

    if (savedShoppingList) {
      setCurrentShoppingList(JSON.parse(savedShoppingList));
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

  useEffect(() => {
    if (currentShoppingList) {
      localStorage.setItem('meal-planner-shopping-list', JSON.stringify(currentShoppingList));
    } else {
      localStorage.removeItem('meal-planner-shopping-list');
    }
  }, [currentShoppingList]);

  return {
    currentWeekPlan,
    setCurrentWeekPlan,
    mealPlanHistory,
    setMealPlanHistory,
    currentShoppingList,
    setCurrentShoppingList
  };
};
