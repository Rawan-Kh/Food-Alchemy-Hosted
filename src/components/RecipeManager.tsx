import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RecipeForm } from './RecipeForm';
import { Recipe } from './RecipeManager';
import { Plus, ChefHat, Trash2 } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from "./ui/scroll-area"
import { cn } from '@/lib/utils';
import { FreeRecipeScrapingDialog } from './FreeRecipeScrapingDialog';
import { BatchRecipeScrapingDialog } from './BatchRecipeScrapingDialog';

interface RecipeManagerProps {
  
}

export const RecipeManager: React.FC<RecipeManagerProps> = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const storedRecipes = localStorage.getItem('recipes');
    if (storedRecipes) {
      setRecipes(JSON.parse(storedRecipes));
    }
  }, []);

  const onAddRecipe = (newRecipe: Omit<Recipe, 'id' | 'dateAdded'>) => {
    const recipe: Recipe = {
      ...newRecipe,
      id: Date.now().toString(),
      dateAdded: new Date()
    };
    const updatedRecipes = [recipe, ...recipes];
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
  };

  const onAddMultipleRecipes = (newRecipes: Omit<Recipe, 'id' | 'dateAdded'>[]) => {
    const recipesToAdd: Recipe[] = newRecipes.map(recipe => ({
      ...recipe,
      id: (Date.now() + Math.random()).toString(),
      dateAdded: new Date()
    }));
    const updatedRecipes = [...recipesToAdd, ...recipes];
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
  };

  const onDeleteRecipe = (id: string) => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
    setRecipes(updatedRecipes);
    localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(search.toLowerCase()) ||
    recipe.description.toLowerCase().includes(search.toLowerCase()) ||
    recipe.ingredients.some(ingredient => ingredient.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-10">
      {showForm && (
        <RecipeForm onAdd={onAddRecipe} onClose={() => setShowForm(false)} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6" />
              Recipe Collection ({filteredRecipes.length})
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Recipe
              </Button>
              <FreeRecipeScrapingDialog onRecipeScraped={onAddRecipe} />
              <BatchRecipeScrapingDialog onRecipesScraped={onAddMultipleRecipes} />
            </div>
          </CardTitle>
          <CardDescription>Manage your favorite recipes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between"
                >
                  Search recipes...
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Type to search..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No recipe found.</CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-64">
                        {filteredRecipes.map((recipe) => (
                          <CommandItem
                            key={recipe.id}
                            onSelect={() => {
                              setOpen(false)
                            }}
                          >
                            {recipe.name}
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                    <CommandSeparator />
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="grid gap-4">
              {filteredRecipes.map(recipe => (
                <Card key={recipe.id}>
                  <CardHeader>
                    <CardTitle>{recipe.name}</CardTitle>
                    <CardDescription>{recipe.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Ingredients:</strong></p>
                    <ul>
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index}>
                          {ingredient.quantity} {ingredient.unit} {ingredient.name}
                        </li>
                      ))}
                    </ul>
                    <p><strong>Instructions:</strong></p>
                    <ol>
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                    <Button variant="destructive" onClick={() => onDeleteRecipe(recipe.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
