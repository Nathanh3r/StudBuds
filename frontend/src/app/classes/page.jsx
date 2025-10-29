export default function MyClassesPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">My Classes</h1>
          <a
            href="/classes/browse"
            className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700"
          >
            Browse All Classes
          </a>
        </div>

        <div className="rounded-2xl border border-gray-200 p-8 text-center bg-white">
          <p className="text-gray-700">You haven’t joined any classes yet.</p>
          <a
            href="/classes/browse"
            className="inline-block mt-3 rounded-lg bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700"
          >
            Browse Classes
          </a>
        </div>
      </div>
    </main>
  );
}
