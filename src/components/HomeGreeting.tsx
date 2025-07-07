import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
export const HomeGreeting: React.FC = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };
  return <Card className="bg-gradient-to-r from-orange-500 to-green-500 text-white">
      <CardContent className="pt-6 bg-orange-500 rounded-3xl">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">{getGreeting()}!</h1>
            <p className="text-orange-100">Ready to cook something delicious?</p>
          </div>
        </div>
      </CardContent>
    </Card>;
};