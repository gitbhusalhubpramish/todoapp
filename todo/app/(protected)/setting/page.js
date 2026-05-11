"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SquarePen, Camera } from "lucide-react";
import { redirect } from "next/navigation";
//           pp      usrname
//           bioooooooooo edtpen
//  -----------------------------------
//     project one 				del
//     project 2 				del
//====================================
//  change pass
//	del acc
//	logout
export default function Setting(){

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
		if (!session?.username) return;

		async function loadUser() {
			try {
				setLoading(true);

				const res = await fetch(
					`/api/users/${session.username}/setting`
				);

				if (res.status === 404) {
					setNotFoundState(true);
					return;
				}

				if (res.status === 401) {
					return;
				}

				const data = await res.json();

				console.log(data);

				setUser(data);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}

		loadUser();
	}, [session]);
	
	const Skeleton = ({ className }) => (
		<div className={`animate-pulse bg-gray-600/50 rounded ${className}`} />
	)
	console.log("user state ", user)
	return (
		<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] text-black dark:text-white p-6 ">
			<div className="flex justify-center flex-wrap">
				<div className="sm:w-40 sm:h-40 flex items-stretch relative group">
					<label className="absolute inset-0 hidden group-hover:block bg-black/40 z-10 rounded-full group-hover:cursor-pointer">
					</label>

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
				</div>
			</div>
			<p className="text-center my-2">{user?.bio}</p>
			<div className="max-w-2xl mx-auto my-30 border-t border-gray-500 pt-4">
				{/* Content */}
				<div className="space-y-3">
					{user?.projects.length ? (
							user?.projects.map((p, i) => (
								<Link
									href={`/${user.username}/${p.title}`}
									key={i}
									className="block p-3 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer bg-white/60 dark:bg-gray-900/40 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200"
								>
									<div className="flex justify-between items-start gap-3">
										<div className="flex-1">
											<h3 className="text-gray-900 dark:text-gray-100 font-medium tracking-wide">
												{p.title}
											</h3>

											{/*<p className="border-l-1 border-gray-600 pl-1 text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
												{p.description || "No description"}
											</p>
											*/}
										</div>

										{/* status badge */}
										<span
											className={`text-xs px-2 py-1 rounded-full font-medium ${ p.isdone ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"}`}
										>
											{p.isdone ? "Done" : "Pending"}
										</span>
									</div>
								</Link>
							))
						) : (
							<p className="text-sm opacity-60 text-center">No projects yet</p>
					)}
				</div>
			</div>
		</div>
	)
}
