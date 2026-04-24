// app/api/me/route.js

import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    const user = await getCurrentUser();
    console.log("user form auth ", user)

    if (!user) {
        return Response.json({ user: null });
    }

    return Response.json({ user });
}
