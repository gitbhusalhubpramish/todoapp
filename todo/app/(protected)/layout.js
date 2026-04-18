import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { redirect } from "next/navigation";
import {getCurrentUser} from "@/lib/auth"

export default async function ProtectedLayout({ children }) {
  const sessionId = getCurrentUser()

  if (!sessionId) {
    redirect("/login");
  }

  

  return (<>{children}</>)
}
