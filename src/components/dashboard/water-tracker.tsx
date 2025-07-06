"use client";

import { useState, useEffect } from 'react';
import { GlassWater } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WaterTrackerProps {
  value: number; // Not used to control, but good for form state consistency
  onChange: (value: number) => void;
}

export function WaterTracker({ onChange }: WaterTrackerProps) {
  const [glasses, setGlasses] = useState<number[]>(Array(8).fill(0)); // 0 = empty, 0.5 = half, 1 = full

  const totalCups = glasses.reduce((acc, cup) => acc + cup, 0);

  useEffect(() => {
    onChange(totalCups);
  }, [totalCups, onChange]);

  const handleGlassClick = (index: number) => {
    const newGlasses = [...glasses];
    const currentState = newGlasses[index];
    if (currentState === 0) {
      newGlasses[index] = 0.5;
    } else if (currentState === 0.5) {
      newGlasses[index] = 1;
    } else {
      newGlasses[index] = 0;
    }
    setGlasses(newGlasses);
  };
  
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
