'use client';

import { db } from './config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export interface Message {
  role: 'user' | 'model';
  text: string;
}

const chatHistoryDocRef = (userId: string) => doc(db!, 'users', userId, 'chat', 'history');

/**
 * Saves the entire chat history for a user.
 * @param userId The ID of the user.
 * @param messages The array of chat messages.
 */
export const saveChatHistory = async (userId: string, messages: Message[]): Promise<void> => {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
  await setDoc(chatHistoryDocRef(userId), {
    messages,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Retrieves the chat history for a user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of messages, or an empty array if not found.
 */
export const getChatHistory = async (userId: string): Promise<Message[]> => {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
  const docSnap = await getDoc(chatHistoryDocRef(userId));
  if (docSnap.exists()) {
    const data = docSnap.data();
    return data.messages || [];
  }
  return [];
};
