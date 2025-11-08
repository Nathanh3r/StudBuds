const BASE = process.env.NEXT_PUBLIC_API_URL;

export async function fetchClasses(q = "") {
  const url = q ? `${BASE}/classes?q=${encodeURIComponent(q)}` : `${BASE}/classes`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchClasses failed: ${res.status}`);
  const data = await res.json();
  return data.classes;
}

export async function joinClass(id) {
  const res = await fetch(`${BASE}/classes/${id}/join`, { method: "POST" });
  if (!res.ok) throw new Error(`joinClass failed: ${res.status}`);
  const data = await res.json();
  return data.class;
}

export async function leaveClass(id) {
  const res = await fetch(`${BASE}/classes/${id}/leave`, { method: "POST" });
  if (!res.ok) throw new Error(`leaveClass failed: ${res.status}`);
  const data = await res.json();
  return data.class;
}

export default { fetchClasses, joinClass, leaveClass };
