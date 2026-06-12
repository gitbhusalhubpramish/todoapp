"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Settings, Heart } from "lucide-react";
import { redirect } from "next/navigation";

export default function project({ params }) {
	//get target username
	const { username, project } = use(params);

	//initlize state
	const [projects, setProject] = useState(null);
	const [loading, setLoading] = useState(true);
	const [notFoundState, setNotFoundState] = useState(false);
	const [session, setSessionUser] = useState(null);
	const [owner, setOwner] = useState(false)
	const [liked, setLiked] = useState(false)

	//fetch user auth
	useEffect(() => {
		async function loadSession() {
			const res = await fetch("/api/me/auth");
			const data = await res.json();
			setSessionUser(data.user);
		}
		loadSession();
	}, []);

	//fetch project data
	useEffect(() => {
		if (!username || !project) return;
		setLoading(true);
		async function loadProject() {

			const res = await fetch(`/api/users/${username}/${project}`);
			if (res.status === 404) {
				setNotFoundState(true);
				setLoading(false);
				return;
			}

			const data = await res.json();
			setProject(data.project);
			setLiked(data.project?.likes?.includes(session?.username) || false);
			setLoading(false);
		}

		loadProject();
	}, [username, project]);

	//handel project not found
	if (notFoundState) return notFound();
	
	//check for like and ownership
	useEffect(() => {
		if (session?.username && projects?.owner) {
			setOwner(session.username === projects.owner);
			setLiked(projects.likes.includes(session.username));
		}
	}, [session, projects]);
	
	//toggel isdone
	const handleTaskToggle = async (taskIndex) => {
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

			// update local state (important)
			setProject((prev) => ({
				...prev,
				
				content: {
					...prev.content,
					isdone: data.projectDone,
					tasks: data.updatedTasks,
				},
			}));
		} catch (err) {
			console.error(err);
		}
	};
	
	//loading animation skeleton
	const Skeleton = ({ className }) => (
		<div className={`animate-pulse bg-gray-600/50 rounded ${className}`} />
	)
	
	//formated created time
	function formatTimeAgo(dateString) {
		const now = new Date();
		const past = new Date(dateString);

		const diffMs = now - past;
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHr = Math.floor(diffMin / 60);
		const diffDay = Math.floor(diffHr / 24);
		const diffMonth = Math.floor(diffDay / 30);
		const diffYear = Math.floor(diffDay / 365);

		if (diffSec < 60) {
			return "Just now";
		}
		if (diffMin < 60) {
			return `${diffMin} min`;
		}
		if (diffHr < 24) {
			return `${diffHr} hr`;
		}
		if (diffDay < 30) {
			return `${diffDay} day${diffDay > 1 ? "s" : ""}`;
		}
		if (diffMonth < 12) {
			return `${diffMonth} month${diffMonth > 1 ? "s" : ""}`;
		}
	
		return `${diffYear} year${diffYear > 1 ? "s" : ""}`;
	}
	
	//handel user like action
	const handelLike = async () => {
		console.log("clicked");
		if (!session?.username){
			redirect("/login")
		}

		let res;

		if (liked) {
			// UNLIKE
			res = await fetch(`/api/users/${username}/${project}/like`, {
				method: "DELETE",
			});
		} else {
			// LIKE
			res = await fetch(`/api/users/${username}/${project}/like`, {
				method: "POST",
			});
		}

		const data = await res.json();

		if (!res.ok) {
			return;
		}

		setProject((prev) => {
			let updatedLikes;

			if (liked) {
				// remove username
				updatedLikes = prev.likes.filter(
					(user) => user !== session.username
				);
			} else {
				// add username
				updatedLikes = [...(prev.likes || []), session.username];
			}

			return {
				...prev,
				likes: updatedLikes,
			};
		});

		setLiked(!liked);
	};


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
					<h1 className="sm:text-4xl text-3xl dark:text-white h-full flex items-center mx-4">{projects ? (<Link className="cursor-pointer" href={`/${username}`}>{projects.owner}</Link>) : (<Skeleton className="w-30 h-5"/>)}</h1>
					
				</div>
				<ul className="flex items-center text-gray-500 list-disc">
					<li className="ml-2">{projects ? formatTimeAgo(projects?.createdAt) : <Skeleton className="w-9 h-5"/>}</li>
				</ul>
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
								disable={(!owner).toString()}
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
						<div className="flex justify-end gap-2">
							<button
								onClick={handelLike}
								className={`
								flex items-center gap-1 transition-colors cursor-pointer
									${liked
										? "text-red-500"
										: "text-gray-600 dark:text-gray-300 hover:text-red-500"
									}
								`}
							>
								<Heart size={18} className="fill-current" />
								{projects?.likes?.length}
							</button>
							{owner && (
								<Link href={`/setting`} className="flex items-center gap-1 text-gray-600 dark:text-gray-300 cursor-pointer">
									<Settings size={18} className="border-current"/>
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
