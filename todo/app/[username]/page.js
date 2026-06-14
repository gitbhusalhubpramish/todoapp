import Profile from "./profile.js"

export default async function ProfilePage({ params }) {
	const {username} = await params
	return (
		<Profile username={username}/>
	)
}
