import { ChatInterface } from "@/components/coach/chat-interface";

export default function CoachPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
       <div className="max-w-4xl mx-auto">
         <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold font-headline">התייעצות עם מאמן/ת AI</h2>
            <p className="text-muted-foreground">כאן אפשר לשוחח, לשאול שאלות ולקבל תמיכה ועידוד מהמאמנ/ת הוירטואלי/ת שלך.</p>
        </div>
         <ChatInterface />
      </div>
    </main>
  );
}
