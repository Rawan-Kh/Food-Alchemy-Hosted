
export class IngredientUtils {
  static cleanAndDeduplicateIngredients(ingredients: { name: string; quantity: number; unit: string }[]): { name: string; quantity: number; unit: string }[] {
    const cleaned: { name: string; quantity: number; unit: string }[] = [];
    const seen = new Set<string>();

    for (const ingredient of ingredients) {
      let cleanName = ingredient.name
        .replace(/^(to|and)\s+/i, '')
        .replace(/^\d+\s*(pcs|pieces?)\s*/i, '')
        .replace(/^[\d\s/.]+/, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanName.length < 2) continue;

      const normalizedKey = cleanName.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (seen.has(normalizedKey)) continue;
      seen.add(normalizedKey);

      let cleanQuantity = ingredient.quantity;
      let cleanUnit = ingredient.unit;

      if (cleanQuantity === 1 && cleanUnit === 'pcs') {
        const quantityMatch = ingredient.name.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*(\w+)?/);
        if (quantityMatch) {
          cleanQuantity = this.parseQuantity(quantityMatch[1]);
          if (quantityMatch[2] && this.isValidUnit(quantityMatch[2])) {
            cleanUnit = quantityMatch[2].toLowerCase();
          }
        }
      }

      cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();

      cleaned.push({
        name: cleanName,
        quantity: cleanQuantity,
        unit: cleanUnit
      });
    }

    return cleaned.slice(0, 20);
  }

  private static isValidUnit(unit: string): boolean {
    const validUnits = ['cup', 'cups', 'tbsp', 'tsp', 'lb', 'lbs', 'oz', 'g', 'kg', 'ml', 'l', 'cloves', 'clove'];
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
