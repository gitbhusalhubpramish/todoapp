"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SearchPage() {
	const searchParams = useSearchParams();
	const query = searchParams.get("q") || "";
	
	const router = useRouter();
	
	const [results, setResults] = useState([]);
	const [activeTab, setActiveTab] = useState("projects");
  
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
	
	const Skeleton = ({ className }) => (
		<div className={`animate-pulse bg-gray-600/50 rounded ${className}`} />
	)
	
	return (
		<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] text-black dark:text-white p-6 ">
			<div className="max-w-2xl mx-auto my-30 border-t border-gray-500 pt-4">
			
				{/* Tabs */}
				<div className="flex gap-4 justify-center mb-6">
					<button
						onClick={() => setActiveTab("projects")}
						className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200  hover:scale-105 cursor-pointer ${activeTab === "projects" ? "bg-[#dbffe9] dark:bg-[#0b1120] border-green-400 text-gray-900 dark:text-gray-100 shadow-md border border-green-400" : "opacity-70 text-gray-700 dark:text-gray-300 border border-transparent"}`}
					>
						{/*<Folder size={18} />*/} Projects
					</button>

					<button
						onClick={() => setActiveTab("users")}
						className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200  hover:scale-105 cursor-pointer ${activeTab === "likes" ? "bg-[#dbffe9] dark:bg-[#0b1120] border-green-400 text-gray-900 dark:text-gray-100 shadow-md border border-green-400" : "opacity-70 text-gray-700 dark:text-gray-300 border border-transparent"}`}
					>
						{/*<Heart size={18} />*/} Users
					</button>
				</div>

				{/* Content */}
				<div className="space-y-3">
					{activeTab === "projects" &&
						(results?.projects?.length ? (
							results?.projects.map((p, i) => (
								<Link
									href={`/${p.owner}/${p.content.title}`}
									key={i}
									className="block p-3 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer bg-white/60 dark:bg-gray-900/40 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200"
								>
									<div className="flex justify-between items-start gap-3">
										<div className="flex-1">
											<h3 className="text-gray-900 dark:text-gray-100 font-medium tracking-wide">
												{p.content.title}
											</h3>

											<p className="border-l-1 border-gray-600 pl-1 text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
												{p.content.description || "No description"}
											</p>
										</div>
									</div>
								</Link>
							))
						) : (
							<p className="text-sm opacity-60 text-center">No projects Found</p>
					))}

					{activeTab === "users" &&
						(results?.users.length ? (
							results?.users.map((u, i) => (
								<div
									key={i}
									className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer bg-white/60 dark:bg-gray-900/40 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200"
								>
									<h3 className="text-gray-900 dark:text-gray-100 font-medium tracking-wide">
										{u.username}
									</h3>
								</div>
							))
						) : (
							<p className="text-sm opacity-60 text-center">No liked projects</p>
					))}
				</div>
			</div>
		</div>
	)
}
