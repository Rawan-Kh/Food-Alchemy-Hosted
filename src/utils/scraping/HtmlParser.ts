
import { Recipe } from '@/components/RecipeManager';

export class HtmlParser {
  static parseRecipeFromHTML(html: string, url: string): Omit<Recipe, 'id' | 'dateAdded'> | null {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const name = this.extractRecipeName(doc);
      const description = this.extractDescription(doc);
      const ingredients = this.extractIngredients(doc);
      const instructions = this.extractInstructions(doc);
      const cookingTime = this.extractCookingTime(doc);
      const servings = this.extractServings(doc);
      
      if (!name || ingredients.length === 0) {
        return null;
      }
      
      return {
        name,
        description,
        ingredients,
        instructions,
        cookingTime,
        servings,
        source: url
      };
    } catch (error) {
      console.error('Error parsing recipe HTML:', error);
      return null;
    }
  }

  private static extractRecipeName(doc: Document): string {
    const selectors = [
      'h1[itemprop="name"]',
      '.recipe-title',
      '.entry-title',
      'h1.recipe-name',
      '[data-testid="recipe-title"]',
      '.recipe-header h1',
      'h1'
    ];
    
    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent?.trim()) {
        return element.textContent.trim();
      }
    }
    
    return 'Scraped Recipe';
  }

  private static extractDescription(doc: Document): string {
    const selectors = [
      '[itemprop="description"]',
      '.recipe-description',
      '.recipe-summary',
      '.entry-summary',
      '.recipe-intro p',
      'meta[name="description"]'
    ];
    
    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const content = element.getAttribute('content') || element.textContent;
        if (content?.trim()) {
          return content.trim();
        }
      }
    }
    
    return 'Recipe scraped from web';
  }

  private static extractIngredients(doc: Document): { name: string; quantity: number; unit: string }[] {
    const ingredients: { name: string; quantity: number; unit: string }[] = [];
    
    const selectors = [
      '[itemprop="recipeIngredient"]',
      '.recipe-ingredient',
      '.ingredients li',
      '.ingredient-list li',
      '[data-testid="ingredient"]',
      '.wp-block-recipe-card-ingredients li'
    ];
    
    for (const selector of selectors) {
      const elements = doc.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(element => {
          const text = element.textContent?.trim();
          if (text) {
            const parsed = this.parseIngredientText(text);
            if (parsed) {
              ingredients.push(parsed);
            }
          }
        });
        break;
      }
    }
    
    return ingredients.slice(0, 20);
  }

  private static extractInstructions(doc: Document): string[] {
    const instructions: string[] = [];
    
    const selectors = [
      '[itemprop="recipeInstructions"]',
      '.recipe-instruction',
      '.instructions li',
      '.method li',
      '.directions li',
      '[data-testid="instruction"]',
      '.wp-block-recipe-card-instructions li'
    ];
    
    for (const selector of selectors) {
      const elements = doc.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(element => {
          const text = element.textContent?.trim();
          if (text && text.length > 10) {
            instructions.push(text);
          }
        });
        break;
      }
    }
    
    return instructions.slice(0, 15);
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

  private static extractCookingTime(doc: Document): number {
    const selectors = [
      '[itemprop="cookTime"]',
      '[itemprop="totalTime"]',
      '.cook-time',
      '.prep-time',
      '.total-time'
    ];
    
    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const timeText = element.textContent || element.getAttribute('datetime') || '';
        const timeMatch = timeText.match(/(\d+)/);
        if (timeMatch) {
          return parseInt(timeMatch[1]);
        }
      }
    }
    
    return 30;
  }

  private static extractServings(doc: Document): number {
    const selectors = [
      '[itemprop="recipeYield"]',
      '.servings',
      '.yield',
      '.recipe-servings'
    ];
    
    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const servingsText = element.textContent || '';
        const servingsMatch = servingsText.match(/(\d+)/);
        if (servingsMatch) {
          return parseInt(servingsMatch[1]);
        }
      }
    }
    
    return 4;
  }
}
