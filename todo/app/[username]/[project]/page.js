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
	const Skeleton = ({ className }) => (
		<div className={`animate-pulse bg-gray-600/50 rounded ${className}`} />
	)

	return (
		<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] flex flex-col justify-center items-center gap-7 py-20 px-4">
			<div className="flex justify-center flex-wrap">
				<div className="sm:w-40 sm:h-40">
					<Image
						src={projects?.profilepic || "/profile.svg"}
						alt="profile"
						width={160}
						height={160}
						className="rounded-full"
					/>
				</div>
				<div>
					<h1 className="sm:text-4xl text-3xl dark:text-white h-1/2 flex items-end m-3">{projects ? (<Link className="cursor-pointer" href={`/${username}`}>{projects.owner}</Link>) : (<Skeleton className="w-30 h-5"/>)}</h1>
					
				</div>
			</div>
			<div className="w-full max-w-3xl bg-white dark:bg-[#111827] rounded-2xl shadow-lg p-6 space-y-6">

				<div className="space-y-5">

					{/* Project Title */}
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
							{projects ? projects.content.title : (<Skeleton className="w-50 h-7"/>)}
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
						{projects ? projects.content.description : (<Skeleton className="w-70 h-3"/>)}
					</p>

					{/* Tasks */}
					<div className="space-y-4">

						{projects ? projects.content.tasks.map((task, index) => (
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
						)) : [1,2,3].map((index)=>(
							<button
								key={index}
								onClick={() => handleTaskToggle(index)}
								className={`p-4 rounded-xl border space-y-2 transition-all duration-200 block w-full text-start cursor-pointer border-gray-200 dark:border-gray-700 bg-white/40 dark:bg-white/5
								`}
							>
								<div className="flex items-center justify-between">
									<h3
										className={`text-base font-semibold
											text-gray-900 dark:text-white
										}`}
									>
										<Skeleton className="h-5 w-20"/>
									</h3>

									{/* status badge */}
									<span
										className={`text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200
										}`}
									>
										Pending
									</span>
								</div>

								<p
									className={`text-sm leading-relaxed
										text-gray-600 dark:text-gray-300
									}`}
								>
									<Skeleton className="w-30 h-2"/>
								</p>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
