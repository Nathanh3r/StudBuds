'use client';

export default function PageHeader({ title, subtitle }) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 mb-8 text-white shadow-lg">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {subtitle && <p className="text-indigo-100">{subtitle}</p>}
    </div>
  );
}