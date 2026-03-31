export default function Navbar(){
	return (
		<nav className="h-30 w-full bg-[#00c950] dark:bg-[#060a15] border-b-2 dark:border-[#04060d] flex justify-center items-center">
			<div className="w-full flex">
				<div className="w-1/3">
					<h1 className="ml-10  text-2xl dark:text-green-500 font-bold"><a href="/">ToDo</a></h1>
				</div>
				<div class="relative w-1/3">
  <input
    type="text"
    placeholder="Search..."
    className="w-full pl-3 pr-10 py-2 border rounded-lg
           border-gray-300 bg-white text-gray-900
           focus:outline-none focus:ring-2 focus:ring-blue-500
           dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
           dark:focus:ring-blue-400"
  />
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
  </svg>
</div>
			</div>
		</nav>
	)
}
