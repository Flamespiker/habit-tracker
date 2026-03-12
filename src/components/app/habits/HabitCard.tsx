// TODO: Display a single habit's name, streak, and completion status for today

interface HabitCardProps {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
}

export function HabitCard({ id, name, streak, completedToday }: HabitCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p>HabitCard</p>
    </div>
  );
}
