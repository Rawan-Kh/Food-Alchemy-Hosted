
import React from 'react';
import { Package, ChefHat, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  ingredientsCount: number;
  recipesCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  ingredientsCount,
  recipesCount
}) => {
  const tabs = [
    {
      id: 'ingredients',
      label: 'Pantry',
      icon: Package,
      count: ingredientsCount
    },
    {
      id: 'recipes',
      label: 'Recipes',
      icon: ChefHat,
      count: recipesCount
    },
    {
      id: 'meal-planner',
      label: 'Planner',
      icon: Calendar,
      count: null
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200",
              activeTab === tab.id
                ? "text-orange-600 bg-orange-50"
                : "text-gray-600 hover:text-orange-500 hover:bg-gray-50"
            )}
          >
            <div className="relative">
              <tab.icon className="w-6 h-6" />
              {tab.count !== null && tab.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
