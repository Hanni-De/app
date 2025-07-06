import { db } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface EmailSettings {
  userEmail: string;
  doctorEmail?: string;
  reportFrequency: 'daily' | 'weekly' | 'never';
}

const settingsDocRef = (userId: string) => doc(db!, 'users', userId, 'settings', 'email');

/**
 * Saves or updates the user's email settings in Firestore.
 * @param userId The ID of the user.
 * @param settings The email settings object.
 */
export const saveUserSettings = async (userId: string, settings: EmailSettings): Promise<void> => {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
  await setDoc(settingsDocRef(userId), settings, { merge: true });
};

/**
 * Retrieves the user's email settings from Firestore.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the user's settings object, or null if not found.
 */
export const getUserSettings = async (userId: string): Promise<EmailSettings | null> => {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
  const docSnap = await getDoc(settingsDocRef(userId));
  if (docSnap.exists()) {
    return docSnap.data() as EmailSettings;
  }
  return null;
};
