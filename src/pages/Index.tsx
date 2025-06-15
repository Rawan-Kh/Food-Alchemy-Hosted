import React, { useState, useEffect } from 'react';
import { SmartIngredientInput } from '@/components/SmartIngredientInput';
import { CategorizedIngredientManager, Ingredient } from '@/components/CategorizedIngredientManager';
import { RecipeManager, Recipe } from '@/components/RecipeManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Generate unique ID with timestamp and random component
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const Index = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [matchFilter, setMatchFilter] = useState(50);
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedIngredients = localStorage.getItem('recipe-app-ingredients');
    const savedRecipes = localStorage.getItem('recipe-app-recipes');
    
    if (savedIngredients) {
      const parsedIngredients = JSON.parse(savedIngredients);
      // Add category field to existing ingredients if it doesn't exist
      const ingredientsWithCategory = parsedIngredients.map((ingredient: any) => ({
        ...ingredient,
        category: ingredient.category || 'other'
      }));
      setIngredients(ingredientsWithCategory);
    }
    
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    } else {
      // Add some sample recipes if none exist
      const sampleRecipes: Recipe[] = [
        {
          id: '1',
          name: 'Tomato Pasta',
          description: 'Simple and delicious pasta with fresh tomatoes',
          ingredients: [
            { name: 'pasta', quantity: 200, unit: 'g' },
            { name: 'tomatoes', quantity: 3, unit: 'pcs' },
            { name: 'garlic', quantity: 2, unit: 'pcs' },
            { name: 'oil', quantity: 2, unit: 'tbsp' }
          ],
          instructions: [
            'Boil pasta according to package instructions',
            'Heat oil in a pan and sauté minced garlic',
            'Add chopped tomatoes and cook until soft',
            'Mix with cooked pasta and serve'
          ],
          cookingTime: 20,
          servings: 2,
          source: 'Sample Recipe',
          dateAdded: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Chicken Rice Bowl',
          description: 'Healthy chicken and rice bowl with vegetables',
          ingredients: [
            { name: 'chicken', quantity: 300, unit: 'g' },
            { name: 'rice', quantity: 1, unit: 'cups' },
            { name: 'onion', quantity: 1, unit: 'pcs' },
            { name: 'carrots', quantity: 2, unit: 'pcs' }
          ],
          instructions: [
            'Cook rice according to package instructions',
            'Season and cook chicken breast until done',
            'Sauté onions and carrots until tender',
            'Slice chicken and serve over rice with vegetables'
          ],
          cookingTime: 30,
          servings: 2,
          source: 'Sample Recipe',
          dateAdded: new Date().toISOString()
        }
      ];
      setRecipes(sampleRecipes);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('recipe-app-ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('recipe-app-recipes', JSON.stringify(recipes));
  }, [recipes]);

  const handleAddIngredients = (newIngredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    expiryDate: string;
  }>) => {
    const ingredientsWithIds = newIngredients.map(ingredient => ({
      ...ingredient,
      id: generateUniqueId(),
      category: 'other', // Default category for bulk-added ingredients
      dateAdded: new Date().toISOString()
    }));
    
    console.log('Adding multiple ingredients:', ingredientsWithIds);
    setIngredients(prev => [...prev, ...ingredientsWithIds]);
  };

  const handleAddIngredient = (newIngredient: Omit<Ingredient, 'id' | 'dateAdded'>) => {
    const ingredient: Ingredient = {
      ...newIngredient,
      id: generateUniqueId(),
      dateAdded: new Date().toISOString()
    };
    console.log('Adding ingredient with ID:', ingredient.id);
    setIngredients(prev => [...prev, ingredient]);
  };

  const handleRemoveIngredient = (id: string) => {
    console.log('Removing ingredient with ID:', id);
    setIngredients(prev => prev.filter(ingredient => ingredient.id !== id));
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    console.log('Updating quantity for ingredient ID:', id, 'to:', newQuantity);
    setIngredients(prev => 
      prev.map(ingredient => 
        ingredient.id === id ? { ...ingredient, quantity: newQuantity } : ingredient
      )
    );
  };

  const handleAddRecipe = (newRecipe: Omit<Recipe, 'id' | 'dateAdded'>) => {
    const recipe: Recipe = {
      ...newRecipe,
      id: generateUniqueId(),
      dateAdded: new Date().toISOString()
    };
    setRecipes(prev => [...prev, recipe]);
  };

  const handleUpdateRecipe = (id: string, updatedRecipe: Omit<Recipe, 'id' | 'dateAdded'>) => {
    setRecipes(prev => 
      prev.map(recipe => 
        recipe.id === id 
          ? { ...recipe, ...updatedRecipe }
          : recipe
      )
    );
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
  };

  const handleUseRecipe = (recipe: Recipe) => {
    console.log('Using recipe:', recipe.name);
    
    // Reduce ingredient quantities based on recipe requirements
    const updatedIngredients = [...ingredients];
    let canCook = true;
    
    recipe.ingredients.forEach(recipeIngredient => {
      const ingredientIndex = updatedIngredients.findIndex(ingredient =>
        ingredient.name.toLowerCase().includes(recipeIngredient.name.toLowerCase()) ||
        recipeIngredient.name.toLowerCase().includes(ingredient.name.toLowerCase())
      );
      
      if (ingredientIndex !== -1) {
        const availableQuantity = updatedIngredients[ingredientIndex].quantity;
        const requiredQuantity = recipeIngredient.quantity;
        
        if (availableQuantity >= requiredQuantity) {
          updatedIngredients[ingredientIndex].quantity -= requiredQuantity;
        } else {
          canCook = false;
        }
      } else {
        canCook = false;
      }
    });
    
    if (canCook) {
      setIngredients(updatedIngredients);
      toast({
        title: "Recipe cooked!",
        description: `${recipe.name} has been prepared. Ingredients have been consumed.`,
      });
    } else {
      toast({
        title: "Cannot cook recipe",
        description: "Not enough ingredients available",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-800">Smart Recipe Assistant</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Manage your ingredients and discover recipes with smart suggestions and voice commands
          </p>
        </header>

        <SmartIngredientInput
          onAddIngredients={handleAddIngredients}
          isListening={isListening}
          setIsListening={setIsListening}
        />

        <Tabs defaultValue="ingredients" className="space-y-6 mt-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="ingredients" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Pantry ({ingredients.length})
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center gap-2">
              <ChefHat className="w-4 h-4" />
              Recipes ({recipes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients">
            <CategorizedIngredientManager
              ingredients={ingredients}
              onAddIngredient={handleAddIngredient}
              onRemoveIngredient={handleRemoveIngredient}
              onUpdateQuantity={handleUpdateQuantity}
            />
          </TabsContent>

          <TabsContent value="recipes">
            <RecipeManager
              recipes={recipes}
              ingredients={ingredients}
              onAddRecipe={handleAddRecipe}
              onUpdateRecipe={handleUpdateRecipe}
              onDeleteRecipe={handleDeleteRecipe}
              onUseRecipe={handleUseRecipe}
              matchFilter={matchFilter}
              onMatchFilterChange={setMatchFilter}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
