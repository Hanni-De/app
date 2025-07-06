"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Download, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";

const mockData = [
  { date: "שבוע 1", weight: 70, mood: 7, pain: 3, water: 6 },
  { date: "שבוע 2", weight: 69.5, mood: 8, pain: 2, water: 8 },
  { date: "שבוע 3", weight: 69.2, mood: 7, pain: 4, water: 7 },
  { date: "שבוע 4", weight: 69, mood: 9, pain: 1, water: 8 },
];

export function WeeklyCharts() {

  const handleExport = () => {
    const headers = "date,weight,mood,pain,water\n";
    const csvContent = headers + mockData.map(row => `${row.date},${row.weight},${row.mood},${row.pain},${row.water}`).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "health_report.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "הורדת הדוח החלה" });
  };

  const handleSendEmail = () => {
    toast({
      title: "הדוח נשלח בהצלחה!",
      description: "הסיכום הדו-שבועי נשלח למייל של הרופא.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline">דוחות ומגמות</h2>
          <p className="text-muted-foreground">ניתוח שינויים וטרנדים לאורך זמן.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
                <Download className="ml-2 h-4 w-4" />
                יצוא ל-CSV
            </Button>
            <Button onClick={handleSendEmail}>
                <Mail className="ml-2 h-4 w-4" />
                שליחה לרופא
            </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>מגמת משקל</CardTitle>
            <CardDescription>ק"ג לאורך 4 שבועות</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <LineChart data={mockData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r:4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>מצב רוח וכאב</CardTitle>
            <CardDescription>סולם 1-10 לאורך 4 שבועות</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <LineChart data={mockData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="mood" name="מצב רוח" stroke="hsl(var(--accent))" strokeWidth={2} />
                <Line type="monotone" dataKey="pain" name="כאב" stroke="hsl(var(--destructive))" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>עמידה ביעד שתיית מים</CardTitle>
            <CardDescription>מספר כוסות מים ביום</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-[250px] w-full">
              <BarChart data={mockData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 8]} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="water" name="כוסות מים" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
