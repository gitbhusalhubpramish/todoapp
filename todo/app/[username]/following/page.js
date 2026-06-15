import Following from "./following.js"

export async function generateMetadata({ params }) {
	const { username } = await params;

	return {
		title: `${username} Following | Tick It`,

		description: `See creators, projects, and productivity enthusiasts followed by ${username}.`
	};
}

export default async function followingpage({ params }){
	//get target username
	const {username} = await params
	
	return (
		<Following username={username}/>
	)
}
