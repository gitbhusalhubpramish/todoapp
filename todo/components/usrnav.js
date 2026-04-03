import { cookies } from "next/headers";
import Link from "next/link";
import Image from 'next/image';
import options from "@/data/option.json"

async function checkSession() {
    const cookieStore = await cookies(); // ✅ FIX
    const session = cookieStore.get("session");

    return !!session;
}

export default async function UsrNav(){
	//const login = await checkSession()
	const login = true
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
			<Link className="bg-[#26a85a] dark:bg-gray-500 p-2 w-20 text-center dark:text-[#04060d] text-[#004f1f] rounded-md border-1 dark:border-[#04060d] border-[#004f1f] cursor-pointer dark:hover:bg-gray-600 hidden sm:inline-block hover:bg-[#228e4d]" href="/login">
				Log In
			</Link>
			<Link className="dark:bg-green-500 p-2 w-20 text-center text-[#004f1f] rounded-md border-1 dark:border-[#04060d] border-[#004f1f] cursor-pointer bg-[#a6ffc9] dark:hover:bg-[#00A843] hover:bg-[#67ffa3]" href="/signup">
				Sign Up
			</Link>
		</div>
	) : (
		<div className="m-5 w-1/4 flex justify-evenly">
			<button id = "triangleBtn" className="text-white p-1 px-3 rounded-md border-1 border-green-700 dark:bg-green-500 text-center items-center flex cursor-pointer bg-[#26a85a] hover:bg-[#228e4d] dark:hover:bg-[#26a85a] hidden sm:inline-block"><span className="text-2xl mr-px">+</span> New Project</button>
			<div className="relative inline-block">
  <input type="checkbox" id="toggle-triangle" className="hidden peer" />

  <label
    htmlFor="toggle-triangle"
    className="h-10 flex items-center w-15 dark:bg-[#131d37] rounded-md bg-[#73aa89] cursor-pointer relative z-20"
  >
    <div className="size-10 rounded-full">
      {pp ? <img className="size-10 rounded-full" src={pp} alt="profile pic" /> : fallbackSVG}
    </div>

    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-l-5 border-l-transparent border-r-5 border-r-transparent border-b-10 border-b-[#5b6479] transition-transform duration-300 peer-checked:rotate-0 -rotate-180" />
  </label>

  {/* Dropdown menu */}
  <div className="absolute top-10 -left-20 rounded-md z-65 w-40 text-white dark:bg-gray-600 mr-5 overflow-hidden peer-checked:block hidden bg-gray-400 ">
    {options.options.map((item, index) => (
      <Link href={item.href} key={index} className="border-black p-2 border-b-1 block z-30 relative flex">
      <Image width="40" height="40" className="size-5 object-center overflow-hidden mr-2" src={item.img} alt="" />
        {item.option}
      </Link>
    ))}
  </div>

  {/* Fullscreen overlay to detect outside clicks */}
  <label
    htmlFor="toggle-triangle"
    className="fixed inset-0 z-60 h-screen w-screen  peer-checked:block hidden pointer-events-auto"
  />
</div>
		</div>
	)
}
