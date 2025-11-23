// app/components/course-detail/CourseNotes.jsx
'use client';

import { useState, useEffect } from 'react';
import AddNoteModal from './AddNoteModal';

export default function CourseNotes({ classId, token, baseUrl }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${baseUrl}/classes/${classId}/notes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteUploaded = () => {
    setShowAddModal(false);
    fetchNotes(); // Refresh the notes list
  };

  // ADDED: Handle download with proper filename
  const handleDownload = async (note) => {
    try {
      const response = await fetch(note.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = note.fileName; // Use the original filename
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Track download
      await fetch(`${baseUrl}/notes/${note._id}/download`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Course Notes
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'} shared
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Add Note
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share your notes with the class!</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                Upload First Note
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note._id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{note.title}</h3>
                      {note.description && (
                        <p className="text-sm text-gray-600 mb-3">{note.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <span>👤</span>
                          <span className="font-medium">{note.uploadedBy?.name || 'Anonymous'}</span>
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1.5">
                          <span>📅</span>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1.5">
                          <span>⬇️</span>
                          {note.downloadCount} downloads
                        </span>
                      </div>
                    </div>
                    {/* CHANGED: Use button with onClick instead of <a> */}
                    <button
                      onClick={() => handleDownload(note)}
                      className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onNoteUploaded={handleNoteUploaded}
        classId={classId}
        token={token}
        baseUrl={baseUrl}
      />
    </>
  );
}