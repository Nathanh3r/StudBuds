export default function ClassCard({ cls, onJoin, onLeave, joined }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="font-medium">{cls.name}</div>
      <div className="text-sm text-gray-500">{cls.code}</div>
      <div className="mt-1 text-sm text-gray-600">{cls.description}</div>
      <div className="mt-1 text-xs text-gray-500">{cls.members} members</div>
      <div className="mt-3 flex gap-2">
        {joined ? (
          <button onClick={onLeave} className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50">
            Leave
          </button>
        ) : (
          <button onClick={onJoin} className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
            Join
          </button>
        )}
      </div>
    </div>
  );
}
