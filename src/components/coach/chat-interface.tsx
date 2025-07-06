"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, LoaderCircle, Send, Sparkles } from 'lucide-react';
import { coachChat } from '@/ai/flows/coach-chat';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const historyForApi = messages.map(msg => ({
            role: msg.role,
            text: msg.text
        }));
        
        const responseText = await coachChat({
            history: historyForApi,
            message: textToSend,
        });

        const modelMessage: Message = { role: 'model', text: responseText };
        setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error("Chat API error:", error);
      const errorMessage: Message = { role: 'model', text: 'מצטערת, התרחשה שגיאה. נסו שוב מאוחר יותר.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEncouragement = () => {
    handleSend("אני צריכה קצת עידוד ותמיכה");
  };

  return (
    <Card className="flex flex-col h-[70vh]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">מאמן/ת AI</h3>
            <Button variant="ghost" size="sm" onClick={handleEncouragement} disabled={isLoading}>
                <Sparkles className="ml-2 h-4 w-4" />
                בקשי עידוד
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
             <div className="space-y-4">
              {messages.map((message, index) => (
              <div
                  key={index}
                  className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
              >
                  {message.role === 'model' && (
                  <Avatar className="w-8 h-8">
                      <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                  )}
                  <div
                  className={cn(
                      'rounded-lg px-4 py-2 max-w-[80%]',
                      message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                  >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                   {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                      <AvatarFallback>א</AvatarFallback>
                  </Avatar>
                  )}
              </div>
              ))}
              {isLoading && (
                  <div className="flex items-start gap-3 justify-start">
                      <Avatar className="w-8 h-8">
                          <AvatarFallback><Bot /></AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg px-4 py-2 bg-muted flex items-center justify-center">
                        <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                      </div>
                  </div>
              )}
             </div>
          </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex w-full items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="כתבו כאן את הודעתכם..."
            disabled={isLoading}
            dir="rtl"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">שלח</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
