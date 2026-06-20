import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar.js"
import ThemeToggle from "@/components/ThemeToggle.js"
import Footer from "@/components/footer.js"
import Script from "next/script";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "600", "700"],
});

export const metadata = {
	title: "Tick It - Social Todo & Project Management Platform",
	description: "Tick It is a social productivity platform where you can manage tasks, organize projects, share progress, follow creators, and showcase your work through public profiles."
};

export default function RootLayout({ children }) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} ${poppins.className} h-full antialiased`}
		>
		
			<body className="w-screen min-h-screen [&_*]:transition-all [&_*]:duration-300">
				<Navbar/>
				<div className="relative  z-10 top-30 w-full ">
					<Script
						src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
						strategy="afterInteractive"
					/>
					{children}
					<Footer/>
				</div>
			
				<ThemeToggle/>
			</body>
		</html>
	);
}
