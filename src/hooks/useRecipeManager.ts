import { useState } from 'react';
import { Recipe } from '@/components/RecipeManager';
import { Ingredient } from '@/components/CategorizedIngredientManager';
import { useToast } from '@/hooks/use-toast';

export const useRecipeManager = (
  recipes: Recipe[],
  ingredients: Ingredient[],
  onAddRecipe: (recipe: Omit<Recipe, 'id' | 'dateAdded'>) => void,
  onUpdateRecipe: (id: string, recipe: Omit<Recipe, 'id' | 'dateAdded'>) => void,
  onDeleteRecipe: (id: string) => void,
  onUseRecipe: (recipe: Recipe) => void
) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ingredients: [{ name: '', quantity: 1, unit: 'pcs' }],
    instructions: [''],
    cookingTime: 30,
    servings: 4,
    source: 'Manual Entry',
    image: undefined as string | undefined
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
      source: 'Manual Entry',
      image: undefined
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

  const getFilteredRecipes = (matchFilter: number) => {
    return recipes.filter(recipe => {
      const matchPercentage = calculateMatchPercentage(recipe);
      const matchesFilter = matchPercentage >= matchFilter;
      
      if (!searchTerm.trim()) {
        return matchesFilter;
      }
      
      const searchLower = searchTerm.toLowerCase();
      
      // Enhanced search functionality
      const nameMatch = recipe.name.toLowerCase().includes(searchLower);
      const descriptionMatch = recipe.description.toLowerCase().includes(searchLower);
      const ingredientMatch = recipe.ingredients.some(ingredient => 
        ingredient.name.toLowerCase().includes(searchLower)
      );
      
      // Search by meal type keywords
      const mealTypeMatch = 
        (searchLower.includes('breakfast') && (recipe.name.toLowerCase().includes('breakfast') || recipe.description.toLowerCase().includes('breakfast'))) ||
        (searchLower.includes('lunch') && (recipe.name.toLowerCase().includes('lunch') || recipe.description.toLowerCase().includes('lunch'))) ||
        (searchLower.includes('dinner') && (recipe.name.toLowerCase().includes('dinner') || recipe.description.toLowerCase().includes('dinner'))) ||
        (searchLower.includes('snack') && (recipe.name.toLowerCase().includes('snack') || recipe.description.toLowerCase().includes('snack'))) ||
        (searchLower.includes('dessert') && (recipe.name.toLowerCase().includes('dessert') || recipe.description.toLowerCase().includes('dessert')));
      
      const matchesSearch = nameMatch || descriptionMatch || ingredientMatch || mealTypeMatch;
      
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
      source: recipe.source,
      image: recipe.image
    });
    setShowAddForm(false);
    setShowEditModal(true);
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
    setShowEditModal(false);
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
    setShowEditModal(false);
    resetForm();
  };

  return {
    showAddForm,
    setShowAddForm,
    editingRecipe,
    showEditModal,
    searchTerm,
    setSearchTerm,
    formData,
    setFormData,
    calculateMatchPercentage,
    getFilteredRecipes,
    handleAddRecipe,
    handleEditRecipe,
    handleUpdateRecipe,
    handleDeleteRecipe,
    handleCancelEdit
  };
};
