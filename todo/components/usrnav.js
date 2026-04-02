import { cookies } from "next/headers";

async function checkSession() {
    const cookieStore = await cookies(); // ✅ FIX
    const session = cookieStore.get("session");

    return !!session;
}

export default async function UsrNav(){
	const login = await checkSession()
	console.log("login: ",login)
	return (
		<div className="m-5 w-1/4 flex justify-evenly text-white">
			<button className="bg-[#26a85a] dark:bg-gray-500 p-2 w-20 text-center dark:text-[#04060d] text-[#004f1f] rounded-md border-1 dark:border-[#04060d] border-[#004f1f] cursor-pointer dark:hover:bg-gray-600 hidden sm:inline-block">
				login
			</button>
			<button className="dark:bg-green-500 p-2 w-20 text-center text-[#004f1f] rounded-md border-1 dark:border-[#04060d] border-[#004f1f] cursor-pointer bg-[#a6ffc9] ">
				sign up
			</button>
		</div>
	)
}
