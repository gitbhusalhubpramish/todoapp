import Search from "./search.js"
import { Suspense } from "react";

export const metadata = {
	title: "Search Projects, Tasks & Users | Tick It",

	description: "Discover projects, creators, productivity workflows, and public task boards across Tick It."
};

export default function SearchPage() {
	return (
		<Suspense fallback={null}>
			<Search/>
		</Suspense>
	)
}
