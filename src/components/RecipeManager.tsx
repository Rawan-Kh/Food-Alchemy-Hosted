import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, Search, ChefHat, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Ingredient } from './IngredientManager';
import { RecipeScrapingDialog } from './RecipeScrapingDialog';
import { FreeRecipeScrapingDialog } from './FreeRecipeScrapingDialog';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: { name: string; quantity: number; unit: string }[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  source: string;
  dateAdded: string;
}

interface RecipeManagerProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onAddRecipe: (recipe: Omit<Recipe, 'id' | 'dateAdded'>) => void;
  onUpdateRecipe: (id: string, recipe: Omit<Recipe, 'id' | 'dateAdded'>) => void;
  onDeleteRecipe: (id: string) => void;
  onUseRecipe: (recipe: Recipe) => void;
  matchFilter: number;
  onMatchFilterChange: (filter: number) => void;
}

export const RecipeManager: React.FC<RecipeManagerProps> = ({
  recipes,
  ingredients,
  onAddRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
  onUseRecipe,
  matchFilter,
  onMatchFilterChange
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    ingredients: [{ name: '', quantity: 1, unit: 'pcs' }],
    instructions: [''],
    cookingTime: 30,
    servings: 4,
    source: 'Manual Entry'
  });
  const { toast } = useToast();

  const resetForm = () => {
    setNewRecipe({
      name: '',
      description: '',
      ingredients: [{ name: '', quantity: 1, unit: 'pcs' }],
      instructions: [''],
      cookingTime: 30,
      servings: 4,
      source: 'Manual Entry'
    });
  };

  const calculateMatchPercentage = (recipe: Recipe): number => {
    const availableIngredientNames = ingredients.map(i => i.name.toLowerCase());
    const requiredIngredients = recipe.ingredients.length;
    
    if (requiredIngredients === 0) return 100;
    
    const matchedIngredients = recipe.ingredients.filter(recipeIngredient =>
      availableIngredientNames.some(availableIngredient =>
        availableIngredient.includes(recipeIngredient.name.toLowerCase()) ||
        recipeIngredient.name.toLowerCase().includes(availableIngredient)
      )
    ).length;

    return Math.round((matchedIngredients / requiredIngredients) * 100);
  };

  const getFilteredRecipes = () => {
    return recipes.filter(recipe => {
      const matchPercentage = calculateMatchPercentage(recipe);
      const matchesFilter = matchPercentage >= matchFilter;
      const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    }).sort((a, b) => calculateMatchPercentage(b) - calculateMatchPercentage(a));
  };

  const handleAddRecipe = () => {
    if (!newRecipe.name.trim()) {
      toast({
        title: "Missing recipe name",
        description: "Please enter a recipe name",
        variant: "destructive",
      });
      return;
    }

    onAddRecipe(newRecipe);
    resetForm();
    setShowAddForm(false);
    toast({
      title: "Recipe added!",
      description: `${newRecipe.name} has been added to your recipes`,
    });
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setNewRecipe({
      name: recipe.name,
      description: recipe.description,
      ingredients: [...recipe.ingredients],
      instructions: [...recipe.instructions],
      cookingTime: recipe.cookingTime,
      servings: recipe.servings,
      source: recipe.source
    });
    setShowAddForm(false);
  };

  const handleUpdateRecipe = () => {
    if (!editingRecipe || !newRecipe.name.trim()) {
      toast({
        title: "Missing recipe name",
        description: "Please enter a recipe name",
        variant: "destructive",
      });
      return;
    }

    onUpdateRecipe(editingRecipe.id, newRecipe);
    resetForm();
    setEditingRecipe(null);
    toast({
      title: "Recipe updated!",
      description: `${newRecipe.name} has been updated`,
    });
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    if (window.confirm(`Are you sure you want to delete "${recipe.name}"?`)) {
      onDeleteRecipe(recipe.id);
      toast({
        title: "Recipe deleted",
        description: `${recipe.name} has been removed from your recipes`,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingRecipe(null);
    resetForm();
  };

  const addIngredientField = () => {
    setNewRecipe({
      ...newRecipe,
      ingredients: [...newRecipe.ingredients, { name: '', quantity: 1, unit: 'pcs' }]
    });
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updatedIngredients = [...newRecipe.ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
  };

  const addInstructionField = () => {
    setNewRecipe({
      ...newRecipe,
      instructions: [...newRecipe.instructions, '']
    });
  };

  const updateInstruction = (index: number, value: string) => {
    const updatedInstructions = [...newRecipe.instructions];
    updatedInstructions[index] = value;
    setNewRecipe({ ...newRecipe, instructions: updatedInstructions });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              Your Recipes ({recipes.length})
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowAddForm(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Recipe
              </Button>
              <RecipeScrapingDialog onRecipeScraped={onAddRecipe} />
              <FreeRecipeScrapingDialog onRecipeScraped={onAddRecipe} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="matchFilter" className="whitespace-nowrap">Min Match:</Label>
                <select
                  id="matchFilter"
                  value={matchFilter}
                  onChange={(e) => onMatchFilterChange(parseInt(e.target.value))}
                  className="p-2 border border-gray-300 rounded-md"
                >
                  <option value={0}>Any match</option>
                  <option value={50}>50%+ match</option>
                  <option value={75}>75%+ match</option>
                  <option value={100}>100% match</option>
                </select>
              </div>
            </div>

            {(showAddForm || editingRecipe) && (
              <Card className="border-2 border-dashed border-gray-300">
                <CardHeader>
                  <CardTitle>{editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipeName">Recipe Name</Label>
                      <Input
                        id="recipeName"
                        value={newRecipe.name}
                        onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                        placeholder="e.g., Spaghetti Bolognese"
                      />
                    </div>
                    <div>
                      <Label htmlFor="source">Source</Label>
                      <Input
                        id="source"
                        value={newRecipe.source}
                        onChange={(e) => setNewRecipe({ ...newRecipe, source: e.target.value })}
                        placeholder="e.g., Family Recipe, Website URL"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newRecipe.description}
                      onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                      placeholder="Brief description of the recipe..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cookingTime">Cooking Time (minutes)</Label>
                      <Input
                        id="cookingTime"
                        type="number"
                        min="1"
                        value={newRecipe.cookingTime}
                        onChange={(e) => setNewRecipe({ ...newRecipe, cookingTime: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="servings">Servings</Label>
                      <Input
                        id="servings"
                        type="number"
                        min="1"
                        value={newRecipe.servings}
                        onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Ingredients</Label>
                    {newRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 mt-2">
                        <Input
                          placeholder="Ingredient name"
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                        <select
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                          className="p-2 border border-gray-300 rounded-md"
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
                    ))}
                    <Button type="button" variant="outline" onClick={addIngredientField} className="mt-2">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Ingredient
                    </Button>
                  </div>

                  <div>
                    <Label>Instructions</Label>
                    {newRecipe.instructions.map((instruction, index) => (
                      <Textarea
                        key={index}
                        placeholder={`Step ${index + 1}...`}
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        className="mt-2"
                      />
                    ))}
                    <Button type="button" variant="outline" onClick={addInstructionField} className="mt-2">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Step
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={editingRecipe ? handleUpdateRecipe : handleAddRecipe}>
                      {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
                    </Button>
                    <Button variant="outline" onClick={editingRecipe ? handleCancelEdit : () => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredRecipes().map((recipe) => {
          const matchPercentage = calculateMatchPercentage(recipe);
          return (
            <Card key={recipe.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{recipe.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={matchPercentage === 100 ? 'default' : matchPercentage >= 75 ? 'secondary' : 'outline'}
                      className={matchPercentage === 100 ? 'bg-green-500' : matchPercentage >= 75 ? 'bg-orange-500' : ''}
                    >
                      {matchPercentage}% match
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{recipe.description}</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRecipe(recipe)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRecipe(recipe)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.cookingTime}m
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {recipe.servings} servings
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Ingredients:</h4>
                  <ul className="text-sm space-y-1">
                    {recipe.ingredients.map((ingredient, index) => {
                      const hasIngredient = ingredients.some(i => 
                        i.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                        ingredient.name.toLowerCase().includes(i.name.toLowerCase())
                      );
                      return (
                        <li key={index} className={`flex items-center gap-2 ${hasIngredient ? 'text-green-600' : 'text-red-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${hasIngredient ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {ingredient.quantity} {ingredient.unit} {ingredient.name}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="flex-1">
                  <p className="text-xs text-gray-500">Source: {recipe.source}</p>
                </div>

                <Button 
                  onClick={() => onUseRecipe(recipe)} 
                  className="w-full"
                  disabled={matchPercentage < 100}
                >
                  {matchPercentage === 100 ? 'Cook This Recipe' : 'Missing Ingredients'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {getFilteredRecipes().length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <ChefHat className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No recipes match your current filters.</p>
            <p className="text-sm text-gray-400 mt-2">
              Try lowering the match percentage or adding more ingredients.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
