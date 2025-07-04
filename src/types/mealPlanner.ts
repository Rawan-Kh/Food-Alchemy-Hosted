
export interface MealPlan {
  id: string;
  day: string;
  breakfast?: string; // recipe id
  snack?: string; // recipe id
  lunch?: string; // recipe id
  dinner?: string; // recipe id
}

export interface WeeklyMealPlan {
  id: string;
  weekStarting: string; // ISO date string
  meals: MealPlan[];
  isConsumed: boolean;
  dateCreated: string;
}

export interface MealPlanHistory {
  id: string;
  weeklyPlan: WeeklyMealPlan;
  dateConsumed: string;
}

export type MealType = 'breakfast' | 'snack' | 'lunch' | 'dinner';

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];
