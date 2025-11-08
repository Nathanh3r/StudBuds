import { fetchClasses } from "@/lib/classesApi";

export default async function ClassDetailPage({ params }) {
  // Minimal: fetch all then find one; or create a fetch by id endpoint if you prefer.
  const all = await fetchClasses();
  const cls = all.find(c => c._id === params.classId) || null;

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Class Detail</h1>
      {cls ? (
        <>
          <p className="mt-2"><b>{cls.name}</b> — {cls.code}</p>
          <p className="mt-2 text-sm text-gray-600">{cls.description}</p>
          <p className="mt-2 text-sm text-gray-600">{cls.members} members</p>
        </>
      ) : (
        <p className="mt-2 text-sm text-red-600">Class not found.</p>
      )}
      <a href="/classes/browse" className="inline-block mt-4 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
        ← Back to Browse
      </a>
    </main>
  );
}
