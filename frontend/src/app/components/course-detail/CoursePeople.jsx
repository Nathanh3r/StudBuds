// app/components/course-detail/CoursePeople.jsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CoursePeople({ classId, token, baseUrl }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${baseUrl}/classes/${classId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMembers(data.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          Class Members
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {members.length} {members.length === 1 ? 'StudBud' : 'StudBuds'} enrolled
        </p>
      </div>

      {/* Members List */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No members yet</h3>
            <p className="text-gray-600">Be the first to join this class!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-indigo-200 hover:shadow-sm transition"
                >
                <Link href = {`/profile/${member._id}`}>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-lg">
                    {member.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {member.name}
                  </h3>
                  {member.major && (
                    <p className="text-sm text-gray-600 truncate">{member.major}</p>
                  )}
                  {member.year && (
                    <p className="text-xs text-gray-500">{member.year}</p>
                  )}
                        </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}