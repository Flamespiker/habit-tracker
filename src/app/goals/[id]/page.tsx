// TODO: Fetch a single goal by ID from Supabase and display its detail view.
// Show goal metadata, progress toward target, linked habits and their recent completion rates,
// and AI coaching insights fetched from MongoDB. Include a link to /goals/[id]/edit.

interface GoalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params;

  return (
    <main>
      <h1>Goal Detail</h1>
      <p>ID: {id}</p>
    </main>
  );
}
