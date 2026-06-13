"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UsrNav(){
	//initlize session
	const [session, setSessionUser] = useState(null);
	const [unread, setUnread] = useState(false)
	const [login, setLogin] = useState(false)
	const [dropdown, setDropdown] = useState(false)
	const [pp, setpp] = useState(null)
	
	const pathname = usePathname();
	
	//fetch user auth
	useEffect(() => {
		async function loadSession() {
			try {
				const res = await fetch("/api/me/auth");
				const data = await res.json();

				setSessionUser(data.user);
				setLogin(!!data.user)

			} catch (err) {
				console.log(err);
			}
		}
		
		loadSession();
	}, [pathname]);
	
	useEffect(()=>{
		async function checkunread(){
			try{
				const res = await fetch(`/api/users/${session.username}/newnot`)
				const pplink = await fetch(`/api/users/${session.username}/pp`)
				
				const ppdata = await pplink.json()
				const data = await res.json()
				
				setpp(ppdata.profilepic)
				setUnread(data.unread)
			} catch (err){
				console.log(err)
			}
		}
		if (session?.username){
			checkunread()
		}
	}, [pathname, session])
	
	const fallbackSVG = (
		<svg
			width="40"
			height="40"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="rounded-full bg-gray-200"
		>
			<circle cx="12" cy="12" r="12" fill="#e5e7eb" />
			<path
				d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
				fill="#9ca3af"
			/>
		</svg>
	);

	return !login ? (
		<div className="m-5 w-1/4 flex justify-evenly text-white">
			<Link className="bg-[#26a85a] dark:bg-gray-500 p-2 w-20 text-center dark:text-[#04060d] text-[#004f1f] rounded-md border-1 dark:border-[#04060d] border-[#004f1f] cursor-pointer dark:hover:bg-gray-600 hidden sm:inline-block hover:bg-[#228e4d]" href="/login">
				Log In
			</Link>
			<Link className="dark:bg-green-500 p-2 w-20 text-center text-[#004f1f] rounded-md border-1 dark:border-[#04060d] border-[#004f1f] cursor-pointer bg-[#a6ffc9] dark:hover:bg-[#00A843] hover:bg-[#67ffa3]" href="/signup">
				Sign Up
			</Link>
		</div>
	) : (
		<div className="m-5 w-1/4 flex justify-evenly">
			<Link href="/newproject" id = "triangleBtn" className="text-white p-1 px-3 rounded-md border-1 border-green-700 dark:bg-green-500 text-center items-center flex cursor-pointer bg-[#26a85a] hover:bg-[#228e4d] dark:hover:bg-[#26a85a] hidden sm:inline-block"><span className="text-2xl mr-px">+</span> New Project</Link>
			
			<div className="relative inline-block">
				<input type="checkbox" id="toggle-triangle" className="hidden peer" onChange={(e) => setDropdown(e.target.checked)} />

				<label
					htmlFor="toggle-triangle"
					className="h-10 flex items-center w-15 dark:bg-[#131d37] rounded-md bg-[#73aa89] cursor-pointer relative z-20"
				>
					<div className="size-10 rounded-full">
						<div className="">
							{pp ? <img className="size-10 rounded-full" src={pp} alt="profile pic" /> : fallbackSVG}
						</div>
						{((!dropdown) && unread) && (
							<div className="bg-red-500 w-4 h-4 rounded-full z-2 border-2 border absolute bottom-7/10 -left-1/10"/>
						)}
					</div>

					<div className="absolute right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-l-5 border-l-transparent border-r-5 border-r-transparent border-b-10 border-b-[#5b6479] transition-transform duration-300 peer-checked:rotate-0 -rotate-180" />
				</label>

				{/* Dropdown menu */}
				<div className="absolute top-12 right-0 z-65 w-64 overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-[#dbffe9] dark:bg-[#0b1120] shadow-xl peer-checked:block hidden">

					<div className="border-b border-black/10 dark:border-white/10 px-4 py-3">
						<p className="font-medium text-gray-900 dark:text-gray-100">
							@{session.username}
						</p>
					</div>

					<div className="p-2">
						<Link
							href={`/${session.username}`}
							className="block rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-[#00c950]/10 dark:hover:bg-white/5"
						>
							Profile
						</Link>

						<Link
							href="/newproject"
							className="block rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-[#00c950]/10 dark:hover:bg-white/5"
						>
							New Project
						</Link>

						<Link
							href="/notification"
							className="block rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-[#00c950]/10 dark:hover:bg-white/5"
						>
							Notifications
							{unread && (
								<span className="ml-2 inline-block h-2 w-2 rounded-full bg-red-500" />
							)}
						</Link>

						<Link
							href="/setting"
							className="block rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-[#00c950]/10 dark:hover:bg-white/5"
						>
							Settings
						</Link>

						<div className="my-2 border-t border-black/10 dark:border-white/10" />

						<Link
							href="/logout"
							className="block rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-red-500/10"
						>
							Logout
						</Link>

						<Link
							href="/delacc"
							className="block rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10"
						>
							Delete Account
						</Link>
					</div>
				</div>

				{/* Fullscreen overlay to detect outside clicks */}
				<label
					htmlFor="toggle-triangle"
					className="fixed inset-0 z-60 h-screen w-screen  peer-checked:block hidden pointer-events-auto"
				/>
			</div>
		</div>
	)
}
