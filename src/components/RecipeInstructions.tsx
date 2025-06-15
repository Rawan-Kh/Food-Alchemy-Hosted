
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface RecipeInstructionsProps {
  instructions: string[];
}

export const RecipeInstructions: React.FC<RecipeInstructionsProps> = ({ instructions }) => {
  if (instructions.length === 0) return null;

  return (
    <AccordionItem value="instructions">
      <AccordionTrigger className="text-sm font-medium">
        Instructions ({instructions.length})
      </AccordionTrigger>
      <AccordionContent>
        <ol className="text-sm space-y-2">
          {instructions.map((instruction, index) => (
            <li key={index} className="flex gap-2">
              <span className="font-medium text-gray-500 min-w-[20px]">{index + 1}.</span>
              <span>{instruction}</span>
            </li>
          ))}
        </ol>
      </AccordionContent>
    </AccordionItem>
  );
};
