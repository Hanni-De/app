
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LoaderCircle, Utensils, HeartPulse, Scale, Activity, Smile, Bed, BrainCircuit, NotebookText, Moon } from "lucide-react";
import { dailyTrackerFormSchema, type DailyTrackerFormValues } from "@/lib/schemas/tracker.schema";
import { useAuth } from "@/context/auth-context";
import { saveDailyEntry, saveDailySummary, getDailyEntry } from "@/lib/firebase/tracker";
import { generateMotivationalMessage, type MotivationalMessageInput } from "@/ai/flows/ai-powered-motivation";
import { DailySummary } from "./daily-summary";


export function DailyTrackerForm() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<{ message: string; score: number } | null>(null);
  const [isSummaryGenerated, setIsSummaryGenerated] = useState(false);

  const form = useForm<DailyTrackerFormValues>({
    resolver: zodResolver(dailyTrackerFormSchema),
    defaultValues: {
      waterIntake: 0,
      meals: { breakfast: "", lunch: "", dinner: "", snacks: "" },
      meditations: [
        { performed: false, time: "", duration: 0, oils: "", notes: "" },
        { performed: false, time: "", duration: 0, oils: "", notes: "" },
        { performed: false, time: "", duration: 0, oils: "", notes: "" },
        { performed: false, time: "", duration: 0, oils: "", notes: "" },
      ],
      activity: { performed: false, description: "" },
      probiotic: false,
      elevatedSleep: false,
      weight: null,
      fatigueLevel: 5,
      mood: "רגוע",
      moodNotes: "",
      painLevel: 5,
      movementLimitation: 5,
      menstrualCycle: "na",
      menstrualCycleNotes: "",
      generalNotes: "",
    },
  });

  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const loadTodaysData = async () => {
        const entry = await getDailyEntry(user.uid, today);
        if (entry) {
          // Reset the form with the fetched data.
          // This will populate all the fields.
          form.reset(entry);

          // If a summary exists in the data, update the state
          if (entry.summary) {
            setSummary(entry.summary);
            setIsSummaryGenerated(true);
          }
        }
      };
      loadTodaysData();
    }
  }, [user, form]);

  function calculateCompliance(values: DailyTrackerFormValues): { score: number, dailySummary: string, compliance: any } {
    let score = 0;
    
    // Water (25 points)
    const waterCompliance = values.waterIntake >= 8;
    if (waterCompliance) score += 25;

    // Diet (simple check if at least 3 meals are filled, 25 points)
    const mealsCount = [values.meals.breakfast, values.meals.lunch, values.meals.dinner, values.meals.snacks].filter(Boolean).length;
    const dietCompliance = mealsCount >= 3;
    if (dietCompliance) score += 25;

    // Relaxation (at least one performed, 25 points)
    const relaxationCompliance = values.meditations.some(m => m.performed);
    if (relaxationCompliance) score += 25;

    // Activity (25 points)
    const activityCompliance = values.activity.performed;
    if (activityCompliance) score += 25;

    const compliance = {
        hydrationCompliance: waterCompliance ? 'yes' : (values.waterIntake > 0 ? 'partial' : 'no'),
        dietCompliance: dietCompliance ? 'yes' : (mealsCount > 0 ? 'partial' : 'no'),
        activityCompliance: activityCompliance ? 'yes' : 'no',
        relaxationCompliance: relaxationCompliance ? 'yes' : 'no',
    };

    const dailySummary = `The user achieved their water goal: ${compliance.hydrationCompliance}. They followed their diet: ${compliance.dietCompliance}. They did their relaxation exercises: ${compliance.relaxationCompliance}. They performed physical activity: ${compliance.activityCompliance}. Their final score is ${score}/100.`;

    return { score, dailySummary, compliance };
  }

  async function onSave(values: DailyTrackerFormValues) {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "עליך להתחבר כדי לשמור נתונים.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const entryDate = new Date().toISOString().split('T')[0];
      await saveDailyEntry(user.uid, entryDate, values);

      toast({
        title: "הנתונים נשמרו!",
        description: "השינויים שלך נשמרו בהצלחה.",
      });

    } catch (error) {
      console.error("Data save failed:", error);
      toast({
        title: "שגיאה",
        description: "הייתה בעיה בשמירת הנתונים.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }
  
  async function handleGenerateSummary() {
    if (!user) {
      toast({ title: "שגיאה", description: "עליך להתחבר כדי ליצור סיכום.", variant: "destructive" });
      return;
    }
    
    setIsGenerating(true);

    // Validate and get the latest form values
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "שדות חסרים",
        description: "יש למלא את כל השדות הנדרשים לפני הפקת סיכום.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }
    const values = form.getValues();

    try {
      // Save latest data before generating
      const entryDate = new Date().toISOString().split('T')[0];
      await saveDailyEntry(user.uid, entryDate, values);
      
      const { score, dailySummary, compliance } = calculateCompliance(values);

      const aiInput: MotivationalMessageInput = {
          dailySummary,
          mood: values.mood,
          fatigueLevel: values.fatigueLevel,
          painLevel: values.painLevel,
          ...compliance
      };

      const summaryResponse = await generateMotivationalMessage(aiInput);
      
      const newSummary = { message: summaryResponse.message, score };
      
      await saveDailySummary(user.uid, entryDate, newSummary);
      
      setSummary(newSummary);
      setIsSummaryGenerated(true);

      toast({
        title: "הסיכום מוכן!",
        description: "הסיכום היומי החכם שלך נוצר בהצלחה.",
      });

    } catch (error) {
      console.error("Summary generation failed:", error);
      toast({
        title: "שגיאה",
        description: "הייתה בעיה ביצירת הסיכום. נסו שוב מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }


  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
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
                          <FormField
                            control={form.control}
                            name={`meditations.${index}.performed`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel>האם תרגיל זה בוצע?</FormLabel>
                                </div>
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                              </FormItem>
                            )}
                          />
                          <div className="grid sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name={`meditations.${index}.time`} render={({ field }) => (<FormItem><FormLabel>שעה</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>)} />
                            <FormField control={form.control} name={`meditations.${index}.duration`} render={({ field }) => (<FormItem><FormLabel>משך (דקות)</FormLabel><FormControl><Input type="number" min="0" placeholder="0" {...field} value={field.value ?? ''} /></FormControl></FormItem>)} />
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
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Scale /> משקל (ק"ג)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? null : Number(value));
                            }}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="mood" render={({ field }) => (
                      <FormItem>
                          <FormLabel className="flex items-center gap-2"><Smile/> מצב רוח</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
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

          <div className="flex justify-center items-center gap-4 pt-4">
            <Button type="submit" size="lg" disabled={isSaving || isGenerating}>
                {isSaving && <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />}
                {isSaving ? "שומר..." : "שמור שינויים"}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="default"
              onClick={handleGenerateSummary}
              disabled={isSaving || isGenerating || isSummaryGenerated}
            >
              {(isGenerating) && <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />}
              {isSummaryGenerated ? "הסיכום הופק" : isGenerating ? "יוצר סיכום..." : "הפק סיכום יומי"}
            </Button>
          </div>
        </form>
      </Form>
      <div className="mt-8 space-y-4">
        {isGenerating && (
            <div className="flex items-center justify-center gap-3 text-lg font-semibold text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <LoaderCircle className="w-6 h-6 animate-spin" />
                מייצר סיכום יומי חכם...
            </div>
        )}
        {summary && !isGenerating && (
            <DailySummary motivationalMessage={summary.message} score={summary.score} />
        )}
      </div>
    </div>
  );
}
