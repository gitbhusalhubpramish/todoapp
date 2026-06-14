import Followers from "./followers.js"
export default async function followerspage({ params }){
	//get target username
	const {username} = await params
	
	return (
		<Followers username={username}/>
	)
}
