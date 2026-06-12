"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
	//initlize route
	const router = useRouter();
	
	//initlize session
	const [session, setSessionUser] = useState(null);

	//user auth
	useEffect(() => {
		async function loadSession() {
			try {
				const res = await fetch("/api/me/auth");
				const data = await res.json();

				if (!data.user) {
					router.replace("/login");
					return;
				}

				setSessionUser(data.user);
			} catch (err) {
				console.log(err);
			}
		}

		loadSession();
	}, [router]);

	//route push
	useEffect(() => {
		if (session?.username) {
			router.replace(`/${session.username}`);
		}
	}, [session, router]);

	return null;
}
