"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SquarePen, Camera } from "lucide-react";
import { redirect } from "next/navigation";
//           pp      usrname
//           bioooooooooo
//  -----------------------------------
//     project one 				del
//     project 2 				del
//====================================
//  change pass
//	del acc
//	logout
export default function setting({params}){
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

			const res = await fetch(`/api/users/${username}/setting`);

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
	}, [username, session]);
	if (notFoundState){
		notFound()
	}
	if (!user){
		redirect("/login")
	}
	return (
		<></>
	)
}
