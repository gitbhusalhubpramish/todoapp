import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }) {
  const sessionId = cookies().get("sessionId")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  const db = (await clientPromise).db("app");

  const session = await db.collection("sessions").findOne({
    sessionId,
  });

  if (!session) {
    cookies().set("sessionId", "", {
      maxAge: 0,
      path: "/",
    });

    redirect("/login");
  }

  return <>{children}</>;
}
