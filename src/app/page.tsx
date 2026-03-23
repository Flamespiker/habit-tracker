import { redirect } from "next/navigation";
import { HabitDashboard } from "@/components/app/habit-dashboard";
import { DashboardCoachingPanel } from "@/components/app/DashboardCoachingPanel";
import { getHabits, toHabit } from "@/lib/db/supabase/habits";
import { getCheckinsForPeriod } from "@/lib/db/supabase/checkins";
import { createClient } from "@/lib/db/supabase/server";
import { getCoachingHistory } from "@/lib/db/mongo/ai-coaching";

/**
 * Dashboard page. Fetches habits, checkins (Supabase), and recent coaching history (MongoDB)
 * in parallel via Promise.all, then passes derived data to client/server components.
 */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const todayDate = new Date();
  const today = todayDate.toISOString().split("T")[0];
  const oneYearAgo = new Date(todayDate.getTime() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [habitRows, checkins, coachingEntries] = await Promise.all([
    getHabits(user.id, supabase),
    getCheckinsForPeriod(user.id, oneYearAgo, today, supabase),
    getCoachingHistory(user.id, 3),
  ]);

  const habits = habitRows.map((row) => toHabit(row, checkins));

  return (
    <div className="flex flex-col gap-6">
      <HabitDashboard initialHabits={habits} />
      <div className="mx-auto w-full max-w-5xl px-4">
        <DashboardCoachingPanel entries={coachingEntries} />
      </div>
    </div>
  );
}
