
interface Recipe {
  name: string;
  description: string;
  ingredients: { name: string; quantity: number; unit: string }[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  source: string;
}

export class FreeScrapingService {
  static async scrapeRecipe(url: string): Promise<{ success: boolean; recipe?: Recipe; error?: string }> {
    try {
      console.log('Scraping recipe from URL:', url);
      
      // Use a CORS proxy to fetch the webpage
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        return { success: false, error: 'Failed to fetch the webpage' };
      }
      
      const data = await response.json();
      const html = data.contents;
      
      if (!html) {
        return { success: false, error: 'No content received from the webpage' };
      }
      
      console.log('Successfully fetched webpage content');
      const recipe = this.parseRecipeFromHTML(html, url);
      
      if (!recipe) {
        return { success: false, error: 'Could not extract recipe data from the webpage' };
      }
      
      return { success: true, recipe };
    } catch (error) {
      console.error('Error during recipe scraping:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape recipe' 
      };
    }
  }

  private static parseRecipeFromHTML(html: string, url: string): Recipe | null {
    try {
      // Create a temporary DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract recipe data using various selectors
      const name = this.extractRecipeName(doc);
      const description = this.extractDescription(doc);
      const ingredients = this.extractIngredients(doc);
      const instructions = this.extractInstructions(doc);
      const cookingTime = this.extractCookingTime(doc);
      const servings = this.extractServings(doc);
      
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
    // Try various selectors for recipe name
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
    
    // Try various selectors for ingredients
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
        break; // Use the first successful selector
      }
    }
    
    return ingredients.slice(0, 20); // Limit to 20 ingredients
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
    
    return instructions.slice(0, 15); // Limit to 15 instructions
  }

  private static parseIngredientText(text: string): { name: string; quantity: number; unit: string } | null {
    const units = ['cup', 'cups', 'tbsp', 'tsp', 'lb', 'lbs', 'oz', 'g', 'kg', 'ml', 'l', 'pcs', 'piece', 'pieces', 'clove', 'cloves'];
    
    // Try to match patterns like "2 cups flour" or "1 tbsp oil"
    const quantityPattern = /^(\d+(?:\.\d+)?(?:\/\d+)?)\s*(\w+)?\s+(.+)$/i;
    const match = text.match(quantityPattern);
    
    if (match) {
      const quantity = this.parseQuantity(match[1]);
      const unit = match[2] && units.includes(match[2].toLowerCase()) ? match[2].toLowerCase() : 'pcs';
      const name = (match[2] && units.includes(match[2].toLowerCase()) ? match[3] : match[2] + ' ' + match[3]).trim();
      
      return { name, quantity, unit };
    }
    
    // Fallback: treat as ingredient name with default quantity
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
    
    return 30; // Default cooking time
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
    
    return 4; // Default servings
  }
}
