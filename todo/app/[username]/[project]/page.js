"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Folder, Heart } from "lucide-react";
import { redirect } from "next/navigation";

export default function project({ params }) {
	const { username, project } = use(params);

	const [projects, setProject] = useState(null);
	const [loading, setLoading] = useState(true);
	const [notFoundState, setNotFoundState] = useState(false);
	const [session, setSessionUser] = useState(null);
	const [owner, setOwner] = useState(false)

	useEffect(() => {
		async function loadSession() {
			const res = await fetch("/api/me/auth");
			const data = await res.json();
			setSessionUser(data.user);
		}
		loadSession();
	}, []);

	useEffect(() => {
		async function loadProject() {
			setLoading(true);

			const res = await fetch(`/api/users/${username}/${project}`);
			if (res.status === 404) {
				setNotFoundState(true);
				setLoading(false);
				return;
			}

			const data = await res.json();
			setProject(data.project);
			setLoading(false);
		}

		loadProject();
	}, [username, project]);

	if (notFoundState) return notFound();
	useEffect(() => {
		if (session?.username && projects?.owner) {
			setOwner(session.username === projects.owner);
		}
	}, [session, projects]);
	
	const handleTaskToggle = async (taskIndex) => {
		console.log("clicked")
		try {
			const res = await fetch(
				`/api/users/${username}/${project}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ taskIndex }),
				}
			);

			if (!res.ok) return;
	
			const data = await res.json();
			console.log(data)

			// update local state (important)
			setProject((prev) => ({
				...prev,
				
				content: {
					...prev.content,
					isdone: data.projectDone,
					tasks: data.updatedTasks,
				},
			}));
			console.log(projects)
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] flex justify-center items-start py-10 px-4">
			<div className="w-full max-w-3xl bg-white dark:bg-[#111827] rounded-2xl shadow-lg p-6 space-y-6">

				<div className="space-y-5">

					{/* Project Title */}
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
							{projects?.content.title}
						</h1>

						<span
							className={`text-xs px-3 py-1 rounded-full font-medium
								${projects?.content.isdone
								? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100"
								: "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100"
							}`}
						>
							{projects?.content.isdone ? "Project Done" : "In Progress"}
						</span>
					</div>

					{/* Project Description */}
					<p className="w-full text-sm leading-relaxed text-gray-700 dark:text-gray-300">
						{projects?.content.description}
					</p>

					{/* Tasks */}
					<div className="space-y-4">

						{projects?.content.tasks.map((task, index) => (
							<button
								key={index}
								onClick={() => handleTaskToggle(index)}
								className={`p-4 rounded-xl border space-y-2 transition-all duration-200 block w-full text-start cursor-pointer
									${task?.isdone
										? "border-green-400 bg-green-50 dark:bg-green-900/10 opacity-80"
										: "border-gray-200 dark:border-gray-700 bg-white/40 dark:bg-white/5"
									}
									${owner
										? "hover:scale-[1.01] hover:shadow-md hover:border-green-400 active:scale-[0.99]"
										: ""
									}
								`}
							>
								<div className="flex items-center justify-between">
									<h3
										className={`text-base font-semibold
											${task?.isdone
											? "line-through text-green-600 dark:text-green-400"
											: "text-gray-900 dark:text-white"
										}`}
									>
										{task?.name}
									</h3>

									{/* status badge */}
									<span
										className={`text-xs px-2 py-1 rounded-full
											${task?.isdone
											? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100"
											: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
										}`}
									>
										{task?.isdone ? "Done" : "Pending"}
									</span>
								</div>

								<p
									className={`text-sm leading-relaxed
										${task?.isdone
										? "text-gray-500 dark:text-gray-400"
										: "text-gray-600 dark:text-gray-300"
									}`}
								>
									{task?.description}
								</p>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
