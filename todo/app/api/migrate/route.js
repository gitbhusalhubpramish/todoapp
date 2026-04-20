import clientPromise from "@/lib/mongodb";

export async function GET() {
    const client = await clientPromise;
    const db = client.db("projectdata");

    const users = db.collection("users");
    const usrdata = db.collection("usrdata");
    await usrdata.createIndex({ userId: 1 }, { unique: true });

    const existing = await usrdata.distinct("userId");

    const missingUsers = await users.find({
        _id: { $nin: existing }
    }).toArray();

    const docs = missingUsers.map(user => ({
        userId: user._id,
        profilepic: "/profile.svg", // ✅ fixed
        projects: [],
        notifications: [],
        followers: [],
        likedprojects: [],
        following: [],
        createdAt: new Date(),
    }));

    if (docs.length > 0) {
        await usrdata.insertMany(docs);
    }

    return Response.json({
    totalUsers: await users.countDocuments(),
    totalUsrdata: await usrdata.countDocuments(),
    existing,
    missingUsersCount: missingUsers.length,
});
}
