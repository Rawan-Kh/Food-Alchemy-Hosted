
import { Recipe } from '@/components/RecipeManager';

export class JsonLdParser {
  static extractRecipeFromJsonLd(doc: Document): Omit<Recipe, 'id' | 'dateAdded'> | null {
    try {
      const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
      
      for (const script of scripts) {
        const jsonData = JSON.parse(script.textContent || '');
        const recipe = this.findRecipeInJsonLd(jsonData);
        
        if (recipe) {
          return {
            name: recipe.name || 'Scraped Recipe',
            description: recipe.description || 'Recipe scraped from web',
            ingredients: this.parseJsonLdIngredients(recipe.recipeIngredient || []),
            instructions: this.parseJsonLdInstructions(recipe.recipeInstructions || []),
            cookingTime: this.parseJsonLdTime(recipe.cookTime || recipe.totalTime) || 30,
            servings: parseInt(recipe.recipeYield) || 4,
            source: recipe.url || ''
          };
        }
      }
    } catch (error) {
      console.log('No valid JSON-LD found:', error);
    }
    
    return null;
  }

  private static findRecipeInJsonLd(data: any): any {
    if (Array.isArray(data)) {
      for (const item of data) {
        const recipe = this.findRecipeInJsonLd(item);
        if (recipe) return recipe;
      }
    } else if (data && typeof data === 'object') {
      if (data['@type'] === 'Recipe') {
        return data;
      }
      
      for (const key in data) {
        const recipe = this.findRecipeInJsonLd(data[key]);
        if (recipe) return recipe;
      }
    }
    
    return null;
  }

  private static parseJsonLdIngredients(ingredients: any[]): { name: string; quantity: number; unit: string }[] {
    return ingredients.slice(0, 20).map(ingredient => {
      const text = typeof ingredient === 'string' ? ingredient : ingredient.text || '';
      return this.parseIngredientText(text) || { name: text, quantity: 1, unit: 'pcs' };
    });
  }

  private static parseJsonLdInstructions(instructions: any[]): string[] {
    return instructions.slice(0, 15).map(instruction => {
      if (typeof instruction === 'string') return instruction;
      return instruction.text || instruction.name || '';
    }).filter(text => text.length > 0);
  }

  private static parseJsonLdTime(timeStr: string): number {
    if (!timeStr) return 30;
    
    const match = timeStr.match(/PT?(\d+)M/) || timeStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 30;
  }

  private static parseIngredientText(text: string): { name: string; quantity: number; unit: string } | null {
    const units = ['cup', 'cups', 'tbsp', 'tsp', 'lb', 'lbs', 'oz', 'g', 'kg', 'ml', 'l', 'pcs', 'piece', 'pieces', 'clove', 'cloves'];
    
    const quantityPattern = /^(\d+(?:\.\d+)?(?:\/\d+)?)\s*(\w+)?\s+(.+)$/i;
    const match = text.match(quantityPattern);
    
    if (match) {
      const quantity = this.parseQuantity(match[1]);
      const unit = match[2] && units.includes(match[2].toLowerCase()) ? match[2].toLowerCase() : 'pcs';
      const name = (match[2] && units.includes(match[2].toLowerCase()) ? match[3] : match[2] + ' ' + match[3]).trim();
      
      return { name, quantity, unit };
    }
    
    return { name: text, quantity: 1, unit: 'pcs' };
  }

  private static parseQuantity(quantityStr: string): number {
    if (quantityStr.includes('/')) {
      const [numerator, denominator] = quantityStr.split('/').map(Number);
      return numerator / denominator;
    }
    
    return parseFloat(quantityStr) || 1;
  }
}
