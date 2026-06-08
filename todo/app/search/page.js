"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function SearchPage() {
	//initilization
	const searchParams = useSearchParams();
	const router = useRouter();
	
	//get querry form url
	const query = searchParams.get("q") || "";

	//state
	const [results, setResults] = useState({ projects: [], users: [] });
	const [activeTab, setActiveTab] = useState("projects");

	// redirect if empty query (safe)
	useEffect(() => {
		if (!query.trim()) {
			router.push("/");
		}
	}, [query, router]);

	// fetch results
	useEffect(() => {
		if (!query.trim()) return;

		const timeout = setTimeout(async () => {
			try {
				const res = await fetch(
					`/api/search?q=${encodeURIComponent(query)}`
				);

				const data = await res.json();
				setResults(data || { projects: [], users: [] });
			} catch (err) {
				console.error(err);
				setResults({ projects: [], users: [] });
			}
		}, 300);

		return () => clearTimeout(timeout);
	}, [query]);

	//skeleton load
	const Skeleton = ({ className }) => (
		<div className={`animate-pulse bg-gray-600/50 rounded ${className}`} />
	);
	
	return (
		<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] text-black dark:text-white p-6">
			<div className="max-w-2xl mx-auto my-30 border-t border-gray-500 pt-4">

				{/* Tabs */}
				<div className="flex gap-4 justify-center mb-6">
					<button
						onClick={() => setActiveTab("projects")}
						className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer ${
							activeTab === "projects"
								? "bg-[#dbffe9] dark:bg-[#0b1120] border-green-400 text-gray-900 dark:text-gray-100 shadow-md border border-green-400"
								: "opacity-70 text-gray-700 dark:text-gray-300 border border-transparent"
						}`}
					>
						Projects
					</button>

					<button
						onClick={() => setActiveTab("users")}
						className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer ${
							activeTab === "users"
								? "bg-[#dbffe9] dark:bg-[#0b1120] border-green-400 text-gray-900 dark:text-gray-100 shadow-md border border-green-400"
								: "opacity-70 text-gray-700 dark:text-gray-300 border border-transparent"
						}`}
					>
						Users
					</button>
				</div>

				{/* Content */}
				<div className="space-y-3">

					{/* PROJECTS */}
					{activeTab === "projects" &&
						(results?.projects?.length ? (
							results.projects.map((p, i) => (
								<Link
									key={i}
									href={`/${p.owner}/${p.content.title}`}
									className="block p-3 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer bg-white/60 dark:bg-gray-900/40 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200"
								>
									<div className="flex justify-between items-start gap-3">
									<Image
												src={p.profilepic || "/profile.svg"}
												alt={p.content.title}
												width={50}
												height={50}
												className="rounded-full object-cover"
											/>
										<div className="flex-1">
											
											<h3 className="text-gray-900 dark:text-gray-100 font-medium tracking-wide underline">
												{p.owner}/{p.content.title}
											</h3>

											<p className="border-l-1 border-gray-600 pl-1 text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
												{p.content.description || "No description"}
											</p>
										</div>
									</div>
								</Link>
							))
						) : (
							<p className="text-sm opacity-60 text-center">
								No projects Found
							</p>
						))}

					{/* USERS */}
					{activeTab === "users" &&
						(results?.users?.length ? (
							results.users.map((usr, index) => (
								<Link
									key={index}
									href={`/${usr.username}`}
									className="flex items-center gap-4 p-3 rounded-xl bg-white/70 dark:bg-[#1e293b] hover:bg-white dark:hover:bg-[#334155] transition shadow-sm"
								>
									<Image
										src={usr.profilepic || "/profile.svg"}
										alt={usr.username}
										width={50}
										height={50}
										className="rounded-full object-cover"
									/>

									<div className="flex flex-col">
										<span className="font-semibold text-lg">
											{usr.username}
										</span>
										<span className="text-sm text-gray-500 dark:text-gray-400">
											{usr.bio || "No bio"}
										</span>
									</div>
								</Link>
							))
						) : (
							<div className="space-y-3">
								<Skeleton className="h-16 w-full" />
								<Skeleton className="h-16 w-full" />
								<Skeleton className="h-16 w-full" />
							</div>
						))}
				</div>
			</div>
		</div>
	);
}
