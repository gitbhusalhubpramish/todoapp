"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function changepass(){
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
	
	)
}
