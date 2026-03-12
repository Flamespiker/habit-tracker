// TODO: Fetch the goal by ID and pre-populate an edit form.
// Same fields as /goals/new. On submit, PATCH /api/goals/[id] and redirect back to /goals/[id].
// Include options to mark as completed/abandoned and a delete action.

interface EditGoalPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGoalPage({ params }: EditGoalPageProps) {
  const { id } = await params;

  return (
    <main>
      <h1>Edit Goal</h1>
      <p>ID: {id}</p>
    </main>
  );
}
