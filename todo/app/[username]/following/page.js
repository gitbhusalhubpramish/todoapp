import Following from "./following.js"
export default async function followingpage({ params }){
	//get target username
	const {username} = await params
	
	return (
		<Following username={username}/>
	)
}
