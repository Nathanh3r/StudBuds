import Link from "next/link";

export default function BrowseClassesPage() {
  const mockClasses = [
    { id: "c1", name: "CS 166 — Databases", code: "CS166-F24-01", members: 28 },
    { id: "c2", name: "CS 180 — Software Eng", code: "CS180-F24-01", members: 35 },
    { id: "c3", name: "PHYS 40C — Waves/EM", code: "PHYS40C-F24-01", members: 22 },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Browse Classes</h1>
          <a
            href="/classes"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Back to My Classes
          </a>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockClasses.map((cls) => (
            <div key={cls.id} className="rounded-2xl border p-4 bg-white shadow-sm">
              <h2 className="text-lg font-semibold">{cls.name}</h2>
              <p className="text-sm text-gray-500">{cls.code}</p>
              <p className="text-sm text-gray-600 mt-2">{cls.members} members</p>
              <div className="mt-4 flex gap-2">
                <button className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700">
                  Join
                </button>
                <Link
                  href={`/classes/${cls.id}`}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
