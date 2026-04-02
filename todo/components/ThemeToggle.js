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
		<button
			className="fixed z-50 cursor-pointer right-4 bottom-4 w-10 h-10 dark:bg-[#010101] bg-[#bff2d3] flex justify-center items-center rounded-full border-1 border-[#78ce9a] dark:border-[#04060d]"
			onClick={e=>toggleTheme()}
		>
			{isDark ? "🌙" : "☀️"}
		</button>
	);
}
