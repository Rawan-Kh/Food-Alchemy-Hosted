
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { List, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FreeScrapingService } from '@/utils/FreeScrapingService';
import { Recipe } from './RecipeManager';

interface BatchRecipeScrapingDialogProps {
  onRecipesScraped: (recipes: Omit<Recipe, 'id' | 'dateAdded'>[]) => void;
}

interface ScrapingResult {
  url: string;
  status: 'pending' | 'success' | 'error';
  recipe?: any;
  error?: string;
}

export const BatchRecipeScrapingDialog: React.FC<BatchRecipeScrapingDialogProps> = ({ onRecipesScraped }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [urlList, setUrlList] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ScrapingResult[]>([]);
  const { toast } = useToast();

  const parseUrls = (text: string): string[] => {
    return text
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && (url.startsWith('http://') || url.startsWith('https://')));
  };

  const handleBatchScrape = async () => {
    const urls = parseUrls(urlList);
    
    if (urls.length === 0) {
      toast({
        title: "No valid URLs found",
        description: "Please enter at least one valid URL (starting with http:// or https://)",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const initialResults: ScrapingResult[] = urls.map(url => ({
      url,
      status: 'pending' as const
    }));
    setResults(initialResults);

    toast({
      title: "Starting batch scraping",
      description: `Processing ${urls.length} URLs...`,
    });

    const finalResults: ScrapingResult[] = [];

    // Process URLs one by one to avoid overwhelming the proxies
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      try {
        console.log(`Scraping URL ${i + 1}/${urls.length}: ${url}`);
        const result = await FreeScrapingService.scrapeRecipe(url);
        
        if (result.success && result.recipe) {
          finalResults.push({
            url,
            status: 'success',
            recipe: result.recipe
          });
          
          // Update results in real-time
          setResults(prev => prev.map(r => 
            r.url === url 
              ? { ...r, status: 'success', recipe: result.recipe }
              : r
          ));
        } else {
          finalResults.push({
            url,
            status: 'error',
            error: result.error || 'Failed to scrape recipe'
          });
          
          setResults(prev => prev.map(r => 
            r.url === url 
              ? { ...r, status: 'error', error: result.error || 'Failed to scrape recipe' }
              : r
          ));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        finalResults.push({
          url,
          status: 'error',
          error: errorMessage
        });
        
        setResults(prev => prev.map(r => 
          r.url === url 
            ? { ...r, status: 'error', error: errorMessage }
            : r
        ));
      }

      // Add a small delay between requests to be respectful to proxy services
      if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsProcessing(false);

    const successfulRecipes = finalResults
      .filter(r => r.status === 'success' && r.recipe)
      .map(r => r.recipe);

    const successCount = successfulRecipes.length;
    const failureCount = finalResults.length - successCount;

    toast({
      title: "Batch scraping completed",
      description: `${successCount} recipes scraped successfully, ${failureCount} failed`,
    });
  };

  const handleAddAllSuccessfulRecipes = () => {
    const successfulRecipes = results
      .filter(r => r.status === 'success' && r.recipe)
      .map(r => r.recipe);

    if (successfulRecipes.length > 0) {
      onRecipesScraped(successfulRecipes);
      setResults([]);
      setUrlList('');
      setIsOpen(false);
      toast({
        title: "Recipes added!",
        description: `${successfulRecipes.length} recipes have been added to your collection`,
      });
    }
  };

  const urlCount = parseUrls(urlList).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <List className="w-4 h-4 mr-2" />
          Batch Scrape
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Batch Recipe Scraper
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="urlList">Recipe URLs (one per line)</Label>
                  <Textarea
                    id="urlList"
                    placeholder="https://example.com/recipe1&#10;https://example.com/recipe2&#10;https://example.com/recipe3"
                    value={urlList}
                    onChange={(e) => setUrlList(e.target.value)}
                    rows={8}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Enter multiple recipe URLs, one per line. {urlCount > 0 && `Found ${urlCount} valid URLs.`}
                  </p>
                </div>
                <Button 
                  onClick={handleBatchScrape} 
                  disabled={isProcessing || urlCount === 0}
                  className="w-full"
                >
                  {isProcessing ? 'Processing...' : `Scrape ${urlCount} Recipe${urlCount !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Display */}
          {results.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Scraping Results</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {results.filter(r => r.status === 'success').length} Success
                      </Badge>
                      <Badge variant="outline" className="text-red-600">
                        <XCircle className="w-3 h-3 mr-1" />
                        {results.filter(r => r.status === 'error').length} Failed
                      </Badge>
                      <Badge variant="outline" className="text-yellow-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {results.filter(r => r.status === 'pending').length} Pending
                      </Badge>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {results.map((result, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded">
                        {result.status === 'success' && (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        )}
                        {result.status === 'error' && (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                        {result.status === 'pending' && (
                          <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 animate-spin" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{result.url}</p>
                          {result.status === 'success' && result.recipe && (
                            <p className="text-sm text-green-600">{result.recipe.name}</p>
                          )}
                          {result.status === 'error' && (
                            <p className="text-sm text-red-600">{result.error}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {results.some(r => r.status === 'success') && !isProcessing && (
                    <Button onClick={handleAddAllSuccessfulRecipes} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Add All Successful Recipes ({results.filter(r => r.status === 'success').length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
