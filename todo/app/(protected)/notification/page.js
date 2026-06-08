"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

//get formated time
function timeAgo(date) {
	const seconds = Math.floor((new Date() - new Date(date)) / 1000);
	const intervals = [
		{ label: "y", seconds: 31536000 },
		{ label: "mo", seconds: 2592000 },
		{ label: "d", seconds: 86400 },
		{ label: "h", seconds: 3600 },
		{ label: "m", seconds: 60 },
	];

	for (let i of intervals) {
		const val = Math.floor(seconds / i.seconds);
		if (val >= 1) return `${val}${i.label}`;
	}
	return "now";
}

export default function NotificationsPage() {
	//initlize router
	const router = useRouter();
	
	//initlize session
	const [notifications, setNotifications] = useState(null); 
	const [loading, setLoading] = useState(true); 
	const [session, setSessionUser] = useState(null);
	
	//user auth
	useEffect(() => {
		async function loadSession() {
			try {
				const res = await fetch("/api/me/auth");
				const data = await res.json();

				console.log("session raw data ", data);

				if (!res.ok || !data?.user) {
					router.push("/login")
					return;
				}
				setSessionUser(data.user);
			} catch (err) {
				console.log(err);
				router.push("/login");
			} finally {
				setCheckingSession(false);
			}
		}

		loadSession();
	}, []);
	
	//fetch notification form server
	useEffect(() => { 
		const fetchNotifications = async () => { 
			try { 
				const res = await fetch( `/api/users/${session?.username}/notification`, { 
					method: "POST", 
				} ); 
				const data = await res.json(); 
				if (!res.ok) { 
					console.error(data.error); 
					return; 
				} 
				setNotifications(data.updatedNotifications || []); 
			} catch (err) { 
				console.error(err); 
			} finally { 
				setLoading(false); 
			} 
		}; 
		if (session?.username) fetchNotifications(); 
	}, [session]);
	
	//return null
	if (!loading && (!notifications || notifications.length === 0)) { 
		return ( <div className="p-4 text-center text-sm text-zinc-500"> No notifications </div> ); 
	}
	
	//loading skeleton
	const Skeleton = ({ className }) => (
		<div className={`animate-pulse bg-gray-600/50 rounded ${className}`} />
	)
	
	return (
		<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] dark:text-white">
			<div className="max-w-2xl mx-auto p-4">
				<h1 className="text-xl font-semibold mb-4">Notifications</h1>

				<div className="flex flex-col gap-2">
					{notifications ? notifications.map((notif, index) => {
						const users = notif.user || [];

						const firstThree = users.slice(0, 3);
						const remaining = users.length - 3;

						return (
							<Link
								key={index}
								href={notif.entity}
								className={`relative flex items-center gap-3 p-3 rounded-xl transition
									${
										!notif.isRead
											? "bg-white/70 dark:bg-zinc-900/60"
											: "hover:bg-black/5 dark:hover:bg-white/5"
									}
								`}
							>
								{/* unread bar */}
								{!notif.isRead && (
									<div className="absolute left-0 top-0 h-full w-1 bg-green-500 rounded-l-xl" />
								)}

								{/* profile pics (stacked) */}
								<div className="relative w-10 h-10">
									{users.slice(0, 2).map((u, i) => (
										<Image
											key={i}
											src={u.profilepic}
											alt="pfp"
											width={32}
											height={32}
											className={`rounded-full border-2 border-white dark:border-[#0b1120] absolute
												${i === 0 ? "left-0 top-0 z-10" : "right-0 bottom-0 z-0"}
											`}
										/>
									))}
								</div>

								{/* content */}
								<div className="flex-1 text-sm flex items-center gap-2">
									{!notif.isRead && (
										<div className="w-2 h-2 bg-green-500 rounded-full" />
									)}

									<span>
										<span className="font-semibold">
											{firstThree.map((u, i) => (
												<span key={i}>
													<Link href={`/${u.username}`}>
														{u.username}
													</Link>
													{i < firstThree.length - 1 && ", "}
												</span>
											))}
										</span>

										{remaining > 0 && ` +${remaining}`}{" "}

										{notif.type === "follow"
											? "started following you"
											: "liked your project"}
									</span>
								</div>

								{/* time */}
								<div className="text-xs text-zinc-500 whitespace-nowrap">
									{timeAgo(notif.createdAt)}
								</div>
							</Link>
						);
					}) : (<Skeleton className="w-full h-15"/>)}
				</div>
			</div>
		</div>
	);
}
