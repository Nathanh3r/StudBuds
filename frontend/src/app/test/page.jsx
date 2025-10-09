"use client";
export default function Test() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 text-gray-800 p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center">
        <h1 className="text-4xl font-bold text-emerald-600 mb-3">
          Hello from Test.jsx 👋
        </h1>
        <p className="text-gray-600">
          If you can see this styled text, Tailwind and JSX are working perfectly!
        </p>
        <button
          onClick={() => alert("Nice! It’s all working.")}
          className="mt-6 px-6 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
        >
          Test Button
        </button>
      </div>
    </div>
  )
}
