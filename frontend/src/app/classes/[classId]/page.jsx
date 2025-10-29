export default function Page({ params }) {
  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Class Detail</h1>
      <p className="mt-2">
        classId: <b>{params.classId}</b>
      </p>
      <a
        href="/classes/browse"
        className="inline-block mt-4 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
      >
        ← Back to Browse
      </a>
    </main>
  );
}
