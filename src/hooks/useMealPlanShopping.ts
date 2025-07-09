
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
    if (!weekPlan) {
      console.log('No week plan provided for shopping list generation');
      return;
    }

    console.log('=== SHOPPING LIST GENERATION START ===');
    console.log('Week plan ID:', weekPlan.id);
    console.log('Available ingredients:', ingredients.length);
    console.log('Available recipes:', recipes.length);

    // Generate new shopping list
    const shoppingList = generateShoppingList(weekPlan, recipes, ingredients);
    
    console.log('Generated shopping list with items:', shoppingList.items.length);
    shoppingList.items.forEach(item => {
      console.log(`- ${item.ingredientName}: missing ${item.missingQuantity} ${item.unit} (from recipes: ${item.recipeNames.join(', ')})`);
    });
    console.log('=== SHOPPING LIST GENERATION END ===');

    // Always set the new shopping list, replacing any existing one
    setCurrentShoppingList(shoppingList);

    return shoppingList;
  };

  const toggleShoppingListItem = (itemId: string) => {
    if (!currentShoppingList) return;

    const updatedList = {
      ...currentShoppingList,
      items: currentShoppingList.items.map(item =>
        item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
      )
    };

    console.log('Toggling shopping list item:', itemId);
    setCurrentShoppingList(updatedList);
  };

  const addShoppingItemToPantry = (item: ShoppingListItem, quantity: number) => {
    console.log('Adding to pantry:', item.ingredientName, quantity, item.unit);
    
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
      console.log('Updated existing ingredient:', updatedIngredients[existingIngredientIndex]);
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
      console.log('Added new ingredient:', newIngredient);
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

  const clearAllShoppingItems = () => {
    if (!currentShoppingList) return;

    const clearedList = {
      ...currentShoppingList,
      items: []
    };

    setCurrentShoppingList(clearedList);
    toast({
      title: "Shopping list cleared!",
      description: "All items have been removed from your shopping list",
    });
  };

  return {
    generateShoppingListForPlan,
    toggleShoppingListItem,
    addShoppingItemToPantry,
    completeShoppingList,
    clearAllShoppingItems
  };
};
