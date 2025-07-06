import { WeeklyCharts } from "@/components/reports/weekly-charts";

export default function ReportsPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
       <div className="max-w-6xl mx-auto">
         <WeeklyCharts />
      </div>
    </main>
  );
}
