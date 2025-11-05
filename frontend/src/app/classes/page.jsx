"use client";
import { useEffect, useState } from "react";
import ClassCard from "../../components/ClassCard";
import { ALL_CLASSES, getJoinedIds, leaveClass } from "../../lib/classesClient";


export default function MyClassesPage() {
  const [joined, setJoined] = useState(new Set());

  useEffect(() => {
    setJoined(getJoinedIds());
  }, []);

  const myClasses = ALL_CLASSES.filter(c => joined.has(c.id));
  const handleLeave = (id) => setJoined(new Set(leaveClass(id)));

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-semibold">My Classes</h1>
          <a href="/classes/browse" className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700">
            Browse All Classes
          </a>
        </div>

        {myClasses.length === 0 ? (
          <div className="rounded-2xl border p-8 text-center bg-white">
            <p className="text-gray-700">You haven’t joined any classes yet.</p>
            <a href="/classes/browse" className="inline-block mt-3 rounded-lg bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700">
              Browse Classes
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClasses.map((cls) => (
              <ClassCard key={cls.id} cls={cls} joined={true} onLeave={handleLeave} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
