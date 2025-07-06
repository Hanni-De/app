"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Download, Mail, LoaderCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import { useAuth } from "@/context/auth-context";
import { getDailyEntries } from "@/lib/firebase/tracker";
import { getUserSettings } from "@/lib/firebase/settings";
import type { DailyTrackerFormValues } from "@/lib/schemas/tracker.schema";
import { format } from 'date-fns';

interface ChartData extends DailyTrackerFormValues {
    id: string; // The date string YYYY-MM-DD
}

const mapMoodToValue = (mood: string) => {
    const moodMap: { [key: string]: number } = {
        'שמח': 5,
        'רגוע': 4,
        'עייף': 3,
        'כועס': 2,
        'חרד': 1,
        'אחר': 3,
    };
    return moodMap[mood] || 0;
};

// Function to process data for charts
const processDataForCharts = (entries: ChartData[]) => {
    return entries.map(entry => ({
        date: format(new Date(entry.id), 'dd/MM'), // Format date as DD/MM
        weight: entry.weight || 0,
        mood: entry.mood ? mapMoodToValue(entry.mood) : 0,
        pain: entry.painLevel,
        water: entry.waterIntake,
    })).reverse(); // Reverse to show oldest to newest
};

export function WeeklyCharts() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchEntries = async () => {
        setIsLoading(true);
        try {
          const entries = await getDailyEntries(user.uid);
          // @ts-ignore
          const processedData = processDataForCharts(entries);
          setChartData(processedData);
        } catch (error) {
          console.error("Failed to fetch chart data:", error);
          toast({
            title: "שגיאה בטעינת הנתונים",
            description: "לא הצלחנו לטעון את היסטוריית המעקב שלך.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchEntries();
    }
  }, [user]);

  const handleExport = () => {
    if (chartData.length === 0) {
        toast({ title: "אין נתונים לייצוא", variant: "destructive" });
        return;
    }
    const headers = "date,weight,mood,pain,water\n";
    const csvContent = headers + chartData.map(row => `${row.date},${row.weight},${row.mood},${row.pain},${row.water}`).join("\n");
    
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
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

  const handleSendEmail = async () => {
    if (!user) {
      toast({ title: "שגיאה", description: "יש להתחבר כדי לשלוח דוחות", variant: "destructive" });
      return;
    }
    setIsSending(true);
    try {
      const settings = await getUserSettings(user.uid);
      if (settings && settings.doctorEmail) {
        // This is a simulation. In a real app, you would trigger a backend function here.
        console.log(`Simulating sending email to ${settings.doctorEmail}`);
        toast({
          title: "הדוח נשלח בהצלחה!",
          description: `הסיכום נשלח למייל: ${settings.doctorEmail}`,
        });
      } else {
        toast({
          title: "לא הוגדרה כתובת מייל",
          description: "יש להגדיר כתובת אימייל של רופא בעמוד ההגדרות.",
          variant: "destructive",
        });
      }
    } catch (error) {
       toast({
          title: "שגיאה",
          description: "אירעה שגיאה בשליחת המייל. נסה שוב מאוחר יותר.",
          variant: "destructive",
        });
    } finally {
      setIsSending(false);
    }
  };


  if (isLoading) {
      return (
          <div className="flex justify-center items-center p-8 min-h-[60vh]">
              <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
          </div>
      )
  }

  if (chartData.length === 0) {
      return (
        <div className="space-y-8">
             <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                <h2 className="text-3xl font-bold font-headline">דוחות ומגמות</h2>
                <p className="text-muted-foreground">ניתוח שינויים וטרנדים לאורך זמן.</p>
                </div>
            </div>
            <div className="text-center p-8 border-2 border-dashed rounded-lg min-h-[50vh] flex flex-col justify-center items-center">
                <h3 className="text-2xl font-bold font-headline">אין עדיין נתונים להצגה</h3>
                <p className="text-muted-foreground">כדי לראות דוחות, יש למלא את המעקב היומי לפחות פעם אחת.</p>
            </div>
        </div>
      )
  }

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
            <Button onClick={handleSendEmail} disabled={isSending}>
                {isSending && <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />}
                <Mail className="ml-2 h-4 w-4" />
                שליחה לרופא
            </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>מגמת משקל</CardTitle>
            <CardDescription>ק"ג לאורך זמן</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis type="number" domain={['dataMin - 1', 'dataMax + 1']} allowDecimals={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="weight" name="משקל" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r:4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>מצב רוח וכאב</CardTitle>
            <CardDescription>סולם 1-10 לאורך זמן</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis type="number" domain={[0, 10]} />
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
            <CardDescription>מספר כוסות מים ביום (מתוך 8)</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-[250px] w-full">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis type="number" domain={[0, 8]} />
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
