import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {getCurrentUser} from "@/lib/auth.js"

export default async function AuthLayout({ children }) {
  const session = await getCurrentUser()
  console.log(session)

  if (session) {
    redirect("/");
  }

  return <>{children}</>;
}
