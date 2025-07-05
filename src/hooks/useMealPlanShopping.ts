
import { ShoppingList, ShoppingListItem } from '@/types/shoppingList';
import { WeeklyMealPlan } from '@/types/mealPlanner';
import { Recipe } from '@/components/RecipeManager';
import { Ingredient } from '@/components/CategorizedIngredientManager';
import { generateShoppingList } from '@/utils/shoppingListGenerator';
import { generateUniqueId } from '@/utils/mealPlanHelpers';
import { useToast } from '@/hooks/use-toast';

// Function to determine appropriate category based on ingredient name
const determineIngredientCategory = (ingredientName: string): string => {
  const name = ingredientName.toLowerCase();
  
  // Vegetables
  if (['tomato', 'onion', 'garlic', 'carrot', 'potato', 'bell pepper', 'broccoli', 'spinach', 'lettuce', 'cucumber', 'celery', 'mushroom', 'zucchini', 'eggplant', 'cabbage', 'kale', 'cauliflower'].some(veg => name.includes(veg))) {
    return 'vegetables';
  }
  
  // Fruits
  if (['apple', 'banana', 'orange', 'lemon', 'lime', 'berry', 'grape', 'mango', 'pineapple', 'strawberry', 'blueberry', 'avocado', 'peach', 'pear'].some(fruit => name.includes(fruit))) {
    return 'fruits';
  }
  
  // Meat & Poultry
  if (['chicken', 'beef', 'pork', 'turkey', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'bacon', 'ham', 'sausage'].some(meat => name.includes(meat))) {
    return 'meat';
  }
  
  // Seafood
  if (['fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'cod', 'tilapia', 'sardine', 'anchovy', 'scallop', 'oyster', 'mussel', 'clam'].some(seafood => name.includes(seafood))) {
    return 'meat';
  }
  
  // Dairy
  if (['milk', 'cheese', 'butter', 'yogurt', 'cream', 'egg', 'cottage cheese', 'sour cream', 'mozzarella', 'cheddar', 'parmesan'].some(dairy => name.includes(dairy))) {
    return 'dairy';
  }
  
  // Grains & Cereals
  if (['rice', 'pasta', 'bread', 'flour', 'oats', 'quinoa', 'barley', 'wheat', 'noodle', 'cereal', 'couscous', 'bulgur'].some(grain => name.includes(grain))) {
    return 'grains';
  }
  
  // Herbs & Spices
  if (['basil', 'oregano', 'thyme', 'rosemary', 'parsley', 'cilantro', 'mint', 'sage', 'pepper', 'salt', 'paprika', 'cumin', 'turmeric', 'ginger', 'cinnamon', 'nutmeg', 'clove', 'bay leaf'].some(herb => name.includes(herb))) {
    return 'spices';
  }
  
  // Condiments & Sauces
  if (['oil', 'vinegar', 'sauce', 'ketchup', 'mustard', 'mayo', 'soy sauce', 'hot sauce', 'bbq sauce', 'salsa', 'honey', 'syrup', 'jam', 'pickle'].some(condiment => name.includes(condiment))) {
    return 'pantry';
  }
  
  // Beverages
  if (['water', 'juice', 'soda', 'tea', 'coffee', 'beer', 'wine', 'cocktail', 'smoothie', 'shake'].some(beverage => name.includes(beverage))) {
    return 'beverages';
  }
  
  // Canned Goods
  if (['can', 'canned', 'jar', 'jarred', 'bottled', 'preserved'].some(canned => name.includes(canned))) {
    return 'pantry';
  }
  
  // Baking
  if (['sugar', 'baking powder', 'baking soda', 'vanilla', 'yeast', 'cocoa', 'chocolate chip', 'almond extract'].some(baking => name.includes(baking))) {
    return 'pantry';
  }
  
  // Default category
  return 'other';
};

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
      // Add new ingredient to pantry with appropriate category
      const category = determineIngredientCategory(item.ingredientName);
      const newIngredient: Ingredient = {
        id: generateUniqueId(),
        name: item.ingredientName,
        quantity,
        unit: item.unit,
        expiryDate: '',
        dateAdded: new Date().toISOString(),
        category
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
