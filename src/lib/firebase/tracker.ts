import { db } from './config';
import { doc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, getDoc } from 'firebase/firestore';
import type { DailyTrackerFormValues } from '@/lib/schemas/tracker.schema';

interface DailyEntryData extends DailyTrackerFormValues {
  summary?: {
    message: string;
    score: number;
  };
  createdAt?: any;
  updatedAt?: any;
}

interface DailyEntry extends DailyEntryData {
  id: string; 
}

/**
 * Saves or updates a daily health tracking entry for a specific user to Firestore.
 * The document ID is the date in YYYY-MM-DD format to ensure one entry per day.
 * Uses { merge: true } to allow partial updates throughout the day.
 * @param userId The ID of the user.
 * @param date The date of the entry in 'YYYY-MM-DD' format.
 * @param data The data from the daily tracker form.
 */
export const saveDailyEntry = async (
    userId: string,
    date: string,
    data: DailyTrackerFormValues
) => {
    if (!db) {
        throw new Error("Firestore is not initialized.");
    }

    const entryRef = doc(db, 'users', userId, 'dailyEntries', date);
    
    const docSnap = await getDoc(entryRef);

    const entryData = {
        ...data,
        updatedAt: serverTimestamp(),
    };

    if (docSnap.exists()) {
        await setDoc(entryRef, entryData, { merge: true });
    } else {
        await setDoc(entryRef, { ...entryData, createdAt: serverTimestamp() }, { merge: true });
    }
};

/**
 * Saves the AI-generated daily summary for a specific entry.
 * @param userId The ID of the user.
 * @param date The date of the entry in 'YYYY-MM-DD' format.
 * @param summary The summary object containing the message and score.
 */
export const saveDailySummary = async (
    userId: string,
    date: string,
    summary: { message: string; score: number }
) => {
    if (!db) {
        throw new Error("Firestore is not initialized.");
    }
    const entryRef = doc(db, 'users', userId, 'dailyEntries', date);
    await setDoc(entryRef, { summary }, { merge: true });
};


/**
 * Fetches all daily entries for a specific user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of daily entries.
 */
export const getDailyEntries = async (userId: string): Promise<DailyEntry[]> => {
    if (!db) {
        throw new Error("Firestore is not initialized.");
    }
    const entries: DailyEntry[] = [];
    const q = query(collection(db, 'users', userId, 'dailyEntries'), orderBy('__name__', 'desc'));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() } as DailyEntry);
    });
    return entries;
};
