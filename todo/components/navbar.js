import UsrNav from "./usrnav.js"
import Search form "./search.js"
export default function Navbar(){
	
	return (
		<nav className="h-30 fixed z-20 insert-0 w-full bg-[#00c950] dark:bg-[#060a15] border-b-2 dark:border-[#04060d] border-[#149d4b] flex justify-center items-center">
			<div className="w-full flex">
				<div className="sm:w-1/4 flex items-center">
					<h1 className="sm:ml-10 ml-7 mr-5 text-2xl dark:text-green-500 font-bold"><a href="/">ToDo</a></h1>
				</div>
				<Search/>
				<UsrNav/>
			</div>
		</nav>
	)
}
