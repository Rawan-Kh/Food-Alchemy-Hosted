
export interface ShoppingListItem {
  id: string;
  ingredientName: string;
  requiredQuantity: number;
  unit: string;
  availableQuantity: number;
  missingQuantity: number;
  recipeNames: string[];
  isChecked: boolean;
  dateAdded: string;
}

export interface ShoppingList {
  id: string;
  weekPlanId: string;
  items: ShoppingListItem[];
  dateCreated: string;
  dateCompleted?: string;
}
