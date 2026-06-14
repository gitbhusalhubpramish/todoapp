import LogoutButton from "./logout.js"

export const metadata = {
	robots: {
		index: false,
		follow: false,
	},
	title: "Sign Out | Tick It",

	description:"Securely sign out of your Tick It account."
};

export default function LogoutButtonpage() {
	return (
		<LogoutButton/>
	)
}
