import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChefHat } from 'lucide-react';
import { Ingredient } from './CategorizedIngredientManager';
import { FreeRecipeScrapingDialog } from './FreeRecipeScrapingDialog';
import { RecipeForm } from './RecipeForm';
import { RecipeCard } from './RecipeCard';
import { RecipeFilters } from './RecipeFilters';
import { RecipeEditModal } from './RecipeEditModal';
import { RecipeDetailsModal } from './RecipeDetailsModal';
import { useRecipeManager } from '@/hooks/useRecipeManager';

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
  image?: string;
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
  const [selectedRecipeForDetails, setSelectedRecipeForDetails] = useState<Recipe | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const {
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
  } = useRecipeManager(recipes, ingredients, onAddRecipe, onUpdateRecipe, onDeleteRecipe, onUseRecipe);

  const filteredRecipes = getFilteredRecipes(matchFilter);

  const handleViewDetails = (recipe: Recipe) => {
    setSelectedRecipeForDetails(recipe);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedRecipeForDetails(null);
    setShowDetailsModal(false);
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

            {showAddForm && (
              <RecipeForm
                formData={formData}
                isEditing={false}
                onFormDataChange={setFormData}
                onSubmit={handleAddRecipe}
                onCancel={() => setShowAddForm(false)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <RecipeEditModal
        isOpen={showEditModal}
        onClose={handleCancelEdit}
        recipe={editingRecipe}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleUpdateRecipe}
      />

      <RecipeDetailsModal
        recipe={selectedRecipeForDetails}
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        ingredients={ingredients}
        matchPercentage={selectedRecipeForDetails ? calculateMatchPercentage(selectedRecipeForDetails) : 0}
        onEdit={(recipe) => {
          handleCloseDetailsModal();
          handleEditRecipe(recipe);
        }}
        onDelete={(recipe) => {
          handleCloseDetailsModal();
          handleDeleteRecipe(recipe);
        }}
        onUse={(recipe) => {
          handleCloseDetailsModal();
          onUseRecipe(recipe);
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => {
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
              onViewDetails={handleViewDetails}
            />
          );
        })}
      </div>

      {filteredRecipes.length === 0 && (
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
