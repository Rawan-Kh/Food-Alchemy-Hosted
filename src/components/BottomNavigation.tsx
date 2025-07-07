
import React from 'react';
import { Package, ChefHat, Calendar, Home, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShoppingList } from '@/types/shoppingList';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  ingredientsCount: number;
  recipesCount: number;
  shoppingList: ShoppingList | null;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  ingredientsCount,
  recipesCount,
  shoppingList
}) => {
  const hasNewShoppingItems = shoppingList && shoppingList.items.length > 0;
  const uncheckedItemsCount = shoppingList ? shoppingList.items.filter(item => !item.isChecked).length : 0;

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      count: null
    },
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
    },
    {
      id: 'shopping',
      label: 'Shopping',
      icon: ShoppingCart,
      count: uncheckedItemsCount > 0 ? uncheckedItemsCount : null,
      hasIndicator: hasNewShoppingItems
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-all duration-200 min-w-0 flex-1",
              activeTab === tab.id
                ? "text-orange-600 bg-orange-50"
                : "text-gray-600 hover:text-orange-500 hover:bg-gray-50"
            )}
          >
            <div className="relative">
              <tab.icon className="w-5 h-5" />
              {tab.count !== null && tab.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
              {tab.hasIndicator && !tab.count && (
                <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
              )}
            </div>
            <span className="text-xs font-medium truncate max-w-full">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
