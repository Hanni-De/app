"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { saveUserSettings, getUserSettings } from "@/lib/firebase/settings";
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
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LoaderCircle } from "lucide-react";

const emailSettingsFormSchema = z.object({
  userEmail: z.string().email({
    message: "כתובת אימייל לא תקינה.",
  }),
  doctorEmail: z.string().email({
    message: "כתובת אימייל לא תקינה.",
  }).optional().or(z.literal('')),
  reportFrequency: z.enum(["daily", "weekly", "never"]),
});

type EmailSettingsFormValues = z.infer<typeof emailSettingsFormSchema>;

export function EmailSettingsForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<EmailSettingsFormValues>({
    resolver: zodResolver(emailSettingsFormSchema),
    defaultValues: {
      userEmail: user?.email || "",
      doctorEmail: "",
      reportFrequency: "weekly",
    },
  });

  useEffect(() => {
    if (user) {
      setIsFetching(true);
      getUserSettings(user.uid)
        .then((settings) => {
          if (settings) {
            form.reset({
              userEmail: settings.userEmail || user.email || "",
              doctorEmail: settings.doctorEmail || "",
              reportFrequency: settings.reportFrequency || "weekly",
            });
          } else {
             form.reset({
              userEmail: user.email || "",
              doctorEmail: "",
              reportFrequency: "weekly",
            });
          }
        })
        .catch(console.error)
        .finally(() => setIsFetching(false));
    }
  }, [user, form]);


  async function onSubmit(data: EmailSettingsFormValues) {
    if (!user) {
      toast({ title: "שגיאה", description: "עליך להתחבר כדי לשמור הגדרות.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await saveUserSettings(user.uid, data);
      toast({
        title: "ההגדרות נשמרו בהצלחה!",
        description: "העדפות המייל שלך עודכנו.",
      });
    } catch (error) {
      toast({ title: "שגיאה בשמירת ההגדרות", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (isFetching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>הגדרות דוא"ל</CardTitle>
          <CardDescription>הגדירו כאן את כתובות המייל לקבלת סיכומים.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
            <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>הגדרות דוא"ל</CardTitle>
            <CardDescription>הגדירו כאן את כתובות המייל לקבלת סיכומים.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>האימייל שלך</FormLabel>
                    <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                        לכאן יישלחו הסיכומים היומיים/שבועיים שלך.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="doctorEmail"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>אימייל של רופא/מטפל (אופציונלי)</FormLabel>
                    <FormControl>
                        <Input placeholder="doctor.email@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                        לכאן ניתן יהיה לשלוח את הדוחות השבועיים.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="reportFrequency"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>תדירות קבלת דוח אישי</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="בחרי תדירות..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="daily">יומי</SelectItem>
                                <SelectItem value="weekly">שבועי</SelectItem>
                                <SelectItem value="never">אף פעם</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>
                          הערה: שליחת המיילים האוטומטית היא תכונה עתידית.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />}
                    שמירת שינויים
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>

  );
}
