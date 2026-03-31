"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDark(!isDark);
  };

  return (
    <button className="absolute cursor-pointer right-0 bottom-0 w-10 h-10 dark:bg-[#010101] bg-[#EEEEEE] flex justify-center items-center rounded-full m-2" onClick={toggleTheme}>
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
