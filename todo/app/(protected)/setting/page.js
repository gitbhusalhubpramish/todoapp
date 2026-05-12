"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SquarePen, Camera , Trash2} from "lucide-react";
import { redirect } from "next/navigation";

export default function Setting(){

	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [notFoundState, setNotFoundState] = useState(false);
	const [session, setSessionUser] = useState(null);
	const [editingBio, setEditingBio] = useState(false);

	// local form state
	const [bio, setBio] = useState("");
	const [ppFile, setPpFile] = useState(null);
	const [deletedProjects, setDeletedProjects] = useState([]);

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
				setBio(data?.bio || "");
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}

		loadUser();
	}, [session]);

	const handelbiochange = (val) => {
		setBio(val);
	}

	const handleDeleteProject = (title) => {
		setDeletedProjects((prev) => [...prev, title]);
		setUser((prev) => ({
			...prev,
			projects: prev.projects.filter((p) => p.title !== title)
		}));
	};

	const handleSave = async () => {
		const username = session?.username;
		if (!username) return;

		try {
			// profile pic
			if (ppFile) {
				const form = new FormData();
				form.append("file", ppFile);

				await fetch(`/api/users/${username}/setting/pp`, {
					method: "POST",
					body: form
				});
			}

			// bio
			if (bio !== user?.bio) {
				await fetch(`/api/users/${username}/setting/bio`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ bio })
				});
			}

			// delete projects
			if (deletedProjects.length) {
				await fetch(`/api/users/${username}/setting/delpro`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ projects: deletedProjects })
				});
			}

			setDeletedProjects([]);
			setPpFile(null);
			setEditingBio(false);
		} catch (err) {
			console.error(err);
		}
	};

	const handleCancel = () => {
		setBio(user?.bio || "");
		setPpFile(null);
		setDeletedProjects([]);
		setEditingBio(false);
	};

	const Skeleton = ({ className }) => (
		<div className={`animate-pulse bg-gray-600/50 rounded ${className}`} />
	);

	console.log("user state ", user)

	return (
		<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] text-black dark:text-white p-6 ">
			<div className="flex justify-center flex-wrap">
				<div className="sm:w-40 sm:h-40 flex items-stretch relative group">
					<label htmlFor="ppinp" className="absolute insert-0 hidden group-hover:flex items-center justify-center bg-black/40 z-10 rounded-full group-hover:cursor-pointer">
						<input
							id="ppinp"
							type="file"
							className="hidden"
							accept=".png,.jpg,.jpeg,.webp,.gif"
							onChange={(e) => setPpFile(e.target.files?.[0])}
						/>
						<Camera size={50}/>
					</label>

					<Image
						src={ppFile ? URL.createObjectURL(ppFile) : (user?.profilepic || "/profile.svg")}
						alt="profile"
						width={160}
						height={160}
						className="rounded-full"
					/>
				</div>

				<div>
					<h1 className="sm:text-4xl text-3xl h-1/2 flex items-end m-3">
						{user ? user.username : (<Skeleton className="w-30 h-5"/>)}
					</h1>
				</div>
			</div>

			<div className="text-center flex items-center justify-center gap-2 my-2">
				{editingBio ? (
					<textarea
						value={bio}
						onChange={(e) => handelbiochange(e.target.value)}
						className="w-1/2 border rounded-md p-2 resize-none outline-none"
					/>
				) : (
					<p className="">{bio || user?.bio}</p>
				)}

				<button
					onClick={() => setEditingBio(!editingBio)}
					className="group p-2 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
				>
					<SquarePen
						size={20}
						className="text-neutral-500 transition-colors duration-200 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200"
					/>
				</button>
			</div>

			<div className="max-w-2xl mx-auto my-30 border-t border-gray-500 pt-4">
				<div className="space-y-3">
					{user?.projects.length ? (
						user?.projects.map((p, i) => (
							<div key={i} className="block rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer bg-white/60 dark:bg-gray-900/40 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200">
								<div className="flex justify-between items-center gap-3">
									<Link href={`/${user.username}/${p.title}`} className="flex-1">
										<h3 className="text-gray-900 dark:text-gray-100 font-medium tracking-wide m-3">
											{p.title}
										</h3>
									</Link>

									<button
										onClick={() => handleDeleteProject(p.title)}
										className="m-1 p-2 rounded-lg cursor-pointer border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 hover:border-red-300 dark:hover:border-red-800 transition-colors duration-200"
									>
										<Trash2 size={22} className="text-red-500 dark:text-red-400 transition-colors duration-200"/>
									</button>
								</div>
							</div>
						))
					) : (
						<p className="text-sm opacity-60 text-center">No projects yet</p>
					)}
				</div>
			</div>

			<form
				onSubmit={(e) => { e.preventDefault(); handleSave(); }}
				className="max-w-2xl mx-auto my-30 border-t border-neutral-300 dark:border-neutral-700 pt-5 flex flex-col gap-2"
			>
				<button type="button" className="w-full text-left px-4 py-3 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200 cursor-pointer" onClick={() => (window.location.href = "/changepass")}>Change Password</button>

				<button type="button" className="w-full text-left px-4 py-3 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer" onClick={() => (window.location.href = "/delacc")}>Delete Account</button>

				<button type="button" className="w-full text-left px-4 py-3 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200 cursor-pointer" onClick={() => (window.location.href = "/logout")}>Logout</button>

				<div className="flex gap-2">
	<button
		type="submit"
		className="flex-1 px-4 py-3 rounded-xl bg-green-500 text-white cursor-pointer transition-all duration-200 hover:bg-green-600 hover:shadow-md active:scale-[0.98]"
	>
		Save
	</button>

	<button
		type="button"
		onClick={handleCancel}
		className="flex-1 px-4 py-3 rounded-xl bg-gray-300 cursor-pointer transition-all duration-200 hover:bg-gray-400 hover:shadow-md active:scale-[0.98] dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
	>
		Cancel
	</button>
</div>
			</form>
		</div>
	)
}
