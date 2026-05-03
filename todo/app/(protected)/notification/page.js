"use client";

import Link from "next/link";
import Image from "next/image";

const dummyNotifications = [
	{
		type: "follow",
		user: [
			{ username: "ram123", profilePic: "/profile.svg" },
			{ username: "sita_dev", profilePic: "/profile.svg" },
			{ username: "hari", profilePic: "/profile.svg" },
			{ username: "gita", profilePic: "/profile.svg" },
		],
		entity: "/arepeat10000/followers",
		createdAt: "2026-05-02T12:00:00Z",
		read: false,
	},
	{
		type: "like",
		user: [
			{ username: "sita_dev", profilePic: "/profile.svg" },
		],
		entity: "/arepeat10000/fsda",
		createdAt: "2026-05-02T10:30:00Z",
		read: true,
	},
];

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
	return (
		<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] dark:text-white">
			<div className="max-w-2xl mx-auto p-4">
				<h1 className="text-xl font-semibold mb-4">Notifications</h1>

				<div className="flex flex-col gap-2">
					{dummyNotifications.map((notif, index) => {
						const users = notif.user || [];

						const firstThree = users.slice(0, 3);
						const remaining = users.length - 3;

						return (
							<Link
								key={index}
								href={notif.entity}
								className={`relative flex items-center gap-3 p-3 rounded-xl transition
									${
										!notif.read
											? "bg-white/70 dark:bg-zinc-900/60"
											: "hover:bg-black/5 dark:hover:bg-white/5"
									}
								`}
							>
								{/* unread bar */}
								{!notif.read && (
									<div className="absolute left-0 top-0 h-full w-1 bg-green-500 rounded-l-xl" />
								)}

								{/* profile pics (stacked) */}
								<div className="relative w-10 h-10">
									{users.slice(0, 2).map((u, i) => (
										<Image
											key={i}
											src={u.profilePic}
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
									{!notif.read && (
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
					})}
				</div>
			</div>
		</div>
	);
}
