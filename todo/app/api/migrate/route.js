import clientPromise from "@/lib/mongodb";

export async function GET() {
    const client = await clientPromise;
    const db = client.db("projectdata");

    const projects = db.collection("projects");
    const usrdata = db.collection("usrdata");

    // 1. get all projects
    const allProjects = await projects.find({}).toArray();

    // 2. group by username
    const map = new Map();

    for (const p of allProjects) {
        if (!p.owner) {
            console.log("no user");
            continue;
        }

        const key = p.owner; // ✅ FIXED

        if (!map.has(key)) {
            map.set(key, []);
        }

        map.get(key).push({
            projectId: p._id,
            title: p.content.title
        });
    }

    // 3. update usrdata
    const allUsers = await usrdata.find({}).toArray();

    for (const user of allUsers) {
        await usrdata.updateOne(
            { username: user.username },
            {
                $set: {
                    projects: map.get(user.username) || []
                }
            }
        );
    }

    return Response.json({
        success: true,
        totalProjects: allProjects.length,
        groupedUsers: map.size
    });
}
