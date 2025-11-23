import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() =>
        setTheme(theme === "light" ? "dark" : "light")
      }
      className="px-4 py-2 rounded-lg border bg-gray-200 dark:bg-gray-700 dark:text-white"
    >
      Toggle {theme === "light" ? "Dark" : "Light"} Mode
    </button>
  );
}
