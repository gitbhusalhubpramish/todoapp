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

	return (
		<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] flex justify-center items-start py-10 px-4">
			<div className="w-full max-w-3xl bg-white dark:bg-[#111827] rounded-2xl shadow-lg p-6 space-y-6">

				<div className="space-y-5">

					{/* Project Title */}
					<h1 className="w-full text-2xl font-bold text-gray-900 dark:text-white">
						{projects?.content.title}
					</h1>

					{/* Project Description */}
					<p className="w-full text-sm leading-relaxed text-gray-700 dark:text-gray-300">
						{projects?.content.description}
					</p>

					{/* Tasks */}
					<div className="space-y-4">

						{projects?.content.tasks.map((task, index) => (
							<div
								key={index}
								className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 bg-white/40 dark:bg-white/5"
							>
								<h3 className="text-base font-semibold text-gray-900 dark:text-white">
									{task?.name}
								</h3>

								<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
									{task?.description}
								</p>
							</div>
						))}

					</div>
				</div>
			</div>
		</div>
	);
}
