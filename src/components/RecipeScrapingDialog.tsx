
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FreeScrapingService } from '@/utils/FreeScrapingService';
import { Recipe } from './RecipeManager';

interface RecipeScrapingDialogProps {
  onRecipeScraped: (recipe: Omit<Recipe, 'id' | 'dateAdded'>) => void;
}

export const RecipeScrapingDialog: React.FC<RecipeScrapingDialogProps> = ({ onRecipeScraped }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedRecipe, setScrapedRecipe] = useState<any>(null);
  const { toast } = useToast();

  const handleScrapeRecipe = async () => {
    if (!url.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a recipe URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await FreeScrapingService.scrapeRecipe(url);
      
      if (result.success && result.recipe) {
        setScrapedRecipe(result.recipe);
        toast({
          title: "Recipe scraped successfully!",
          description: `Found recipe: ${result.recipe.name}`,
        });
      } else {
        toast({
          title: "Scraping failed",
          description: result.error || "Could not extract recipe from the webpage",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scrape recipe",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddScrapedRecipe = () => {
    if (scrapedRecipe) {
      onRecipeScraped(scrapedRecipe);
      setScrapedRecipe(null);
      setUrl('');
      setIsOpen(false);
      toast({
        title: "Recipe added!",
        description: `${scrapedRecipe.name} has been added to your collection`,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Globe className="w-4 h-4 mr-2" />
          Scrape Recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Scrape Recipe from Website
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* URL Input */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Recipe URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/recipe"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-sm text-gray-600 mt-1">
                Enter the URL of any recipe website to automatically extract the recipe details.
              </p>
            </div>
            <Button 
              onClick={handleScrapeRecipe} 
              disabled={isLoading || !url.trim()}
              className="w-full"
            >
              {isLoading ? 'Scraping...' : 'Scrape Recipe'}
            </Button>
          </div>

          {/* Scraped Recipe Preview */}
          {scrapedRecipe && (
            <Card className="border-2 border-green-200">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label>Recipe Name</Label>
                    <Input value={scrapedRecipe.name} readOnly />
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea value={scrapedRecipe.description} readOnly rows={2} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Cooking Time</Label>
                      <Input value={`${scrapedRecipe.cookingTime} minutes`} readOnly />
                    </div>
                    <div>
                      <Label>Servings</Label>
                      <Input value={scrapedRecipe.servings} readOnly />
                    </div>
                  </div>

                  <div>
                    <Label>Ingredients ({scrapedRecipe.ingredients.length})</Label>
                    <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-sm">
                      {scrapedRecipe.ingredients.map((ingredient: any, index: number) => (
                        <div key={index}>
                          {ingredient.quantity} {ingredient.unit} {ingredient.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Instructions ({scrapedRecipe.instructions.length})</Label>
                    <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-sm space-y-1">
                      {scrapedRecipe.instructions.map((instruction: string, index: number) => (
                        <div key={index}>
                          {index + 1}. {instruction}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAddScrapedRecipe} className="w-full">
                    Add This Recipe
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
