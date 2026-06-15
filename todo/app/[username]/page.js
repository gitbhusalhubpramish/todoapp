import Profile from "./profile.js"

export async function generateMetadata({ params }) {
	const { username } = await params;

	return {
		title: `${username} | Tick It`,
		description: `View ${username}'s projects and profile on Tick It.`
	};
}

export default async function ProfilePage({ params }) {
	const {username} = await params
	return (
		<Profile username={username}/>
	)
}
