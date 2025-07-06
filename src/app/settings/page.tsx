import { EmailSettingsForm } from "@/components/settings/email-settings-form";

export default function SettingsPage() {
    return (
        <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="space-y-2 mb-8">
                    <h2 className="text-3xl font-bold font-headline">הגדרות</h2>
                    <p className="text-muted-foreground">ניהול פרטי המשתמש והגדרות שליחת דוחות במייל.</p>
                </div>
                <EmailSettingsForm />
            </div>
        </main>
    );
}
