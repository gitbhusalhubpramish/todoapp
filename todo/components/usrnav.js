import { cookies } from "next/headers";

function checkSession() {
    const cookieStore = cookies();
    const session = cookieStore.get("session"); // your session key

    return !!session; // true = exists, false = not
}

export default function UsrNav(){
	return (
		<></>
	)
}
