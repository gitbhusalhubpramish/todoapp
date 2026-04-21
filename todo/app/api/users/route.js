import clientPromise from "@/lib/mongodb";

export async function POST(req) {
    const body = await req.json();   // ✅ await
    const username = body.username;

    const client = await clientPromise;
    const db = client.db("projectdata");

    const user = await db.collection("usrdata").findOne({ username }); // ✅ await

    if (!user) {
        return Response.json({ error: "user not found" }, { status: 404 });
    }

    return Response.json({ user });
}
