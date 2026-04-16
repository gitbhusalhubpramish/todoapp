import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {getCurrentUser} from "@/lib/auth.js"

export default function AuthLayout({ children }) {
  const session = getCurrentUser()

  if (session) {
    redirect("/");
  }

  return <>{children}</>;
}
