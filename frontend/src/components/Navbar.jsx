"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const active = (href) =>
    pathname === href
      ? "text-blue-600 font-semibold"
      : "text-gray-600 hover:text-gray-900";

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">StudBuds</Link>
        <div className="flex items-center gap-6">
          <Link href="/classes" className={active("/classes")}>My Classes</Link>
          <Link href="/classes/browse" className={active("/classes/browse")}>Browse Classes</Link>
        </div>
      </nav>
    </header>
  );
}
