
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface RecipeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  matchFilter: number;
  onMatchFilterChange: (value: number) => void;
}

export const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  searchTerm,
  onSearchChange,
  matchFilter,
  onMatchFilterChange
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search by recipe name, ingredients, or meal type (e.g., breakfast, lunch, dinner)..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="matchFilter" className="whitespace-nowrap">Min Match:</Label>
        <select
          id="matchFilter"
          value={matchFilter}
          onChange={(e) => onMatchFilterChange(parseInt(e.target.value))}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value={0}>Any match</option>
          <option value={50}>50%+ match</option>
          <option value={75}>75%+ match</option>
          <option value={100}>100% match</option>
        </select>
      </div>
    </div>
  );
};
