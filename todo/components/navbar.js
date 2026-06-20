import UsrNav from "./usrnav.js";
import Search from "./search.js";

export default function Navbar() {
	return (
		<nav className="fixed top-0 left-0 right-0 z-20 h-30 bg-[#00c950] dark:bg-[#060a15] border-b-2 border-[#149d4b] dark:border-[#04060d]">
			<div className="max-w-7xl mx-auto h-full flex items-center">
				
				{/* Logo */}
				<div className="flex items-center px-4 sm:px-8">
					<a
						href="/"
						className="flex items-center transition-transform duration-200 hover:scale-105"
					>
						<img
							src="/tickit.png"
							alt="TickIt"
							className="h-15 w-auto object-contain"
						/>
					</a>
				</div>

				{/* Search */}
				<Search />

				{/* User Navigation */}
				<UsrNav />
			</div>
		</nav>
	);
}
