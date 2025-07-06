"use client";

import { useState, useEffect } from 'react';
import { GlassWater } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WaterTrackerProps {
  value: number;
  onChange: (value: number) => void;
}

export function WaterTracker({ value = 0, onChange }: WaterTrackerProps) {
  // This state is purely for the visual representation of the glasses.
  const [glasses, setGlasses] = useState<number[]>(Array(8).fill(0));

  // This effect synchronizes the visual `glasses` state with the `value` from the parent form.
  // This is crucial for loading saved data when the form is reset.
  useEffect(() => {
    const newGlasses = Array(8).fill(0);
    let remainingValue = value || 0;
    // We fill the glasses from left to right to represent the total value.
    for (let i = 0; i < 8; i++) {
      if (remainingValue >= 1) {
        newGlasses[i] = 1;
        remainingValue -= 1;
      } else if (remainingValue >= 0.5) {
        newGlasses[i] = 0.5;
        remainingValue = 0;
      }
    }
    setGlasses(newGlasses);
  }, [value]); // This runs only when the `value` prop from the parent form changes.

  const handleGlassClick = (index: number) => {
    // We create a temporary copy of the current visual state to modify it.
    const newGlasses = [...glasses];
    const currentState = newGlasses[index];
    
    if (currentState === 0) {
      newGlasses[index] = 0.5;
    } else if (currentState === 0.5) {
      newGlasses[index] = 1;
    } else {
      newGlasses[index] = 0;
    }
    
    // Calculate the new total from our temporary array and report it up to the parent form.
    // The parent form will update the `value` prop, and the useEffect will re-sync the view.
    const newTotal = newGlasses.reduce((acc, cup) => acc + cup, 0);
    onChange(newTotal);
  };
  
  // The displayed total is always taken directly from the form's value for consistency.
  const totalCups = value;
  const isGoalMet = totalCups >= 8;

  return (
    <Card className="shadow-md overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 font-headline">
                  <GlassWater className="w-6 h-6 text-primary" />
                  מעקב שתיית מים
              </CardTitle>
              <CardDescription>
                  לחצו על כוס כדי לסמן חצי, ולחיצה נוספת למילוי מלא. היעד הוא 2 ליטר.
              </CardDescription>
            </div>
            <Badge variant={isGoalMet ? "default" : "secondary"} className={cn("text-lg", isGoalMet && "bg-accent text-accent-foreground shadow")}>
                {totalCups} / 8
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div dir="ltr" className="grid grid-cols-8 gap-2 md:gap-4 justify-center">
          {glasses.map((level, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleGlassClick(index)}
              className={cn(
                'relative flex items-center justify-center p-1 rounded-lg transition-all duration-300 ease-in-out aspect-[2/3] focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              aria-label={`כוס ${index + 1}: ${level === 1 ? 'מלאה' : level === 0.5 ? 'חצי מלאה' : 'ריקה'}`}
            >
                <GlassWater className="w-full h-full text-muted/30" />
                <div className="absolute bottom-0 left-0 w-full h-full transition-all duration-300" 
                    style={{
                        clipPath: `inset(${100 - level * 100}% 0 0 0)`,
                    }}>
                    <GlassWater className="w-full h-full text-primary" />
                </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
