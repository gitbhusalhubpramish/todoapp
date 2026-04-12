"useclient"
import Link from "next/link";
export default function Footer(){
	return (
		<>
			<div className="relative top-30 p-3 dark:bg-[#070a13] bg-[#a6d5b8] dark:text-white flex flex-col justify-center">
				<div className="flex justify-center">
					<p>© 2025 Pramish Bhusal. All rights reserved.</p>
				</div>
				<div>
					
				</div>
				<div className="flex justify-center">
					<div>
					<h1 className="text-xl text-center">Tech stack</h1>
					<p>Built with Next.js · Tailwind CSS · React</p>
					</div>
				</div>
				<div className="flex justify-center m-2">
					<p>Source available on <a className="underline text-blue-500 hover:text-blue-600" href="https://github.com/gitbhusalhubpramish/portfilo">GitHub</a></p>
				</div>
			</div>
		</>
	)
}
