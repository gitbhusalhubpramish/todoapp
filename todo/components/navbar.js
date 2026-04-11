import UsrNav from "./usrnav.js"
export default function Navbar(){
	
	return (
		<nav className="h-30 fixed z-20 insert-0 w-full bg-[#00c950] dark:bg-[#060a15] border-b-2 dark:border-[#04060d] border-[#149d4b] flex justify-center items-center">
			<div className="w-full flex">
				<div className="sm:w-1/4 flex items-center">
					<h1 className="sm:ml-10 ml-7 mr-5 text-2xl dark:text-green-500 font-bold"><a href="/">ToDo</a></h1>
				</div>
				<div className="relative flex-1 flex items-center">
					<input
						type="text"
						placeholder="Search..."
						className="w-full pl-3 pr-10 py-2 border rounded-lg border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-400"
					/>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
					</svg>
				</div>
				<UsrNav/>
			</div>
		</nav>
	)
}
