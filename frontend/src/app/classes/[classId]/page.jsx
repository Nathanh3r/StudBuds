"use client";
import { useEffect, useState } from "react";
import {
  getClassById,
  getJoinedIds,
  joinClass,
  leaveClass,
} from "../../../lib/classesClient";



export default function Page({ params }) {
  const { classId } = params;
  const [cls, setCls] = useState(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    setCls(getClassById(classId));
    setJoined(getJoinedIds().has(classId));
  }, [classId]);

  if (!cls) return <main className="p-10 text-red-600">Class not found</main>;

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">{cls.name}</h1>
      <p className="text-sm text-gray-500">{cls.code}</p>
      <p className="mt-4">{cls.description}</p>

      <button
        onClick={() => {
          if (joined) setJoined(false), leaveClass(classId);
          else setJoined(true), joinClass(classId);
        }}
        className={`mt-6 rounded-lg px-4 py-2 text-sm ${
          joined ? "bg-red-500 text-white hover:bg-red-600" : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {joined ? "Leave Class" : "Join Class"}
      </button>

      <a href="/classes/browse" className="block mt-4 text-sm text-blue-600 underline">
        ← Back to Browse
      </a>
    </main>
  );
}
