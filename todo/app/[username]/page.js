"use client";

import { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";

export default function ProfilePage({ params }) {
    const { username } = use(params)

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFoundState, setNotFoundState] = useState(false);

    useEffect(() => {
        async function loadUser() {
            setLoading(true);

            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });

            if (res.status === 404) {
                setNotFoundState(true);
                setLoading(false);
                return;
            }

            const data = await res.json();
            setUser(data.user);
            setLoading(false);
        }

        loadUser();
    }, [username]);

    if (notFoundState) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] text-black dark:text-white p-6">
            <div className="flex justify-center">
                <h1>{user?.username}</h1>
            </div>
        </div>
    );
}
