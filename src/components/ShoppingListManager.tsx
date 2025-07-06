import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Check } from 'lucide-react';
import { ShoppingList, ShoppingListItem } from '@/types/shoppingList';
import { Ingredient } from '@/components/CategorizedIngredientManager';
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
  const {
    toast
  } = useToast();
  if (!shoppingList) {
    return <Card>
        <CardContent className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Shopping List</h3>
          <p className="text-gray-500">
            Create a meal plan to generate a shopping list for missing ingredients.
          </p>
        </CardContent>
      </Card>;
  }
  ;
  const totalItems = shoppingList.items.length;
  const checkedItems = shoppingList.items.filter(item => item.isChecked).length;
  const completionPercentage = totalItems > 0 ? Math.round(checkedItems / totalItems * 100) : 0;
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
  return <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="w-5 h-5" />
            Shopping List ({totalItems} items)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {completionPercentage}% complete
            </Badge>
            {completionPercentage === 100 && <Button onClick={onCompleteShoppingList} size="sm">
                <Check className="w-4 h-4 mr-2" />
                Complete List
              </Button>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {shoppingList.items.map(item => <div key={item.id} className={`border rounded-lg p-4 space-y-3 ${item.isChecked ? 'bg-green-50 border-green-200' : ''}`}>
              <div className="flex items-start justify-between flex-wrap ">
                <div className="flex items-start gap-3">
                  <Checkbox checked={item.isChecked} onCheckedChange={() => onToggleItem(item.id)} className="mt-1" />
                  <div className="space-y-1">
                    <h4 className={`font-medium capitalize ${item.isChecked ? 'line-through text-gray-500' : ''}`}>
                      {item.ingredientName}
                    </h4>
                    <div className="text-sm text-gray-600 ">
                      Need: {item.missingQuantity} {item.unit}
                      {item.availableQuantity > 0 && <span className="ml-2 text-green-600">
                          (Have: {item.availableQuantity} {item.unit})
                        </span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.recipeNames.map((recipeName, index) => <Badge key={index} variant="outline" className="text-xs">
                          {recipeName}
                        </Badge>)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-5">
                  <Input type="number" min="0" step="0.1" value={quantities[item.id] || item.missingQuantity} onChange={e => handleQuantityChange(item.id, parseFloat(e.target.value) || 0)} className="w-20" placeholder="Qty" />
                  <Button size="sm" onClick={() => handleAddToPantry(item)} disabled={item.isChecked} variant="outline">
                    <Plus className="w-3 h-3 mr-1" />
                    Add to Pantry
                  </Button>
                </div>
              </div>
            </div>)}
          
          {shoppingList.items.length === 0 && <div className="text-center py-8 text-gray-500">
              <Check className="w-12 h-12 mx-auto text-green-400 mb-4" />
              <p>All ingredients are available in your pantry!</p>
            </div>}
        </div>
      </CardContent>
    </Card>;
};