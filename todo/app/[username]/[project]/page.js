import Project from "./project.js"

export async function generateMetadata({ params }) {
	const { username, project } = await params;

	return {
		title: `${project} by ${username} | Tick It`,
		description: `View ${project}, a project by ${username} on Tick It.`,
	};
}

export default async function project({ params }) {
	//get target username
	const { username, project } = await params

	return (
		<Project username= {username} project={project}/>
	)
}
