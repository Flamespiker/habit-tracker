// TODO: Fetch a single habit by ID from Supabase and display its detail view.
// Show habit metadata, current streak, completion history/calendar, and recent log entries.
// Include links to edit (/habits/[id]/edit) and a button to log today's completion.

interface HabitDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function HabitDetailPage({ params }: HabitDetailPageProps) {
  const { id } = await params;

  return (
    <main>
      <h1>Habit Detail</h1>
      <p>ID: {id}</p>
    </main>
  );
}
