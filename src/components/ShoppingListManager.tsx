
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Check, Calendar } from 'lucide-react';
import { ShoppingList, ShoppingListItem } from '@/types/shoppingList';
import { useToast } from '@/hooks/use-toast';

interface ShoppingListManagerProps {
  shoppingList: ShoppingList | null;
  onToggleItem: (itemId: string) => void;
  onAddToPantry: (item: ShoppingListItem, quantity: number) => void;
  onCompleteShoppingList: () => void;
}

export const ShoppingListManager: React.FC<ShoppingListManagerProps> = ({
  shoppingList,
  onToggleItem,
  onAddToPantry,
  onCompleteShoppingList
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { toast } = useToast();

  if (!shoppingList) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Shopping List</h3>
          <p className="text-gray-500 mb-4">
            Create a weekly meal plan and generate a shopping list to see missing ingredients here.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Go to Meal Planner → Generate Shopping List</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalItems = shoppingList.items.length;
  const checkedItems = shoppingList.items.filter(item => item.isChecked).length;
  const completionPercentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  const handleAddToPantry = (item: ShoppingListItem) => {
    const quantity = quantities[item.id] || item.missingQuantity;
    onAddToPantry(item, quantity);
    toast({
      title: "Added to pantry!",
      description: `${quantity} ${item.unit} of ${item.ingredientName} added to your pantry`
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: quantity
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="w-5 h-5" />
            Shopping List
            {totalItems > 0 && <span className="text-sm text-gray-500">({totalItems} items)</span>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {completionPercentage}% complete
            </Badge>
            {completionPercentage === 100 && (
              <Button onClick={onCompleteShoppingList} size="sm" className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-2" />
                Complete Shopping
              </Button>
            )}
          </div>
        </div>
        {totalItems > 0 && (
          <p className="text-sm text-gray-600">
            Based on your weekly meal plan • Check off items as you shop
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shoppingList.items.map(item => (
            <div 
              key={item.id} 
              className={`border rounded-lg p-4 space-y-3 transition-colors ${
                item.isChecked ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between flex-wrap">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={item.isChecked} 
                    onCheckedChange={() => onToggleItem(item.id)} 
                    className="mt-1" 
                  />
                  <div className="space-y-1">
                    <h4 className={`font-medium capitalize ${
                      item.isChecked ? 'line-through text-gray-500' : ''
                    }`}>
                      {item.ingredientName}
                    </h4>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-red-600">
                        Need: {item.missingQuantity} {item.unit}
                      </span>
                      {item.availableQuantity > 0 && (
                        <span className="ml-2 text-green-600">
                          (Have: {item.availableQuantity} {item.unit})
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.recipeNames.map((recipeName, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {recipeName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3 md:mt-0">
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.1" 
                      value={quantities[item.id] || item.missingQuantity} 
                      onChange={(e) => handleQuantityChange(item.id, parseFloat(e.target.value) || 0)} 
                      className="w-20 text-center" 
                      placeholder="Qty"
                      disabled={item.isChecked}
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToPantry(item)} 
                      disabled={item.isChecked} 
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add to Pantry
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {shoppingList.items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Check className="w-12 h-12 mx-auto text-green-400 mb-4" />
              <p className="font-medium">All ingredients are available!</p>
              <p className="text-sm">Your pantry has everything needed for your meal plan.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
