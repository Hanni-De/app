import { z } from 'zod';

export const dailyTrackerFormSchema = z.object({
  waterIntake: z.number().min(0).max(8).default(0),
  meals: z.object({
    breakfast: z.string().optional(),
    lunch: z.string().optional(),
    dinner: z.string().optional(),
    snacks: z.string().optional(),
  }),
  meditations: z.array(
    z.object({
      performed: z.boolean().default(false),
      time: z.string().optional(),
      duration: z.coerce.number().min(0).optional(),
      oils: z.string().optional(),
      notes: z.string().optional(),
    })
  ).default([
    { performed: false, time: "", duration: 0, oils: "", notes: "" },
    { performed: false, time: "", duration: 0, oils: "", notes: "" },
    { performed: false, time: "", duration: 0, oils: "", notes: "" },
    { performed: false, time: "", duration: 0, oils: "", notes: "" }
  ]),
  activity: z.object({
    performed: z.boolean().default(false),
    description: z.string().optional(),
  }),
  probiotic: z.boolean().default(false),
  elevatedSleep: z.boolean().default(false),
  weight: z.number().nullable(),
  fatigueLevel: z.number().min(1).max(10).default(5),
  mood: z.string().min(1, "יש לבחור מצב רוח"),
  moodNotes: z.string().optional(),
  painLevel: z.number().min(1).max(10).default(5),
  movementLimitation: z.number().min(1).max(10).default(5),
  menstrualCycle: z.enum(["yes", "no", "na"]).default("na"),
  menstrualCycleNotes: z.string().optional(),
  generalNotes: z.string().optional(),
});

export type DailyTrackerFormValues = z.infer<typeof dailyTrackerFormSchema>;
