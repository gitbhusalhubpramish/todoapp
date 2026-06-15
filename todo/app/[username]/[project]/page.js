import Project from "./project.js"

export default async function project({ params }) {
	//get target username
	const { username, project } = await params

	return (
		<Project username= {username} project={project}/>
	)
}
