"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
export default function followers({ params }){
	//get target username
	const {username} = use(params)
	
	//initlize states
	const [following, setFollowing] = useState(null)
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true);
	const [notFoundState, setNotFoundState] = useState(false);
	
	//get target user following user data
	useEffect(() => {
		if (!username) return;
		setLoading(true);
		async function loadProject() {

			const res = await fetch(`/api/users/${username}/following`);
			if (res.status === 404) {
				setNotFoundState(true);
				setLoading(false);
				return;
			}

			const data = await res.json();
			setFollowing(data.following);
			setUser(data.user)
			setLoading(false);
		}

		loadProject();
	}, [username]);
	
	//loading skeleton
	const Skeleton = ({ className }) => (
		<div className={`animate-pulse bg-gray-600/50 rounded ${className}`} />
	)
	
	return (
		<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] flex flex-col items-center gap-7 py-20 px-4 ">
			<div className="flex justify-center flex-wrap sm:h-40">
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
					<h1 className="sm:text-4xl text-3xl h-1/2 flex items-end m-3 dark:text-white">{user ? username : (<Skeleton className="w-30 h-5"/>)}</h1>
					<div className="flex gap-2 m-3 text-gray-500 ">
						<Link href={`/${username}/followers`} className="underline decoration-dashed">{user ? (user.followers?.length ?? 0)+" followers" : <Skeleton className="h-4 w-10" />}</Link>
						<Link href={`/${username}/following`} className="underline decoration-dashed">{user ? (user.following?.length ?? 0)+" following" : <Skeleton className="h-4 w-10" />} </Link>
					</div>
				</div>
			</div>
			<div className="w-screen dark:text-white">
				<h1 className="text-center text-4xl">Whom {username} follows</h1>
				<div className="w-full max-w-2xl mx-auto mt-6 space-y-3">
					{following ? following.map((usr, index) => (
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
								<span className="font-semibold text-lg">{usr.username}</span>
								<span className="text-sm text-gray-500 dark:text-gray-400">
									{usr.bio || "No bio"}
								</span>
							</div>
						</Link>
					)) : (
						<div className="space-y-3">
							<Skeleton className="h-16 w-full" />
							<Skeleton className="h-16 w-full" />
							<Skeleton className="h-16 w-full" />
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
