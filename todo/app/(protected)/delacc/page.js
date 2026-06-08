"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, ShieldAlert, Trash2 } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

export default function DeleteAccountPage() {
	//state init
	const [sessionUser, setSessionUser] = useState(null);
	const [checkingSession, setCheckingSession] = useState(true);
	const [step, setStep] = useState("confirm");
	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);
	const recaptchaRef = useRef(null);

	//user auth
	useEffect(() => {
		async function loadSession() {
			try {
				const res = await fetch("/api/me/auth");
				const data = await res.json();

				console.log("session raw data ", data);

				if (!res.ok || !data?.user) {
					window.location.href = "/login";
					return;
				}

				setSessionUser(data.user);
			} catch (err) {
				console.log(err);
				window.location.href = "/login";
			} finally {
				setCheckingSession(false);
			}
		}

		loadSession();
	}, []);

	//request to delete account
	async function requestDeletion() {
		try {
			setLoading(true);
			setError(null);
			setMessage(null);

			// extra frontend session verification
			if (!sessionUser) {
				throw new Error("Unauthorized");
			}

			const res = await fetch(
				`/api/users/${sessionUser.username}/delete/request`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data?.error || "Failed to send OTP");
			}

			setMessage("Verification code sent to your email.");
			setStep("verify");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}

	//verify otp and request to delete
	async function verifyAndDelete() {
		try {
			setLoading(true);
			setError(null);
			setMessage(null);
			if (otp.length !== 6) {
				throw new Error("Invalid OTP");
			}

			// extra frontend session verification
			if (!sessionUser) {
				throw new Error("Unauthorized");
			}
			
			if (!recaptchaRef.current) return;
			recaptchaRef.current.execute();
			
		} catch (err) {
			setError(err.message);
		} 
	}
	
	//handel captcha to verify otp and verify deletion
	const handleCaptchaVerify = async (token) => {
		try {
			const res = await fetch(
				`/api/users/${sessionUser.username}/delete/verify`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ otp, captchaToken: token }),
				}
			);

			const data = await res.json();

			if (!res.ok) {
				recaptchaRef.current.reset();
				throw new Error(data?.error || "Deletion failed");
			}

			setMessage("Account deleted successfully.");

			// clear client storage
			localStorage.clear();
			sessionStorage.clear();
			recaptchaRef.current.reset();

			// redirect after deletion
			setTimeout(() => {
				window.location.href = "/";
			}, 2000);
		}catch (err) {
			setError(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	//loading
	if (checkingSession) {
		return (
			<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] flex items-center justify-center">
				<div className="flex items-center gap-2 text-black dark:text-white">
					<Loader2 className="animate-spin" size={20} />
					Loading...
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] flex items-center justify-center px-4 py-10">
			<div className="w-full max-w-md bg-white dark:bg-[#111827] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl">
				<div className="flex items-center gap-3 mb-6">
					<div className="bg-red-500/20 p-3 rounded-xl">
						<ShieldAlert className="text-red-500" size={28} />
					</div>

					<div>
						<h1 className="text-2xl font-bold text-black dark:text-white">
							Delete Account
						</h1>

						<p className="text-sm text-zinc-600 dark:text-zinc-400">
							Permanently remove your account and all related data.
						</p>
					</div>
				</div>

				<div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
					<p className="text-red-500 font-semibold mb-2">
						Warning: This action is irreversible.
					</p>

					<ul className="text-sm text-red-400 space-y-1 list-disc pl-5">
						<li>All your projects will be deleted.</li>
						<li>Your likes and followers will be removed.</li>
						<li>Your profile and account data will be permanently erased.</li>
						<li>You cannot recover your account after deletion.</li>
					</ul>
				</div>

				{message && (
					<div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
						{message}
					</div>
				)}

				{error && (
					<div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
						{error}
					</div>
				)}

				{step === "confirm" && (
					<div className="space-y-4">
						<p className="text-zinc-700 dark:text-zinc-300 text-sm">
							Are you sure you want to delete your account?
							This action cannot be undone.
						</p>

						<button
							onClick={requestDeletion}
							disabled={loading}
							className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-medium text-white"
						>
							{loading ? (
								<>
									<Loader2 className="animate-spin" size={18} />
									Sending OTP...
								</>
							) : (
								<>
									<Trash2 size={18} />
									Delete My Account
								</>
							)}
						</button>
					</div>
				)}

				{step === "verify" && (
					<div className="space-y-4">
						<div>
							<label className="block text-sm mb-2 text-zinc-700 dark:text-zinc-300">
								Enter Verification Code
							</label>

							<input
								type="text"
								value={otp}
								onChange={(e) =>
									setOtp(
										e.target.value
											.replace(/\D/g, "")
											.slice(0, 6)
									)
								}
								placeholder="6-digit OTP"
								className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 tracking-widest text-center text-lg text-black dark:text-white"
							/>
						</div>

						<p className="text-xs text-zinc-500">
							The verification code expires in 5 minutes.
						</p>
						
						<ReCAPTCHA
							ref={recaptchaRef}
							sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
							onChange={handleCaptchaVerify}
							size="invisible"
							onExpired={() => {
								setError("Captcha expired. Try again.");
							}}
						/>

						<button
							onClick={verifyAndDelete}
							disabled={loading || otp.length !== 6}
							className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-medium text-white"
						>
							{loading ? (
								<>
									<Loader2 className="animate-spin" size={18} />
									Deleting Account...
								</>
							) : (
								<>
									<Trash2 size={18} />
									Verify & Delete
								</>
							)}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
