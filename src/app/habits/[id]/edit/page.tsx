// TODO: Fetch the habit by ID and pre-populate an edit form.
// Same fields as /habits/new. On submit, PATCH /api/habits/[id] and redirect back to /habits/[id].
// Include a delete option that calls DELETE /api/habits/[id] and redirects to /habits.

interface EditHabitPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHabitPage({ params }: EditHabitPageProps) {
  const { id } = await params;

  return (
    <main>
      <h1>Edit Habit</h1>
      <p>ID: {id}</p>
    </main>
  );
}
