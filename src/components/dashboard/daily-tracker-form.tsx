"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WaterTracker } from "./water-tracker";
import { Slider } from "../ui/slider";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { generateMotivationalMessage, MotivationalMessageInput } from "@/ai/flows/ai-powered-motivation";
import { useState } from "react";
import { DailySummary } from "./daily-summary";
import { Separator } from "../ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LoaderCircle, Utensils, Droplets, HeartPulse, Scale, Activity, Smile, Bed, BrainCircuit, NotebookText, Sparkles, Moon } from "lucide-react";

const formSchema = z.object({
  waterIntake: z.number().min(0).max(8).default(0),
  meals: z.object({
    breakfast: z.string().optional(),
    lunch: z.string().optional(),
    dinner: z.string().optional(),
    snacks: z.string().optional(),
  }),
  meditations: z.array(
    z.object({
      time: z.string().optional(),
      duration: z.coerce.number().min(0).optional(),
      oils: z.string().optional(),
      notes: z.string().optional(),
    })
  ).default([
    { time: "", duration: 0, oils: "", notes: "" },
    { time: "", duration: 0, oils: "", notes: "" },
    { time: "", duration: 0, oils: "", notes: "" },
    { time: "", duration: 0, oils: "", notes: "" }
  ]),
  activity: z.object({
    performed: z.boolean().default(false),
    description: z.string().optional(),
  }),
  probiotic: z.boolean().default(false),
  elevatedSleep: z.boolean().default(false),
  weight: z.coerce.number().optional(),
  fatigueLevel: z.number().min(1).max(10).default(5),
  mood: z.string().min(1, "יש לבחור מצב רוח"),
  moodNotes: z.string().optional(),
  painLevel: z.number().min(1).max(10).default(5),
  movementLimitation: z.number().min(1).max(10).default(5),
  menstrualCycle: z.enum(["yes", "no", "na"]).default("na"),
  menstrualCycleNotes: z.string().optional(),
  generalNotes: z.string().optional(),
});

export function DailyTrackerForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<{ message: string; score: number } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      waterIntake: 0,
      meals: { breakfast: "", lunch: "", dinner: "", snacks: "" },
      meditations: [
        { time: "", duration: 0, oils: "", notes: "" },
        { time: "", duration: 0, oils: "", notes: "" },
        { time: "", duration: 0, oils: "", notes: "" },
        { time: "", duration: 0, oils: "", notes: "" },
      ],
      activity: { performed: false, description: "" },
      probiotic: false,
      elevatedSleep: false,
      fatigueLevel: 5,
      painLevel: 5,
      movementLimitation: 5,
      menstrualCycle: "na",
      menstrualCycleNotes: "",
      generalNotes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSummary(null);

    // Calculate compliance automatically
    const hydrationCompliance = values.waterIntake >= 8 ? 'yes' : values.waterIntake > 0 ? 'partial' : 'no';
    
    const mealsEatenCount = [values.meals.breakfast, values.meals.lunch, values.meals.dinner].filter(m => m && m.trim() !== "").length;
    const dietCompliance = mealsEatenCount >= 3 ? 'yes' : mealsEatenCount > 0 ? 'partial' : 'no';

    const activityCompliance = values.activity.performed ? 'yes' : 'no';

    const meditationsDoneCount = values.meditations.filter(m => m.duration && m.duration > 0).length;
    // Assuming the goal is at least 2 meditation sessions for 'yes'
    const relaxationCompliance = meditationsDoneCount >= 2 ? 'yes' : meditationsDoneCount > 0 ? 'partial' : 'no';

    const complianceScore = 
      (hydrationCompliance === 'yes' ? 25 : hydrationCompliance === 'partial' ? 12.5 : 0) +
      (dietCompliance === 'yes' ? 25 : dietCompliance === 'partial' ? 12.5 : 0) +
      (activityCompliance === 'yes' ? 25 : 0) +
      (relaxationCompliance === 'yes' ? 25 : relaxationCompliance === 'partial' ? 12.5 : 0);
    
    const dailySummary = `
      User feels ${values.mood}. Fatigue: ${values.fatigueLevel}/10, Pain: ${values.painLevel}/10.
      Compliance Score: ${Math.round(complianceScore)}/100.
      Hydration: ${hydrationCompliance} (${values.waterIntake}/8 glasses).
      Diet: ${dietCompliance}. Breakfast: ${values.meals.breakfast || 'N/A'}. Lunch: ${values.meals.lunch || 'N/A'}. Dinner: ${values.meals.dinner || 'N/A'}. Snacks: ${values.meals.snacks || 'N/A'}.
      Activity: ${activityCompliance}. Details: ${values.activity.description || 'N/A'}.
      Relaxation: ${relaxationCompliance}. ${meditationsDoneCount} sessions logged.
      General Notes: ${values.generalNotes || 'N/A'}
    `;

    try {
      const aiInput: MotivationalMessageInput = {
        dailySummary,
        mood: values.mood,
        fatigueLevel: values.fatigueLevel,
        painLevel: values.painLevel,
        hydrationCompliance: hydrationCompliance,
        dietCompliance: dietCompliance,
        activityCompliance: activityCompliance,
        relaxationCompliance: relaxationCompliance,
      };

      const result = await generateMotivationalMessage(aiInput);
      setSummary({ message: result.message, score: Math.round(complianceScore) });
      toast({
        title: "הסיכום שלך מוכן!",
        description: "גללו מטה כדי לראות את ההודעה המותאמת אישית.",
      });

    } catch (error) {
      console.error("AI message generation failed:", error);
      toast({
        title: "שגיאה",
        description: "הייתה בעיה ביצירת ההודעה. נסו שוב מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="waterIntake"
          render={({ field }) => (
            <FormItem>
              <WaterTracker value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Utensils className="text-primary"/> תזונה</CardTitle>
                <CardDescription>פרטי מה אכלת בכל ארוחה.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <FormField control={form.control} name="meals.breakfast" render={({ field }) => (<FormItem><FormLabel>ארוחת בוקר</FormLabel><FormControl><Textarea placeholder="מה אכלתי..." {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="meals.lunch" render={({ field }) => (<FormItem><FormLabel>ארוחת צהריים</FormLabel><FormControl><Textarea placeholder="מה אכלתי..." {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="meals.dinner" render={({ field }) => (<FormItem><FormLabel>ארוחת ערב</FormLabel><FormControl><Textarea placeholder="מה אכלתי..." {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name="meals.snacks" render={({ field }) => (<FormItem><FormLabel>נשנושים</FormLabel><FormControl><Textarea placeholder="מה אכלתי..." {...field} /></FormControl></FormItem>)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-primary"/> הרפיה ורוגע</CardTitle>
                <CardDescription>פרטי את תרגילי ההרפיה שביצעת.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Accordion type="multiple" className="w-full">
                  {[...Array(4)].map((_, index) => (
                    <AccordionItem value={`item-${index + 1}`} key={index}>
                      <AccordionTrigger>תרגיל הרפיה {index + 1}</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField control={form.control} name={`meditations.${index}.time`} render={({ field }) => (<FormItem><FormLabel>שעה</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>)} />
                          <FormField control={form.control} name={`meditations.${index}.duration`} render={({ field }) => (<FormItem><FormLabel>משך (דקות)</FormLabel><FormControl><Input type="number" min="0" placeholder="0" {...field} /></FormControl></FormItem>)} />
                        </div>
                        <FormField control={form.control} name={`meditations.${index}.oils`} render={({ field }) => (<FormItem><FormLabel>שמנים אתריים</FormLabel><FormControl><Input placeholder="שילוב שמנים..." {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name={`meditations.${index}.notes`} render={({ field }) => (<FormItem><FormLabel>הערות</FormLabel><FormControl><Textarea placeholder="איך הרגשתי..." {...field} /></FormControl></FormItem>)} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><HeartPulse className="text-primary"/> מדדים גופניים</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Scale/> משקל (ק"ג)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="0.0" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="mood" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="flex items-center gap-2"><Smile/> מצב רוח</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="בחרי מצב רוח..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="שמח">שמח</SelectItem>
                                <SelectItem value="רגוע">רגוע</SelectItem>
                                <SelectItem value="עייף">עייף</SelectItem>
                                <SelectItem value="כועס">כועס</SelectItem>
                                <SelectItem value="חרד">חרד</SelectItem>
                                <SelectItem value="אחר">אחר</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormField control={form.control} name="moodNotes" render={({ field }) => (<FormControl><Input placeholder="פירוט נוסף (אופציונלי)" {...field} /></FormControl>)} />
                    </FormItem>
                )} />
                <FormField control={form.control} name="fatigueLevel" render={({ field }) => (<FormItem><FormLabel className="flex items-center gap-2"><Bed/> רמת עייפות: {field.value}</FormLabel><FormControl><Slider dir="ltr" defaultValue={[5]} min={1} max={10} step={1} onValueChange={(v) => field.onChange(v[0])} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="painLevel" render={({ field }) => (<FormItem><FormLabel>רמת כאבים בפרקים: {field.value}</FormLabel><FormControl><Slider dir="ltr" defaultValue={[5]} min={1} max={10} step={1} onValueChange={(v) => field.onChange(v[0])} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="movementLimitation" render={({ field }) => (<FormItem><FormLabel>רמת מוגבלות בתנועה: {field.value}</FormLabel><FormControl><Slider dir="ltr" defaultValue={[5]} min={1} max={10} step={1} onValueChange={(v) => field.onChange(v[0])} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="menstrualCycle" render={({ field }) => (
                    <FormItem>
                        <FormLabel>שיבושים במחזור</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                <FormItem className="flex items-center space-x-2 space-x-reverse space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel>כן</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-x-reverse space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel>לא</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-x-reverse space-y-0"><FormControl><RadioGroupItem value="na" /></FormControl><FormLabel>אין מחזור</FormLabel></FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormField control={form.control} name="menstrualCycleNotes" render={({ field }) => (<FormControl><Input placeholder="פירוט נוסף (אופציונלי)" {...field} /></FormControl>)} />
                    </FormItem>
                )} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="text-primary"/> פעילות גופנית</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="activity.performed" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel>האם ביצעת פעילות גופנית היום?</FormLabel>
                        </div>
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                )} />
                <FormField control={form.control} name="activity.description" render={({ field }) => (<FormItem><FormLabel>פירוט הפעילות</FormLabel><FormControl><Textarea placeholder="איזו פעילות, כמה זמן, ואיך הרגשתי..." {...field} /></FormControl></FormItem>)} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Moon className="text-primary"/> הרגלי לילה</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <FormField control={form.control} name="probiotic" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>לקיחת פרוביוטיקה לפני השינה</FormLabel></div><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                 <FormField control={form.control} name="elevatedSleep" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>שינה בהגבהה</FormLabel></div><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
            </CardContent>
        </Card>
        
        <FormField control={form.control} name="generalNotes" render={({ field }) => (<FormItem><FormLabel className="text-lg flex items-center gap-2"><NotebookText/>הערות כלליות</FormLabel><FormControl><Textarea placeholder="מקום למחשבות, תחושות וכל מה שתרצי לשתף..." {...field} /></FormControl></FormItem>)} />

        <div className="flex justify-center pt-4">
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading && <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />}
            {isLoading ? "מעבד נתונים..." : "יצירת סיכום יומי"}
          </Button>
        </div>

        {summary && (
            <div className="pt-8">
                <Separator className="my-8"/>
                <DailySummary motivationalMessage={summary.message} score={summary.score} />
            </div>
        )}
      </form>
    </Form>
  );
}
