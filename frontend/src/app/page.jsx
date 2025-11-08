import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold text-indigo-700">StudBuds</h1>
        <p className="mt-3 text-gray-600 max-w-xl">
          Connect with classmates, find study partners, and build your academic community.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link
            href="/classes"
            className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700"
          >
            My Classes
          </Link>
          <Link
            href="/classes/browse"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
          >
            Browse Classes
          </Link>
        </div>
      </div>
    </main>
  );
}
