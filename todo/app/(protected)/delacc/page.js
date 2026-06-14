import DeleteAccount from "./delacc.js"

export const metadata = {
	robots: {
		index: false,
		follow: false,
	},
	title: "Delete Account | Tick It",

	description: "Permanently delete your Tick It account and remove associated content."
};

export default function DeleteAccountPage() {
	return (
		<DeleteAccount/>
	)
}
