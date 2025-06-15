
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash, Plus, Calendar, Package, Utensils, Coffee, Cookie, Carrot, Beef, Milk } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate: string;
  dateAdded: string;
}

interface CategorizedIngredientManagerProps {
  ingredients: Ingredient[];
  onAddIngredient: (ingredient: Omit<Ingredient, 'id' | 'dateAdded'>) => void;
  onRemoveIngredient: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
}

const categories = [
  { id: 'vegetables', name: 'Vegetables', icon: Carrot, color: 'bg-green-500' },
  { id: 'fruits', name: 'Fruits', icon: Package, color: 'bg-orange-500' },
  { id: 'meat', name: 'Meat & Fish', icon: Beef, color: 'bg-red-500' },
  { id: 'dairy', name: 'Dairy', icon: Milk, color: 'bg-blue-500' },
  { id: 'grains', name: 'Grains & Pasta', icon: Package, color: 'bg-yellow-500' },
  { id: 'spices', name: 'Spices & Herbs', icon: Cookie, color: 'bg-purple-500' },
  { id: 'beverages', name: 'Beverages', icon: Coffee, color: 'bg-indigo-500' },
  { id: 'pantry', name: 'Pantry Items', icon: Package, color: 'bg-gray-500' },
  { id: 'other', name: 'Other', icon: Utensils, color: 'bg-slate-500' }
];

export const CategorizedIngredientManager: React.FC<CategorizedIngredientManagerProps> = ({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateQuantity
}) => {
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: 1,
    unit: 'pcs',
    category: 'other',
    expiryDate: ''
  });
  const [activeTab, setActiveTab] = useState('vegetables');
  const { toast } = useToast();

  const handleAddIngredient = () => {
    if (!newIngredient.name.trim()) {
      toast({
        title: "Missing ingredient name",
        description: "Please enter an ingredient name",
        variant: "destructive",
      });
      return;
    }

    onAddIngredient(newIngredient);
    setNewIngredient({ name: '', quantity: 1, unit: 'pcs', category: 'other', expiryDate: '' });
    toast({
      title: "Ingredient added!",
      description: `${newIngredient.name} has been added to your ${categories.find(c => c.id === newIngredient.category)?.name} inventory`,
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryBadgeColor = (daysUntilExpiry: number | null) => {
    if (daysUntilExpiry === null) return 'secondary';
    if (daysUntilExpiry < 0) return 'destructive';
    if (daysUntilExpiry <= 3) return 'destructive';
    if (daysUntilExpiry <= 7) return 'default';
    return 'secondary';
  };

  const getIngredientsByCategory = (categoryId: string) => {
    return ingredients.filter(ingredient => ingredient.category === categoryId);
  };

  const getCategoryCount = (categoryId: string) => {
    return getIngredientsByCategory(categoryId).length;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Ingredient
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="name">Ingredient</Label>
              <Input
                id="name"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                placeholder="e.g., Tomatoes"
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.1"
                value={newIngredient.quantity}
                onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <select
                id="unit"
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="pcs">pieces</option>
                <option value="kg">kg</option>
                <option value="g">grams</option>
                <option value="l">liters</option>
                <option value="ml">ml</option>
                <option value="cups">cups</option>
                <option value="tbsp">tablespoons</option>
                <option value="tsp">teaspoons</option>
              </select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={newIngredient.category}
                onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="date"
                value={newIngredient.expiryDate}
                onChange={(e) => setNewIngredient({ ...newIngredient, expiryDate: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleAddIngredient} className="mt-4 w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Ingredient
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Pantry ({ingredients.length} items)</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 lg:grid-cols-9 mb-6">
              {categories.map((category) => {
                const Icon = category.icon;
                const count = getCategoryCount(category.id);
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex flex-col items-center gap-1 p-2 text-xs"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                    {count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map((category) => {
              const categoryIngredients = getIngredientsByCategory(category.id);
              const Icon = category.icon;
              
              return (
                <TabsContent key={category.id} value={category.id}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      <Badge variant="outline">{categoryIngredients.length} items</Badge>
                    </div>
                    
                    {categoryIngredients.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Icon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No {category.name.toLowerCase()} in your pantry yet.</p>
                        <p className="text-sm">Add some using the form above!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryIngredients.map((ingredient) => {
                          const daysUntilExpiry = getDaysUntilExpiry(ingredient.expiryDate);
                          return (
                            <div key={`ingredient-${ingredient.id}`} className="border rounded-lg p-4 space-y-2">
                              <div className="flex justify-between items-start">
                                <h4 className="font-semibold capitalize">{ingredient.name}</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRemoveIngredient(ingredient.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={ingredient.quantity}
                                  onChange={(e) => onUpdateQuantity(ingredient.id, parseFloat(e.target.value) || 0)}
                                  className="w-20"
                                />
                                <span className="text-sm text-gray-600">{ingredient.unit}</span>
                              </div>

                              {ingredient.expiryDate && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <Badge variant={getExpiryBadgeColor(daysUntilExpiry)}>
                                    {daysUntilExpiry !== null && daysUntilExpiry < 0
                                      ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                                      : daysUntilExpiry !== null && daysUntilExpiry === 0
                                      ? 'Expires today'
                                      : daysUntilExpiry !== null && daysUntilExpiry === 1
                                      ? 'Expires tomorrow'
                                      : daysUntilExpiry !== null
                                      ? `${daysUntilExpiry} days left`
                                      : 'No expiry set'
                                    }
                                  </Badge>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
