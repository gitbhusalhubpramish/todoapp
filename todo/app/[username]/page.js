"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image"
import { notFound } from "next/navigation";

export default function ProfilePage({ params }) {
	const { username } = use(params)

	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [notFoundState, setNotFoundState] = useState(false);

	useEffect(() => {
		async function loadUser() {
			setLoading(true);

			const res = await fetch("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username }),
			});

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
	

	return (
		<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] text-black dark:text-white p-6">
			<div className="flex justify-center">
				<div>
					<Image
						src={user?.profilepic || "/profile.svg"}
						alt="profile"
						width={160}
						height={160}
						className="rounded-full"
					/>
                </div>
				<div>
					<h1 className="text-4xl h-1/2 flex items-end m-3">{user ? user.username : (<Skeleton className="w-30 h-5"/>)}</h1>
					<div className="flex gap-2 m-3">
						<div>{user ? (user.follower?.length ?? 0) : <Skeleton className="h-4 w-10" />} followers</div>
						<div>{user ? (user.following?.length ?? 0) : <Skeleton className="h-4 w-10" />} following</div>
					</div>
				</div>
			</div>
		</div>
	);
}
