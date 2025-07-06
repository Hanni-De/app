'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getChatSessions, type ChatSession } from '@/lib/firebase/chat';
import { ChatInterface } from '@/components/coach/chat-interface';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoaderCircle, MessageSquarePlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function CoachPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | 'new'>('new');
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async (userId: string) => {
    try {
      const chatSessions = await getChatSessions(userId);
      setSessions(chatSessions);
      // If the current view is a new chat, but sessions exist, select the most recent one.
      if (activeChatId === 'new' && chatSessions.length > 0) {
        setActiveChatId(chatSessions[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch chat sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        setIsLoading(true);
        fetchSessions(user.uid);
    }
  }, [user]);

  const handleNewChat = () => {
    setActiveChatId('new');
  };
  
  const handleChatCreated = (newChatId: string) => {
    if (user) {
      // Refetch the list to include the new chat, then set it as active.
      fetchSessions(user.uid).then(() => {
         setActiveChatId(newChatId);
      });
    }
  };

  return (
    <div className="grid md:grid-cols-[300px_1fr] h-[calc(100vh-65px)] border-t">
      <aside className="hidden md:flex flex-col border-l bg-muted/20">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">שיחות קודמות</h2>
            <Button variant="ghost" size="icon" onClick={handleNewChat} aria-label="New Chat">
              <MessageSquarePlus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <LoaderCircle className="animate-spin text-primary" />
              </div>
            ) : (
                sessions.length > 0 ? (
                    sessions.map((session) => (
                        <button
                        key={session.id}
                        onClick={() => setActiveChatId(session.id)}
                        className={cn(
                            "w-full text-right p-3 rounded-lg transition-colors flex flex-col items-start gap-1",
                            activeChatId === session.id ? 'bg-accent/80' : 'hover:bg-accent/50'
                        )}
                        >
                        <p className="font-semibold text-sm truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                            {session.updatedAt ? formatDistanceToNow(session.updatedAt.toDate(), { addSuffix: true, locale: he }) : ''}
                        </p>
                        </button>
                    ))
                ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">אין שיחות קודמות.</div>
                )
            )}
          </div>
        </ScrollArea>
      </aside>
      
      <main className="flex flex-col h-full bg-background">
         <ChatInterface 
            key={activeChatId}
            chatId={activeChatId === 'new' ? null : activeChatId}
            onChatCreated={handleChatCreated}
         />
      </main>
    </div>
  );
}