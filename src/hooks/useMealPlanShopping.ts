
import { ShoppingList, ShoppingListItem } from '@/types/shoppingList';
import { WeeklyMealPlan } from '@/types/mealPlanner';
import { Recipe } from '@/components/RecipeManager';
import { Ingredient } from '@/components/IngredientManager';
import { generateShoppingList } from '@/utils/shoppingListGenerator';
import { generateUniqueId } from '@/utils/mealPlanHelpers';
import { useToast } from '@/hooks/use-toast';

export const useMealPlanShopping = (
  currentShoppingList: ShoppingList | null,
  setCurrentShoppingList: (list: ShoppingList | null) => void,
  ingredients: Ingredient[],
  onUpdateIngredients: (ingredients: Ingredient[]) => void
) => {
  const { toast } = useToast();

  const generateShoppingListForPlan = (weekPlan: WeeklyMealPlan, recipes: Recipe[]) => {
    if (!weekPlan) return;

    const shoppingList = generateShoppingList(weekPlan, recipes, ingredients);
    setCurrentShoppingList(shoppingList);

    toast({
      title: "Shopping list created!",
      description: `Generated shopping list with ${shoppingList.items.length} missing ingredients`,
    });
  };

  const toggleShoppingListItem = (itemId: string) => {
    if (!currentShoppingList) return;

    const updatedList = {
      ...currentShoppingList,
      items: currentShoppingList.items.map(item =>
        item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
      )
    };

    setCurrentShoppingList(updatedList);
  };

  const addShoppingItemToPantry = (item: ShoppingListItem, quantity: number) => {
    // Check if ingredient already exists in pantry
    const existingIngredientIndex = ingredients.findIndex(ing =>
      ing.name.toLowerCase() === item.ingredientName.toLowerCase()
    );

    let updatedIngredients: Ingredient[];

    if (existingIngredientIndex !== -1) {
      // Update existing ingredient quantity
      updatedIngredients = ingredients.map((ing, index) =>
        index === existingIngredientIndex
          ? { ...ing, quantity: ing.quantity + quantity }
          : ing
      );
    } else {
      // Add new ingredient to pantry
      const newIngredient: Ingredient = {
        id: generateUniqueId(),
        name: item.ingredientName,
        quantity,
        unit: item.unit,
        expiryDate: '',
        dateAdded: new Date().toISOString(),
        category: 'other'
      };
      updatedIngredients = [...ingredients, newIngredient];
    }

    onUpdateIngredients(updatedIngredients);

    // Update the shopping list to mark item as checked
    toggleShoppingListItem(item.id);
  };

  const completeShoppingList = () => {
    setCurrentShoppingList(null);
    toast({
      title: "Shopping completed!",
      description: "Shopping list has been cleared",
    });
  };

  return {
    generateShoppingListForPlan,
    toggleShoppingListItem,
    addShoppingItemToPantry,
    completeShoppingList
  };
};
