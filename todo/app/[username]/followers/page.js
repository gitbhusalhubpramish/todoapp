"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
export default function followers({ params }){
	const {username} = use(params)
	
	const [followers, setFollowers] = useState(null)
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true);
	const [notFoundState, setNotFoundState] = useState(false);
	
	useEffect(() => {
		if (!username) return;
		setLoading(true);
		async function loadProject() {

			const res = await fetch(`/api/users/${username}/follower`);
			if (res.status === 404) {
				setNotFoundState(true);
				setLoading(false);
				return;
			}

			const data = await res.json();
			setFollowers(data.followers);
			setUser(data.user)
			console.log(data)
			setLoading(false);
		}

		loadProject();
	}, [username]);
	
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
						<div className="underline decoration-dashed">{user ? (user.followers?.length ?? 0)+" followers" : <Skeleton className="h-4 w-10" />}</div>
						<div className="underline decoration-dashed">{user ? (user.following?.length ?? 0)+" following" : <Skeleton className="h-4 w-10" />} </div>
					</div>
				</div>
			</div>
			<div className="w-screen dark:text-white">
				<h1 className="text-center text-4xl">Who follows {username}</h1>
			</div>
		</div>
	)
}
