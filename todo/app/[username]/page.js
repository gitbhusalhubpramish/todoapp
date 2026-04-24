"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image"
import { notFound } from "next/navigation";
import { Folder, Heart } from "lucide-react";

export default function ProfilePage({ params }) {
	const { username } = use(params)

	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [notFoundState, setNotFoundState] = useState(false);
	const [session, setSessionUser] = useState(null);
	const [activeTab, setActiveTab] = useState("projects");

	useEffect(() => {
		async function loadSession() {
			const res = await fetch("/api/me/auth");
			const data = await res.json();
			console.log("session raw data ",data)
			setSessionUser(data.user);
		}

		loadSession();
	}, []);

	useEffect(() => {
		async function loadUser() {
			setLoading(true);

			const res = await fetch(`/api/users/${username}`);

			if (res.status === 404) {
				setNotFoundState(true);
				setLoading(false);
				return;
			}

			const data = await res.json();
			console.log(data)
			setUser(data.user);
			setLoading(false);
		}

		loadUser();
	}, [username]);

	if (notFoundState) {
		return notFound();
	}
	const Skeleton = ({ className }) => (
		<div className={`animate-pulse bg-gray-600/50 rounded ${className}`} />
	)
	const handelFollow = async () => {
		const isFollowing = user?.followers?.includes(session?.username);

		const res = await fetch(`/api/users/${username}/follow`, {
			method: isFollowing ? "DELETE" : "POST",
		});

		const data = await res.json();

		if (!res.ok) {
			console.error(data.error);
			return;
		}

		// 🔥 UPDATE UI STATE MANUALLY (IMPORTANT FIX)
		setUser((prev) => {
			if (!prev) return prev;

			const updatedFollowers = isFollowing
				? prev.followers.filter((u) => u !== session?.username)
				: [...(prev.followers || []), session?.username];

			return {
				...prev,
				followers: updatedFollowers,
			};
		});
	};
	const Followbtn = () => {
		console.log("session ", session)
		console.log("user ", user)

		// keep Follow button style same
		const followStyle = "px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-md hover:shadow-lg dark:bg-green-500 dark:hover:bg-green-600 cursor-pointer"

		// redesigned styles for others
		const secondaryStyle = "px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 hover:border-gray-400 active:scale-95 shadow-sm dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800 cursor-pointer"

		const friendStyle = "px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg cursor-pointer"

		if (session?.username === user?.username) {
			return (
				<button className={secondaryStyle}>
					Edit Profile
				</button>
			)
		}

		if (user?.followers.includes(session?.username)) {
			return (
				<button
					className={
						user?.following.includes(session?.username)
							? friendStyle
							: secondaryStyle
					}
					onClick={handelFollow}
				>
					{user?.following.includes(session?.username)
						? "Friends"
						: "Following"}
				</button>
			)
		}

		return (
			<button className={followStyle} onClick={handelFollow}>
				Follow
			</button>
		)
	}
	

	return (
		<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] text-black dark:text-white p-6 ">
			<div className="flex justify-center flex-wrap">
				<div className="sm:w-40 sm:h-40">
					<Image
						src={user?.profilepic || "/profile.svg"}
						alt="profile"
						width={160}
						height={160}
						className="rounded-full"
					/>
								</div>
				<div>
					<h1 className="sm:text-4xl text-3xl h-1/2 flex items-end m-3">{user ? user.username : (<Skeleton className="w-30 h-5"/>)}</h1>
					<div className="flex gap-2 m-3 text-gray-500 ">
						<div className="underline decoration-dashed">{user ? (user.followers?.length ?? 0)+" followers" : <Skeleton className="h-4 w-10" />}</div>
						<div className="underline decoration-dashed">{user ? (user.following?.length ?? 0)+" following" : <Skeleton className="h-4 w-10" />} </div>
					</div>
				</div>
				<div className="flex justify-center sm:justify-start items-center mt-4 sm:mt-0 sm:ml-6">
					<Followbtn/>
				</div>
			</div>
			<div className="max-w-2xl mx-auto my-30 border-t border-gray-500 pt-4">
			
				{/* Tabs */}
				<div className="flex gap-4 justify-center mb-6">
					<button
						onClick={() => setActiveTab("projects")}
						className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200  hover:scale-105 cursor-pointer ${activeTab === "projects" ? "bg-[#dbffe9] dark:bg-[#0b1120] border-green-400 text-gray-900 dark:text-gray-100 shadow-md border border-green-400" : "opacity-70 text-gray-700 dark:text-gray-300 border border-transparent"}`}
					>
						<Folder size={18} /> Projects
					</button>

					<button
						onClick={() => setActiveTab("likes")}
						className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200  hover:scale-105 cursor-pointer ${activeTab === "likes" ? "bg-[#dbffe9] dark:bg-[#0b1120] border-green-400 text-gray-900 dark:text-gray-100 shadow-md border border-green-400" : "opacity-70 text-gray-700 dark:text-gray-300 border border-transparent"}`}
					>
						<Heart size={18} /> Likes
					</button>
				</div>

				{/* Content */}
				<div className="space-y-3">
					{activeTab === "projects" &&
						(user?.projects.length ? (
							user?.projects.map((p, i) => (
								<div
									key={i}
									className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer bg-white/60 dark:bg-gray-900/40 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200"
								>
									<div className="flex justify-between items-start gap-3">
  <div className="flex-1">
    <h3 className="text-gray-900 dark:text-gray-100 font-medium tracking-wide">
      {p.title}
    </h3>

    <p className="border-l-1 border-gray-600 pl-1 text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
      {p.description || "No description"}
    </p>
  </div>

  {/* status badge */}
  <span
    className={`text-xs px-2 py-1 rounded-full font-medium ${
      p.isdone
        ? "bg-green-500/20 text-green-600 dark:text-green-400"
        : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
    }`}
  >
    {p.isdone ? "Done" : "Pending"}
  </span>
</div>
								</div>
							))
						) : (
							<p className="text-sm opacity-60 text-center">No projects yet</p>
					))}

					{activeTab === "likes" &&
						(user?.likedprojects.length ? (
							user?.likedprojects.map((p, i) => (
								<div
									key={i}
									className="p-3 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer bg-white/60 dark:bg-gray-900/40 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200"
								>
									<h3 className="text-gray-900 dark:text-gray-100 font-medium tracking-wide">
										{p.title}
									</h3>
								</div>
							))
						) : (
							<p className="text-sm opacity-60 text-center">No liked projects</p>
					))}
				</div>
			</div>
		</div>
	);
}
