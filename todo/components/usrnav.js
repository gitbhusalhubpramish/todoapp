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
		<div className="m-5 flex">
			<button>
				login
			</button>
			<button>
				signin
			</button>
		</div>
	)
}
