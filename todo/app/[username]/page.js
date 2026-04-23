"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image"
import { notFound } from "next/navigation";

export default function ProfilePage({ params }) {
	const { username } = use(params)

	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [notFoundState, setNotFoundState] = useState(false);
	const [session, setSessionUser] = useState(null);

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
	const Followbtn = ()=>{
		console.log("session ", session)
		console.log("user ", user)
		if (session?.username === user?.username){
			return (
				<button className="px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-md hover:shadow-lg dark:bg-green-500 dark:hover:bg-green-600 cursor-pointer">
					Edit Profile
				</button>
			)
		}
		if (user?.followers.includes(session?.username)){
			return (
				<button className="px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-md hover:shadow-lg dark:bg-green-500 dark:hover:bg-green-600 cursor-pointer">
					{user?.following.includes(session?.username) ? "Friends" : "Following"}
				</button>
			)
		}
		return (
			<button className="px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-md hover:shadow-lg dark:bg-green-500 dark:hover:bg-green-600 cursor-pointer">
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
						<div className="underline decoration-dashed">{user ? (user.follower?.length ?? 0)+" followers" : <Skeleton className="h-4 w-10" />}</div>
						<div className="underline decoration-dashed">{user ? (user.following?.length ?? 0)+" following" : <Skeleton className="h-4 w-10" />} </div>
					</div>
				</div>
				<div className="flex justify-center sm:justify-start items-center mt-4 sm:mt-0 sm:ml-6">
					<Followbtn/>
				</div>
			</div>
		</div>
	);
}
