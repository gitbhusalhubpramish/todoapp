import clientPromise from "@/lib/mongodb";

export async function GET() {
    const client = await clientPromise;
    const db = client.db("projectdata");

    const usrdata = db.collection("usrdata");

    const users = await usrdata.find({}).toArray();

    return Response.json({
        success: true,
        data: users
    });
}
