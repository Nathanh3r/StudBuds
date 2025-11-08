"use client";

import { useEffect, useState } from "react";
import ClassCard from "../../../components/ClassCard";
import { fetchClasses, joinClass, leaveClass } from "../../../lib/classesApi";



export default function BrowseClassesPage() {
  const [q, setQ] = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchClasses(q);
      setClasses(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleJoin(id) {
    await joinClass(id);
    await load();
  }

  async function handleLeave(id) {
    await leaveClass(id);
    await load();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Browse Classes</h1>
          <a href="/classes" className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">Back to My Classes</a>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="w-full rounded-xl border px-4 py-2"
            placeholder="Search by name or code..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          <button onClick={load} className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700">
            Search
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-gray-500">Loading…</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <ClassCard
                key={cls._id}
                cls={cls}
                joined={false /* replace when you add real membership */}
                onJoin={() => handleJoin(cls._id)}
                onLeave={() => handleLeave(cls._id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
