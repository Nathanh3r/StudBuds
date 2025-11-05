"use client";
import { useEffect, useState } from "react";
import ClassCard from "../../../components/ClassCard";
import {
  ALL_CLASSES,
  getJoinedIds,
  joinClass,
  leaveClass,
} from "../../../lib/classesClient";



export default function BrowseClassesPage() {
  const [joined, setJoined] = useState(new Set());
  const [q, setQ] = useState("");

  useEffect(() => {
    setJoined(getJoinedIds());
  }, []);

  const handleJoin = (id) => setJoined(new Set(joinClass(id)));
  const handleLeave = (id) => setJoined(new Set(leaveClass(id)));

  const filtered = ALL_CLASSES.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.code.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Browse Classes</h1>
          <a href="/classes" className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">Back to My Classes</a>
        </div>

        <input
          className="mt-4 w-full rounded-xl border px-4 py-2"
          placeholder="Search by name or code..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              joined={joined.has(cls.id)}
              onJoin={handleJoin}
              onLeave={handleLeave}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
