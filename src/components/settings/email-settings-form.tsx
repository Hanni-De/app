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
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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

const defaultValues: Partial<EmailSettingsFormValues> = {
  userEmail: "",
  doctorEmail: "",
  reportFrequency: "weekly",
};

export function EmailSettingsForm() {
  const form = useForm<EmailSettingsFormValues>({
    resolver: zodResolver(emailSettingsFormSchema),
    defaultValues,
  });

  function onSubmit(data: EmailSettingsFormValues) {
    toast({
      title: "ההגדרות נשמרו בהצלחה!",
      description: "העדפות המייל שלך עודכנו.",
    });
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
                        לכאן יישלח סיכום דו-שבועי, במידה והכתובת מוגדרת.
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <Button type="submit">שמירת שינויים</Button>
            </form>
            </Form>
        </CardContent>
    </Card>

  );
}
