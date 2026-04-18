"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#dbffe9] dark:bg-[#0b1120] transition-colors">
      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-xl p-6 w-80 text-center">
        <p className="text-gray-800 dark:text-gray-200 text-lg mb-5">
          Are you sure you want to logout?
        </p>

        <button
          onClick={logout}
          className="w-full bg-red-500 hover:bg-red-600 active:scale-95 transition text-white font-semibold py-2 rounded-lg cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
