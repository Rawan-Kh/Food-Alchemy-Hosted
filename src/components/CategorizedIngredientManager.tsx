import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash, Plus, Calendar, Edit2 } from 'lucide-react';
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
const CATEGORIES = [{
  id: 'vegetables',
  name: 'Vegetables',
  icon: '🥕'
}, {
  id: 'fruits',
  name: 'Fruits',
  icon: '🍎'
}, {
  id: 'meat',
  name: 'Meat & Fish',
  icon: '🥩'
}, {
  id: 'dairy',
  name: 'Dairy',
  icon: '🥛'
}, {
  id: 'grains',
  name: 'Grains & Cereals',
  icon: '🌾'
}, {
  id: 'spices',
  name: 'Spices & Herbs',
  icon: '🌿'
}, {
  id: 'pantry',
  name: 'Pantry Items',
  icon: '🥫'
}, {
  id: 'other',
  name: 'Other',
  icon: '📦'
}];
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
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const {
    toast
  } = useToast();
  const handleAddIngredient = () => {
    if (!newIngredient.name.trim()) {
      toast({
        title: "Missing ingredient name",
        description: "Please enter an ingredient name",
        variant: "destructive"
      });
      return;
    }
    onAddIngredient(newIngredient);
    setNewIngredient({
      name: '',
      quantity: 1,
      unit: 'pcs',
      category: 'other',
      expiryDate: ''
    });
    toast({
      title: "Ingredient added!",
      description: `${newIngredient.name} has been added to your pantry`
    });
  };
  const handleCategoryChange = (ingredientId: string, newCategory: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (ingredient) {
      // Update the ingredient with new category
      const updatedIngredient = {
        ...ingredient,
        category: newCategory
      };
      onRemoveIngredient(ingredientId);
      onAddIngredient({
        name: updatedIngredient.name,
        quantity: updatedIngredient.quantity,
        unit: updatedIngredient.unit,
        category: newCategory,
        expiryDate: updatedIngredient.expiryDate
      });
      setEditingCategory(null);
      toast({
        title: "Category updated!",
        description: `${ingredient.name} moved to ${CATEGORIES.find(c => c.id === newCategory)?.name}`
      });
    }
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
    if (categoryId === 'all') return ingredients;
    return ingredients.filter(ingredient => ingredient.category === categoryId);
  };
  const getCategoryCount = (categoryId: string) => {
    return getIngredientsByCategory(categoryId).length;
  };
  const handleRemoveIngredient = (ingredientId: string) => {
    console.log('Removing ingredient with ID:', ingredientId);
    onRemoveIngredient(ingredientId);
  };
  const handleQuantityUpdate = (ingredientId: string, newQuantity: number) => {
    console.log('Updating quantity for ingredient ID:', ingredientId, 'to:', newQuantity);
    onUpdateQuantity(ingredientId, newQuantity);
  };
  const filteredIngredients = getIngredientsByCategory(activeCategory);
  return <div className="space-y-4 md:space-y-6">
      

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Your Pantry ({ingredients.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ingredients.length === 0 ? <div className="text-center py-8 text-gray-500">
              <p className="text-base md:text-lg">No ingredients in your pantry yet.</p>
              <p className="text-sm md:text-base">Add some using the form above!</p>
            </div> : <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 w-full h-auto p-1 gap-1">
                <TabsTrigger value="all" className="text-xs sm:text-sm px-2 py-2 flex flex-col items-center gap-1">
                  <span>📋</span>
                  <span className="hidden sm:inline">All</span>
                  <Badge variant="secondary" className="text-xs">
                    {ingredients.length}
                  </Badge>
                </TabsTrigger>
                {CATEGORIES.map(category => {
              const count = getCategoryCount(category.id);
              if (count === 0) return null;
              return <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm px-2 py-2 flex flex-col items-center gap-1">
                      <span>{category.icon}</span>
                      <span className="hidden lg:inline">{category.name}</span>
                      <span className="lg:hidden">{category.name.split(' ')[0]}</span>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </TabsTrigger>;
            })}
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {ingredients.map(ingredient => {
                const daysUntilExpiry = getDaysUntilExpiry(ingredient.expiryDate);
                const category = CATEGORIES.find(c => c.id === ingredient.category);
                return <div key={`ingredient-${ingredient.id}`} className="border rounded-lg p-3 md:p-4 space-y-3 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold capitalize text-sm md:text-base truncate">{ingredient.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs">{category?.icon}</span>
                              <span className="text-xs text-gray-600">{category?.name}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveIngredient(ingredient.id)} className="text-red-500 hover:text-red-700 p-1">
                            <Trash className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Input type="number" min="0" step="0.1" value={ingredient.quantity} onChange={e => handleQuantityUpdate(ingredient.id, parseFloat(e.target.value) || 0)} className="w-16 md:w-20 text-sm" />
                          <span className="text-xs md:text-sm text-gray-600">{ingredient.unit}</span>
                        </div>

                        {ingredient.expiryDate && <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                            <Badge variant={getExpiryBadgeColor(daysUntilExpiry)} className="text-xs">
                              {daysUntilExpiry !== null && daysUntilExpiry < 0 ? `Expired ${Math.abs(daysUntilExpiry)} days ago` : daysUntilExpiry !== null && daysUntilExpiry === 0 ? 'Expires today' : daysUntilExpiry !== null && daysUntilExpiry === 1 ? 'Expires tomorrow' : daysUntilExpiry !== null ? `${daysUntilExpiry} days left` : 'No expiry set'}
                            </Badge>
                          </div>}

                        {ingredient.category === 'other' && <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingCategory(ingredient.id)} className="text-xs">
                              <Edit2 className="w-3 h-3 mr-1" />
                              Reassign
                            </Button>
                            {editingCategory === ingredient.id && <select onChange={e => handleCategoryChange(ingredient.id, e.target.value)} className="text-xs p-1 border rounded" autoFocus onBlur={() => setEditingCategory(null)}>
                                <option value="">Choose category...</option>
                                {CATEGORIES.filter(c => c.id !== 'other').map(category => <option key={category.id} value={category.id}>
                                    {category.icon} {category.name}
                                  </option>)}
                              </select>}
                          </div>}
                      </div>;
              })}
                </div>
              </TabsContent>

              {CATEGORIES.map(category => {
            const categoryIngredients = getIngredientsByCategory(category.id);
            if (categoryIngredients.length === 0) return null;
            return <TabsContent key={category.id} value={category.id} className="mt-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span>{category.icon}</span>
                        {category.name} ({categoryIngredients.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                      {categoryIngredients.map(ingredient => {
                  const daysUntilExpiry = getDaysUntilExpiry(ingredient.expiryDate);
                  return <div key={`ingredient-${ingredient.id}`} className="border rounded-lg p-3 md:p-4 space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold capitalize text-sm md:text-base flex-1 min-w-0 truncate">{ingredient.name}</h4>
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveIngredient(ingredient.id)} className="text-red-500 hover:text-red-700 p-1">
                                <Trash className="w-3 h-3 md:w-4 md:h-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Input type="number" min="0" step="0.1" value={ingredient.quantity} onChange={e => handleQuantityUpdate(ingredient.id, parseFloat(e.target.value) || 0)} className="w-16 md:w-20 text-sm" />
                              <span className="text-xs md:text-sm text-gray-600">{ingredient.unit}</span>
                            </div>

                            {ingredient.expiryDate && <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                                <Badge variant={getExpiryBadgeColor(daysUntilExpiry)} className="text-xs">
                                  {daysUntilExpiry !== null && daysUntilExpiry < 0 ? `Expired ${Math.abs(daysUntilExpiry)} days ago` : daysUntilExpiry !== null && daysUntilExpiry === 0 ? 'Expires today' : daysUntilExpiry !== null && daysUntilExpiry === 1 ? 'Expires tomorrow' : daysUntilExpiry !== null ? `${daysUntilExpiry} days left` : 'No expiry set'}
                                </Badge>
                              </div>}

                            {ingredient.category === 'other' && <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setEditingCategory(ingredient.id)} className="text-xs">
                                  <Edit2 className="w-3 h-3 mr-1" />
                                  Reassign
                                </Button>
                                {editingCategory === ingredient.id && <select onChange={e => handleCategoryChange(ingredient.id, e.target.value)} className="text-xs p-1 border rounded" autoFocus onBlur={() => setEditingCategory(null)}>
                                    <option value="">Choose category...</option>
                                    {CATEGORIES.filter(c => c.id !== 'other').map(category => <option key={category.id} value={category.id}>
                                        {category.icon} {category.name}
                                      </option>)}
                                  </select>}
                              </div>}
                          </div>;
                })}
                    </div>
                  </TabsContent>;
          })}
            </Tabs>}
        </CardContent>
      </Card>
    </div>;
};