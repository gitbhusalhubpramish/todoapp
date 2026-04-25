"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation";
import { Folder, Heart } from "lucide-react";
import { redirect } from "next/navigation";

export default function project({ params }){
	const { username, project } = use(params)

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
	
	return (
		<></>
	)
}
