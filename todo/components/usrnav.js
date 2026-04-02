import { cookies } from "next/headers";

async function checkSession() {
    const cookieStore = await cookies(); // ✅ FIX
    const session = cookieStore.get("session");

    return !!session;
}

export default async function UsrNav(){
	const login = await checkSession()
	let pp
	const fallbackSVG = (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-full bg-gray-200"
    >
      <circle cx="12" cy="12" r="12" fill="#e5e7eb" />
      <path
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
        fill="#9ca3af"
      />
    </svg>
  );
	console.log("login: ",login)
	return !login ? (
		<div className="m-5 w-1/4 flex justify-evenly text-white">
			<button className="bg-[#26a85a] dark:bg-gray-500 p-2 w-20 text-center dark:text-[#04060d] text-[#004f1f] rounded-md border-1 dark:border-[#04060d] border-[#004f1f] cursor-pointer dark:hover:bg-gray-600 hidden sm:inline-block hover:bg-[#228e4d]">
				Log In
			</button>
			<button className="dark:bg-green-500 p-2 w-20 text-center text-[#004f1f] rounded-md border-1 dark:border-[#04060d] border-[#004f1f] cursor-pointer bg-[#a6ffc9] dark:hover:bg-[#00A843] hover:bg-[#67ffa3]">
				Sign Up
			</button>
		</div>
	) : (
		<div className="m-5 w-1/4 flex justify-evenly">
			<button className="text-white p-1 px-3 rounded-md border-1 border-green-700 dark:bg-green-500 text-center items-center flex cursor-pointer bg-[#26a85a] hover:bg-[#228e4d] dark:hover:bg-[#26a85a]"><span className="text-2xl mr-px">+</span> New Project</button>
			<button className="h-10 flex items-center w-15 dark:bg-[#131d37] rounded-md bg-[#73aa89] cursor-pointer">
				<div className="size-10 rounded-full ">
					{pp ? (
						<img className="size-10 rounded-full" src={pp} alt="profile pic" />
					) : (
						fallbackSVG
					)}
				</div>
				<div className="w-0 h-0 border-l-5 border-l-transparent border-r-5 border-r-transparent border-b-10 border-b-[#5b6479] mx-auto" />
			</button>
		</div>
	)
}
