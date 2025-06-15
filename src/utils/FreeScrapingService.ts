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
  // Multiple CORS proxy services as fallbacks
  private static corsProxies = [
    'https://api.allorigins.win/get?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
  ];

  static async scrapeRecipe(url: string): Promise<{ success: boolean; recipe?: Recipe; error?: string }> {
    try {
      console.log('Scraping recipe from URL:', url);
      
      // Try each proxy service until one works
      for (let i = 0; i < this.corsProxies.length; i++) {
        const proxy = this.corsProxies[i];
        console.log(`Attempting with proxy ${i + 1}:`, proxy);
        
        try {
          const html = await this.fetchWithProxy(url, proxy, i);
          if (html) {
            const recipe = this.parseRecipeFromHTML(html, url);
            if (recipe) {
              console.log('Successfully scraped recipe:', recipe.name);
              // Clean and deduplicate ingredients
              recipe.ingredients = this.cleanAndDeduplicateIngredients(recipe.ingredients);
              return { success: true, recipe };
            }
          }
        } catch (proxyError) {
          console.log(`Proxy ${i + 1} failed:`, proxyError);
          // Continue to next proxy
        }
      }
      
      return { success: false, error: 'All proxy services failed. The website may be blocking requests or the recipe format is not supported.' };
    } catch (error) {
      console.error('Error during recipe scraping:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape recipe' 
      };
    }
  }

  private static async fetchWithProxy(url: string, proxy: string, proxyIndex: number): Promise<string | null> {
    let proxyUrl: string;
    let response: Response;

    switch (proxyIndex) {
      case 0: // allorigins
        proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.contents || null;

      case 1: // cors-anywhere (requires demo key)
        proxyUrl = `${proxy}${url}`;
        response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();

      case 2: // corsproxy.io
        proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();

      case 3: // codetabs
        proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();

      default:
        throw new Error('Unknown proxy');
    }
  }

  private static parseRecipeFromHTML(html: string, url: string): Recipe | null {
    try {
      // Create a temporary DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // First try to find JSON-LD structured data
      const jsonLdRecipe = this.extractRecipeFromJsonLd(doc);
      if (jsonLdRecipe) {
        return { ...jsonLdRecipe, source: url };
      }
      
      // Fallback to HTML parsing
      const name = this.extractRecipeName(doc);
      const description = this.extractDescription(doc);
      const ingredients = this.extractIngredients(doc);
      const instructions = this.extractInstructions(doc);
      const cookingTime = this.extractCookingTime(doc);
      const servings = this.extractServings(doc);
      
      // Validate that we have essential data
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

  private static cleanAndDeduplicateIngredients(ingredients: { name: string; quantity: number; unit: string }[]): { name: string; quantity: number; unit: string }[] {
    const cleaned: { name: string; quantity: number; unit: string }[] = [];
    const seen = new Set<string>();

    for (const ingredient of ingredients) {
      // Clean the ingredient name
      let cleanName = ingredient.name
        .replace(/^(to|and)\s+/i, '') // Remove "To" or "And" at the beginning
        .replace(/^\d+\s*(pcs|pieces?)\s*/i, '') // Remove quantity prefix like "1 pcs"
        .replace(/^[\d\s/.]+/, '') // Remove any remaining numbers at the start
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // Skip if name is too short or empty after cleaning
      if (cleanName.length < 2) continue;

      // Create a normalized key for deduplication (lowercase, no special chars)
      const normalizedKey = cleanName.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // Skip duplicates
      if (seen.has(normalizedKey)) continue;
      seen.add(normalizedKey);

      // Clean quantity and unit
      let cleanQuantity = ingredient.quantity;
      let cleanUnit = ingredient.unit;

      // If quantity is 1 and unit is 'pcs', try to extract better info from name
      if (cleanQuantity === 1 && cleanUnit === 'pcs') {
        const quantityMatch = ingredient.name.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*(\w+)?/);
        if (quantityMatch) {
          cleanQuantity = this.parseQuantity(quantityMatch[1]);
          if (quantityMatch[2] && this.isValidUnit(quantityMatch[2])) {
            cleanUnit = quantityMatch[2].toLowerCase();
          }
        }
      }

      // Capitalize first letter of ingredient name
      cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();

      cleaned.push({
        name: cleanName,
        quantity: cleanQuantity,
        unit: cleanUnit
      });
    }

    return cleaned.slice(0, 20); // Limit to 20 ingredients
  }

  private static isValidUnit(unit: string): boolean {
    const validUnits = ['cup', 'cups', 'tbsp', 'tsp', 'lb', 'lbs', 'oz', 'g', 'kg', 'ml', 'l', 'cloves', 'clove'];
    return validUnits.includes(unit.toLowerCase());
  }

  private static extractRecipeFromJsonLd(doc: Document): Recipe | null {
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
    
    // Parse ISO 8601 duration (PT30M) or simple numbers
    const match = timeStr.match(/PT?(\d+)M/) || timeStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 30;
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
