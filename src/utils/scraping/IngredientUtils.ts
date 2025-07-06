
export class IngredientUtils {
  static cleanAndDeduplicateIngredients(ingredients: { name: string; quantity: number; unit: string }[]): { name: string; quantity: number; unit: string }[] {
    const cleaned: { name: string; quantity: number; unit: string }[] = [];
    const seen = new Set<string>();

    for (const ingredient of ingredients) {
      let cleanName = this.cleanIngredientName(ingredient.name);
      
      if (cleanName.length < 2) continue;

      const normalizedKey = cleanName.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (seen.has(normalizedKey)) continue;
      seen.add(normalizedKey);

      const { quantity, unit } = this.cleanQuantityAndUnit(ingredient);

      cleaned.push({
        name: cleanName,
        quantity,
        unit
      });
    }

    return cleaned.slice(0, 20);
  }

  private static cleanIngredientName(name: string): string {
    let cleanName = name
      // Remove leading prepositions and conjunctions
      .replace(/^(to|and|or|for|with|of|in|at|on)\s+/i, '')
      // Remove leading quantity indicators that got mixed in
      .replace(/^\d+\s*(pcs|pieces?|cups?|tbsp|tsp|lb|lbs|oz|g|kg|ml|l|cloves?)\s*/i, '')
      // Remove standalone numbers at the beginning
      .replace(/^[\d\s/.,-]+/, '')
      // Remove parenthetical information like (optional), (chopped), etc.
      .replace(/\([^)]*\)/g, '')
      // Remove common cooking instructions mixed into ingredient names
      .replace(/,?\s*(chopped|diced|sliced|minced|grated|fresh|dried|cooked|raw|peeled|stemmed|seeded|crushed|ground).*$/i, '')
      // Remove brand names in brackets
      .replace(/\[[^\]]*\]/g, '')
      // Clean up multiple spaces and trim
      .replace(/\s+/g, ' ')
      .trim();

    // Remove common measurement artifacts
    cleanName = cleanName
      .replace(/^(approx|about|around)\s+/i, '')
      .replace(/\s+(or so|more or less)$/i, '');

    // Capitalize first letter and make rest lowercase for consistency
    if (cleanName.length > 0) {
      cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
    }

    return cleanName;
  }

  private static cleanQuantityAndUnit(ingredient: { name: string; quantity: number; unit: string }): { quantity: number; unit: string } {
    let cleanQuantity = ingredient.quantity;
    let cleanUnit = ingredient.unit;

    // If we have default values, try to extract better ones from the name
    if (cleanQuantity === 1 && cleanUnit === 'pcs') {
      const quantityMatch = ingredient.name.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*(\w+)?/);
      if (quantityMatch) {
        cleanQuantity = this.parseQuantity(quantityMatch[1]);
        if (quantityMatch[2] && this.isValidUnit(quantityMatch[2])) {
          cleanUnit = this.normalizeUnit(quantityMatch[2]);
        }
      }
    }

    // Normalize unit names
    cleanUnit = this.normalizeUnit(cleanUnit);

    return { quantity: cleanQuantity, unit: cleanUnit };
  }

  private static normalizeUnit(unit: string): string {
    const unitMap: { [key: string]: string } = {
      'cup': 'cups',
      'cups': 'cups',
      'tablespoon': 'tbsp',
      'tablespoons': 'tbsp',
      'tbsp': 'tbsp',
      'teaspoon': 'tsp',
      'teaspoons': 'tsp',
      'tsp': 'tsp',
      'pound': 'lbs',
      'pounds': 'lbs',
      'lb': 'lbs',
      'lbs': 'lbs',
      'ounce': 'oz',
      'ounces': 'oz',
      'oz': 'oz',
      'gram': 'g',
      'grams': 'g',
      'g': 'g',
      'kilogram': 'kg',
      'kilograms': 'kg',
      'kg': 'kg',
      'milliliter': 'ml',
      'milliliters': 'ml',
      'ml': 'ml',
      'liter': 'l',
      'liters': 'l',
      'l': 'l',
      'clove': 'cloves',
      'cloves': 'cloves',
      'piece': 'pcs',
      'pieces': 'pcs',
      'pcs': 'pcs'
    };

    const normalizedUnit = unit.toLowerCase().trim();
    return unitMap[normalizedUnit] || normalizedUnit;
  }

  private static isValidUnit(unit: string): boolean {
    const validUnits = [
      'cup', 'cups', 'tbsp', 'tsp', 'lb', 'lbs', 'oz', 'g', 'kg', 
      'ml', 'l', 'cloves', 'clove', 'tablespoon', 'tablespoons',
      'teaspoon', 'teaspoons', 'pound', 'pounds', 'ounce', 'ounces',
      'gram', 'grams', 'kilogram', 'kilograms', 'milliliter', 
      'milliliters', 'liter', 'liters', 'piece', 'pieces', 'pcs'
    ];
    return validUnits.includes(unit.toLowerCase());
  }

  private static parseQuantity(quantityStr: string): number {
    if (quantityStr.includes('/')) {
      const [numerator, denominator] = quantityStr.split('/').map(Number);
      return numerator / denominator;
    }
    
    return parseFloat(quantityStr) || 1;
  }
}
