import Link from "next/link";
export default function Home() {
  return (
    <>
	<div className="h-full min-h-screen overflow-visible bg-[#dbffe9] dark:bg-[#0b1120] text-[#00bf00] flex flex-wrap overflow-x-hidden ">
		<div className="sm:ml-50 sm:mt-20 ml-10 mt-5 font-bold font-[montserrat] ">
			<h1 className="sm:text-7xl text-6xl">Sttater</h1>
			<h1 className="sm:text-9xl text-8xl">Walls,</h1>
			<h1 className="sm:text-7xl mt-1 text-6xl">Stack</h1>
			<h1 className="sm:text-9xl text-8xl">Bricks.</h1>
		</div>
		<div className="flex-1 ">
			<div className="h-2/3 sm:flex justify-center items-center w-full flex-col">
				<div className="m-15 aspect-square size-50 border-30 rounded-3xl border-[#00bf00] flex">
					<div className="h-11/10 w-4/10 bg-[#00bf00] -rotate-30 rounded-full border-10 border-[#dbffe9] dark:border-[#0b1120]"/>
					<div className="h-2/1 w-4/10 relative rotate-50 bottom-24 left-16 rounded-full flex items-end bg-[#dbffe9] dark:bg-[#0b1120]">
						<div className="bg-[#00bf00] w-8/10 h-9/10 relative rounded-full"/>
					</div>
				</div>
			<div className="items-end flex">
				<p className="dark:text-white text-gray-500">
					Get started by <Link href="/login" className="text-blue-500 underline">logging in</Link> or <Link href="signup" className="text-blue-500 underline">signing up</Link>
				</p>
			</div>
			</div>
		</div>
	</div>
    </>
  );
}
