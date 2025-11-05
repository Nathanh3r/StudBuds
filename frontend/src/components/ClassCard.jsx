"use client";
import Link from "next/link";

export default function ClassCard({ cls, joined, onJoin, onLeave }) {
  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm hover:shadow transition">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{cls.name}</h3>
          <p className="text-sm text-gray-500">{cls.code}</p>
        </div>
        {joined && (
          <span className="text-xs rounded-full bg-green-100 text-green-700 px-2 py-1">Joined ✓</span>
        )}
      </div>

      <p className="mt-3 text-sm text-gray-700">{cls.description}</p>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-gray-500">{cls.members} members</span>
        <div className="flex gap-2">
          {joined ? (
            <button onClick={() => onLeave(cls.id)} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50">
              Leave
            </button>
          ) : (
            <button onClick={() => onJoin(cls.id)} className="rounded-lg bg-blue-600 text-white px-3 py-1 text-sm hover:bg-blue-700">
              Join
            </button>
          )}
          <Link href={`/classes/${cls.id}`} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
