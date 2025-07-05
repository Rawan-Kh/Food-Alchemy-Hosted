
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RecipeForm } from './RecipeForm';
import { Recipe } from './RecipeManager';

interface RecipeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  formData: {
    name: string;
    description: string;
    ingredients: { name: string; quantity: number; unit: string }[];
    instructions: string[];
    cookingTime: number;
    servings: number;
    source: string;
  };
  onFormDataChange: (data: any) => void;
  onSubmit: () => void;
}

export const RecipeEditModal: React.FC<RecipeEditModalProps> = ({
  isOpen,
  onClose,
  recipe,
  formData,
  onFormDataChange,
  onSubmit
}) => {
  const handleSubmit = () => {
    onSubmit();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {recipe ? `Edit Recipe: ${recipe.name}` : 'Edit Recipe'}
          </DialogTitle>
        </DialogHeader>
        <RecipeForm
          formData={formData}
          isEditing={true}
          onFormDataChange={onFormDataChange}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
