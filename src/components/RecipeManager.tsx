
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChefHat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Ingredient } from './IngredientManager';
import { FreeRecipeScrapingDialog } from './FreeRecipeScrapingDialog';
import { RecipeForm } from './RecipeForm';
import { RecipeCard } from './RecipeCard';
import { RecipeFilters } from './RecipeFilters';

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
  const [formData, setFormData] = useState({
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
    setFormData({
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
    if (!formData.name.trim()) {
      toast({
        title: "Missing recipe name",
        description: "Please enter a recipe name",
        variant: "destructive",
      });
      return;
    }

    onAddRecipe(formData);
    resetForm();
    setShowAddForm(false);
    toast({
      title: "Recipe added!",
      description: `${formData.name} has been added to your recipes`,
    });
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData({
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
    if (!editingRecipe || !formData.name.trim()) {
      toast({
        title: "Missing recipe name",
        description: "Please enter a recipe name",
        variant: "destructive",
      });
      return;
    }

    onUpdateRecipe(editingRecipe.id, formData);
    resetForm();
    setEditingRecipe(null);
    toast({
      title: "Recipe updated!",
      description: `${formData.name} has been updated`,
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
              <FreeRecipeScrapingDialog onRecipeScraped={onAddRecipe} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <RecipeFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              matchFilter={matchFilter}
              onMatchFilterChange={onMatchFilterChange}
            />

            {(showAddForm || editingRecipe) && (
              <RecipeForm
                formData={formData}
                isEditing={!!editingRecipe}
                onFormDataChange={setFormData}
                onSubmit={editingRecipe ? handleUpdateRecipe : handleAddRecipe}
                onCancel={editingRecipe ? handleCancelEdit : () => setShowAddForm(false)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredRecipes().map((recipe) => {
          const matchPercentage = calculateMatchPercentage(recipe);
          return (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              ingredients={ingredients}
              matchPercentage={matchPercentage}
              onEdit={handleEditRecipe}
              onDelete={handleDeleteRecipe}
              onUse={onUseRecipe}
            />
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
