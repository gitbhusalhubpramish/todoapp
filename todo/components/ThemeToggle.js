"use client";

import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
	
	//initlize state for theme
	const [isDark, setIsDark] = useState(false);
	
	//check theme in the local storage
	useEffect(() => {
		const saved = localStorage.getItem("theme");
		if (saved === "dark") {
			document.documentElement.classList.add("dark");
			setIsDark(true);
		}
	}, []);

	//toggel theme when button is clicked
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
			{isDark ? <Moon size={20} className="text-blue-400 transition-colors duration-300"/> : <Sun size={20} className="text-yellow-500 transition-colors duration-300" />}
		</button>
	);
}
