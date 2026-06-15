import Followers from "./followers.js"

export async function generateMetadata({ params }) {
	const { username } = await params;

	return {
		title: `${username}'s Followers | Tick It`,

		description: `Explore people following ${username} and discover active creators and project builders.`
	};
}

export default async function followerspage({ params }){
	//get target username
	const {username} = await params
	
	return (
		<Followers username={username}/>
	)
}
