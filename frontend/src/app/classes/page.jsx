"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchClasses, joinClass, leaveClass } from "../../lib/classesApi";
// If you have a ready card component, keep this import.
// Otherwise you can temporarily render a simple list as shown below.
// import ClassCard from "@/src/components/ClassCard";

export default function MyClassesPage() {
  const [classes, setClasses] = useState([]);         // all classes from API
  const [joined, setJoined] = useState(new Set());    // TEMP: local “joined” state

  async function load() {
    const data = await fetchClasses();                // ← calls GET /api/classes
    setClasses(data);
  }

  useEffect(() => {
    load();
  }, []);

  // TEMP: show only classes user has locally “joined”
  const myClasses = classes.filter((c) => joined.has(c._id));

  async function handleJoin(id) {
    await joinClass(id);                              // ← POST /api/classes/:id/join
    setJoined((prev) => new Set(prev).add(id));
    await load();
  }

  async function handleLeave(id) {
    await leaveClass(id);                             // ← POST /api/classes/:id/leave
    setJoined((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
    await load();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Classes</h1>
          <Link href="/classes/browse" className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
            Browse Classes →
          </Link>
        </div>

        {myClasses.length === 0 ? (
          <p className="mt-6 text-sm text-gray-600">
            You haven’t joined any classes yet.{" "}
            <Link href="/classes/browse" className="underline">Browse classes</Link> to join.
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {myClasses.map((c) => (
              <li key={c._id} className="rounded-xl border bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-gray-500">{c.code}</div>
                    <div className="mt-1 text-sm text-gray-600">{c.description}</div>
                    <div className="mt-1 text-xs text-gray-500">{c.members} members</div>
                  </div>
                  <button
                    onClick={() => handleLeave(c._id)}
                    className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    Leave
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Helper section to quickly join from the full list (for testing) */}
        <h2 className="mt-10 text-lg font-semibold">All Classes (for testing)</h2>
        <ul className="mt-2 grid gap-3 sm:grid-cols-2">
          {classes.map((c) => (
            <li key={c._id} className="rounded-xl border bg-white p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.code}</div>
                </div>
                {joined.has(c._id) ? (
                  <button
                    onClick={() => handleLeave(c._id)}
                    className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoin(c._id)}
                    className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                  >
                    Join
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
