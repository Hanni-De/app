'use client';

import { db } from './config';
import { doc, setDoc, getDoc, collection, query, orderBy, getDocs, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: Timestamp;
}

const chatsCollectionRef = (userId: string) => collection(db!, 'users', userId, 'chats');
const chatDocRef = (userId: string, chatId: string) => doc(db!, 'users', userId, 'chats', chatId);


/**
 * Saves messages to a chat session. If chatId is null, creates a new session.
 * @param userId The ID of the user.
 * @param chatId The ID of the chat session, or null to create a new one.
 * @param messages The array of chat messages.
 * @returns The ID of the saved chat session (new or existing).
 */
export const saveMessages = async (userId: string, chatId: string | null, messages: Message[]): Promise<string> => {
  if (!db) throw new Error("Firestore is not initialized.");
  
  const now = serverTimestamp();
  
  if (chatId) {
    // Update existing chat
    const ref = chatDocRef(userId, chatId);
    await setDoc(ref, { messages, updatedAt: now }, { merge: true });
    return chatId;
  } else {
    // Create new chat
    const firstUserMessage = messages.find(m => m.role === 'user')?.text || 'New Chat';
    const title = firstUserMessage.substring(0, 40) + (firstUserMessage.length > 40 ? '...' : '');
    
    const ref = await addDoc(chatsCollectionRef(userId), {
      title,
      messages,
      createdAt: now,
      updatedAt: now,
    });
    return ref.id;
  }
};

/**
 * Retrieves the messages for a specific chat session.
 * @param userId The ID of the user.
 * @param chatId The ID of the chat session.
 * @returns A promise that resolves to an array of messages, or an empty array if not found.
 */
export const getMessages = async (userId: string, chatId: string): Promise<Message[]> => {
  if (!db) throw new Error("Firestore is not initialized.");

  const docSnap = await getDoc(chatDocRef(userId, chatId));
  if (docSnap.exists()) {
    return docSnap.data().messages || [];
  }
  return [];
};


/**
 * Retrieves the list of chat sessions for a user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of ChatSession objects.
 */
export const getChatSessions = async (userId: string): Promise<ChatSession[]> => {
    if (!db) throw new Error("Firestore is not initialized.");

    const q = query(chatsCollectionRef(userId), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || 'Untitled Chat',
        updatedAt: doc.data().updatedAt,
    }));
};