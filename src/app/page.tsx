import { DailyTrackerForm } from "@/components/dashboard/daily-tracker-form";

export default function DashboardPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <DailyTrackerForm />
      </div>
    </main>
  );
}
