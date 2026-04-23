import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
    const { username } = await params;

    const client = await clientPromise;
    const db = client.db("projectdata");

    const user = await db.collection("usrdata").findOne(
        { username },
        {
            projection: {
                _id: 0,
                notifications: 0,
                userId: 0
            }
        }
    );

    if (!user) {
        return Response.json(
            { error: "user not found" },
            { status: 404 }
        );
    }

    return Response.json({ user });
}
