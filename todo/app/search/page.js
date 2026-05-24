"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchPage() {
	const searchParams = useSearchParams();
	const query = searchParams.get("q") || "";
	
	const router = useRouter();
	
	const [results, setResults] = useState([]);
  
	if (query === ""){
		router.push("/")
	}
	
	useEffect(() => {
		const timeout = setTimeout(async () => {
			if (!query.trim()) {
				setResults([]);
				setOpen(false);
				return;
			}

			const res = await fetch(
				`/api/search?q=${encodeURIComponent(query)}`
			);

			const data = await res.json();

			setResults(data || []);
		}, 300);

		return () => clearTimeout(timeout);
	}, [query]);
	
	console.log(results)
	
	return <div>Query: {query}</div>;
}
