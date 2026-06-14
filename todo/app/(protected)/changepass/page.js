import ChangePassword from "./changepass.js"

export const metadata = {
	robots: {
		index: false,
		follow: false,
	},
	title: "Change Password | Tick It",

	description: "Update your Tick It account password and keep your account secure."
};

export default function ChangePasswordPage() {
	return (
		<ChangePassword/>
	)
}
