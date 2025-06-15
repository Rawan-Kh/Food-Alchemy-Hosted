
import { Recipe } from '@/components/RecipeManager';
import { ProxyService } from './scraping/ProxyService';
import { JsonLdParser } from './scraping/JsonLdParser';
import { HtmlParser } from './scraping/HtmlParser';
import { IngredientUtils } from './scraping/IngredientUtils';

export class FreeScrapingService {
  static async scrapeRecipe(url: string): Promise<{ success: boolean; recipe?: Omit<Recipe, 'id' | 'dateAdded'>; error?: string }> {
    try {
      console.log('Scraping recipe from URL:', url);
      
      const html = await ProxyService.tryAllProxies(url);
      
      if (!html) {
        return { 
          success: false, 
          error: 'All proxy services failed. The website may be blocking requests or the recipe format is not supported.' 
        };
      }

      const recipe = this.parseRecipeFromHTML(html, url);
      
      if (recipe) {
        console.log('Successfully scraped recipe:', recipe.name);
        recipe.ingredients = IngredientUtils.cleanAndDeduplicateIngredients(recipe.ingredients);
        return { success: true, recipe };
      }
      
      return { success: false, error: 'Could not extract recipe from the webpage' };
    } catch (error) {
      console.error('Error during recipe scraping:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape recipe' 
      };
    }
  }

  private static parseRecipeFromHTML(html: string, url: string): Omit<Recipe, 'id' | 'dateAdded'> | null {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // First try JSON-LD structured data
    const jsonLdRecipe = JsonLdParser.extractRecipeFromJsonLd(doc);
    if (jsonLdRecipe) {
      return { ...jsonLdRecipe, source: url };
    }
    
    // Fallback to HTML parsing
    return HtmlParser.parseRecipeFromHTML(html, url);
  }
}
