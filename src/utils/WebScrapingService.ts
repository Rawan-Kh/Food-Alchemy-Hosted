
import FirecrawlApp from '@mendable/firecrawl-js';

interface Recipe {
  name: string;
  description: string;
  ingredients: { name: string; quantity: number; unit: string }[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  source: string;
}

export class WebScrapingService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
    console.log('Firecrawl API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing Firecrawl API key');
      this.firecrawlApp = new FirecrawlApp({ apiKey });
      // Test with a simple scrape
      const testResponse = await this.firecrawlApp.scrapeUrl('https://example.com');
      return testResponse.success;
    } catch (error) {
      console.error('Error testing Firecrawl API key:', error);
      return false;
    }
  }

  static async scrapeRecipe(url: string): Promise<{ success: boolean; recipe?: Recipe; error?: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'Firecrawl API key not found. Please set your API key first.' };
    }

    try {
      console.log('Scraping recipe from URL:', url);
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const scrapeResponse = await this.firecrawlApp.scrapeUrl(url, {
        formats: ['markdown', 'html'],
        includeTags: ['title', 'h1', 'h2', 'h3', 'p', 'li', 'ul', 'ol'],
        excludeTags: ['nav', 'footer', 'header', 'aside', 'script']
      });

      if (!scrapeResponse.success) {
        console.error('Scraping failed:', scrapeResponse);
        return { success: false, error: 'Failed to scrape the webpage' };
      }

      console.log('Scraping successful, parsing recipe data');
      const recipe = this.parseRecipeFromContent(scrapeResponse.data, url);
      
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

  private static parseRecipeFromContent(data: any, url: string): Recipe | null {
    try {
      const content = data.markdown || data.html || '';
      
      // Extract title (recipe name)
      const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const name = titleMatch ? titleMatch[1].trim() : 'Scraped Recipe';

      // Extract description (usually first paragraph or subtitle)
      const descriptionMatch = content.match(/^##?\s*(.+)$/m) || content.match(/<p[^>]*>([^<]+)<\/p>/i);
      const description = descriptionMatch ? descriptionMatch[1].trim() : 'Recipe scraped from web';

      // Extract ingredients (look for lists that contain food items)
      const ingredients = this.extractIngredients(content);

      // Extract instructions (look for numbered or bulleted lists)
      const instructions = this.extractInstructions(content);

      // Extract cooking time and servings (look for common patterns)
      const cookingTime = this.extractCookingTime(content);
      const servings = this.extractServings(content);

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
      console.error('Error parsing recipe content:', error);
      return null;
    }
  }

  private static extractIngredients(content: string): { name: string; quantity: number; unit: string }[] {
    const ingredients: { name: string; quantity: number; unit: string }[] = [];
    
    // Look for ingredient patterns in lists
    const ingredientPatterns = [
      /(?:^|\n)[-*•]\s*(.+)$/gm,
      /(?:^|\n)\d+\.\s*(.+)$/gm,
      /<li[^>]*>([^<]+)<\/li>/gi
    ];

    for (const pattern of ingredientPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const ingredientText = match[1].trim();
        
        // Parse quantity, unit, and name from ingredient text
        const parsed = this.parseIngredientText(ingredientText);
        if (parsed) {
          ingredients.push(parsed);
        }
      }
    }

    return ingredients.slice(0, 20); // Limit to 20 ingredients
  }

  private static parseIngredientText(text: string): { name: string; quantity: number; unit: string } | null {
    // Common units
    const units = ['cup', 'cups', 'tbsp', 'tsp', 'lb', 'lbs', 'oz', 'g', 'kg', 'ml', 'l', 'pcs', 'piece', 'pieces'];
    
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
    // Handle fractions like "1/2"
    if (quantityStr.includes('/')) {
      const [numerator, denominator] = quantityStr.split('/').map(Number);
      return numerator / denominator;
    }
    
    return parseFloat(quantityStr) || 1;
  }

  private static extractInstructions(content: string): string[] {
    const instructions: string[] = [];
    
    // Look for instruction patterns
    const instructionPatterns = [
      /(?:^|\n)\d+\.\s*(.+)$/gm,
      /(?:^|\n)[-*•]\s*(.+)$/gm,
      /<li[^>]*>([^<]+)<\/li>/gi
    ];

    for (const pattern of instructionPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const instruction = match[1].trim();
        if (instruction.length > 10 && this.looksLikeInstruction(instruction)) {
          instructions.push(instruction);
        }
      }
    }

    return instructions.slice(0, 15); // Limit to 15 instructions
  }

  private static looksLikeInstruction(text: string): boolean {
    const instructionWords = ['heat', 'cook', 'add', 'mix', 'stir', 'bake', 'boil', 'fry', 'chop', 'slice', 'pour', 'serve'];
    const lowerText = text.toLowerCase();
    return instructionWords.some(word => lowerText.includes(word));
  }

  private static extractCookingTime(content: string): number {
    const timePatterns = [
      /(\d+)\s*(?:minute|min|minutes)/i,
      /(\d+)\s*(?:hour|hr|hours)/i,
      /cook(?:ing)?\s*time[:\s]*(\d+)/i,
      /prep(?:aration)?\s*time[:\s]*(\d+)/i
    ];

    for (const pattern of timePatterns) {
      const match = content.match(pattern);
      if (match) {
        const time = parseInt(match[1]);
        // If it mentions hours, convert to minutes
        if (pattern.source.includes('hour|hr')) {
          return time * 60;
        }
        return time;
      }
    }

    return 30; // Default cooking time
  }

  private static extractServings(content: string): number {
    const servingPatterns = [
      /serves?\s*(\d+)/i,
      /(?:makes|yields?)\s*(\d+)/i,
      /(\d+)\s*servings?/i,
      /(\d+)\s*portions?/i
    ];

    for (const pattern of servingPatterns) {
      const match = content.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    return 4; // Default servings
  }
}
