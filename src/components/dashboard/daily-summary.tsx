"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BotMessageSquare } from "lucide-react";

interface DailySummaryProps {
  motivationalMessage: string;
  score: number;
}

export function DailySummary({ motivationalMessage, score }: DailySummaryProps) {
  return (
    <Card className="bg-accent/30 border-accent shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <BotMessageSquare className="w-6 h-6 text-accent-foreground" />
          הסיכום היומי שלך
        </CardTitle>
        <CardDescription>הציון על עמידה ביעדים להיום הוא <span className="font-bold text-accent-foreground">{score}/100</span></CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-medium text-accent-foreground/90">{motivationalMessage}</p>
      </CardContent>
    </Card>
  );
}
