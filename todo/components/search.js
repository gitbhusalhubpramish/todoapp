"use client"

import { useEffect, useState } from "react";

export default function Search(){
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);
	
	useEffect(() => {
		const timeout = setTimeout(async () => {
			if (!query.trim()) {
				setResults([]);
				return;
			}

			const res = await fetch(
				`/api/search?q=${encodeURIComponent(query)}`
			);

			const data = await res.json();
			setResults(data);
		}, 300);
		return () => clearTimeout(timeout);
	}, [query]);
	return (
		<div className="relative flex-1 flex items-center">
			<div className="flex flex-1 items-center">
				<input
					type="text"
					placeholder="Search..."
					onChange={(e) => setQuery(e.target.value)}
					className="w-full pl-3 pr-10 py-2 border rounded-lg border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-400"
				/>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
				</svg>
			</div>
		</div>
	)
}
