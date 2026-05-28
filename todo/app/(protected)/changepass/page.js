"use client";

import { useEffect, useState, useRef } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
	const router = useRouter();

	const [session, setSessionUser] = useState(null);

	const [formData, setFormData] = useState({
		oldPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [otp, setOtp] = useState("");

	const [show, setShow] = useState({
		old: false,
		new: false,
		confirm: false,
	});

	const [otpSent, setOtpSent] = useState(false);
	const [loading, setLoading] = useState(false);
	const [cooldown, setCooldown] = useState(0);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [captchaToken, setCaptchaToken] = useState(null);
	const recaptchaRefvotp = useRef(null);
	const recaptchaRefsotp = useRef(null);

	useEffect(() => {
		async function loadSession() {
			try {
				const res = await fetch("/api/me/auth");
				const data = await res.json();

				console.log("session raw data ", data);

				setSessionUser(data.user);

				if (!data.user) {
					router.push("/login");
				}
			} catch (err) {
				console.log(err);
			}
		}

		loadSession();
	}, [router]);

	useEffect(() => {
		if (cooldown <= 0) return;

		const timer = setInterval(() => {
			setCooldown((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [cooldown]);

	function handleChange(e) {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	}

	function validatePasswords() {
		const { oldPassword, newPassword, confirmPassword } =
			formData;

		if (
			!oldPassword.trim() ||
			!newPassword.trim() ||
			!confirmPassword.trim()
		) {
			return "All fields are required";
		}

		if (newPassword.length < 8) {
			return "Password must be at least 8 characters";
		}

		if (newPassword !== confirmPassword) {
			return "Passwords do not match";
		}

		if (oldPassword === newPassword) {
			return "New password must be different";
		}

		if (
			!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(
				newPassword
			)
		) {
			return "Weak password";
		}

		return null;
	}

	async function requestOTP() {
		setError("");
		setSuccess("");

		const validationError = validatePasswords();

		if (validationError) {
			setError(validationError);
			return;
		}

		try {
			setLoading(true);

			if (!recaptchaRefsotp.current) return;
			recaptchaRefsotp.current.execute();
		} catch (err) {
			setError("Network error");
		} finally {
			setLoading(false);
		}
	}
	
	const handleCaptchaVerifysotp = async (token) => {
		try {
			setCaptchaToken(token);
			const res = await fetch(
				`/api/users/${session.username}/changepass/request`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				}
			);

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Something went wrong");
				return;
			}

			setOtpSent(true);
			setCooldown(60);
			setSuccess("OTP sent to your email");
		} catch(err){
			setError("something went wrong")
		}
	}
	

	async function verifyOTP() {
		setError("");
		setSuccess("");

		if (!otp.trim()) {
			setError("OTP required");
			return;
		}

		try {
			setLoading(true);
			if (!recaptchaRefvotp.current) return;
			recaptchaRefvotp.current.execute();

		} catch (err) {
			setError("Network error");
		} finally {
			setLoading(false);
		}
	}

	function getStrength(password) {
		let score = 0;

		if (password.length >= 8) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/[a-z]/.test(password)) score++;
		if (/\d/.test(password)) score++;
		if (/[^A-Za-z0-9]/.test(password)) score++;

		if (score <= 2) return "Weak";
		if (score <= 4) return "Medium";
		return "Strong";
	}
	const handleCaptchaVerifyvotp = async (token) => {
		try {
			setCaptchaToken(token);
			const res = await fetch(
				`/api/users/${session.username}/changepass/verify`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						otp,
						captchaToken,
					}),
				}
			);
			setCaptchaToken(null);

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Invalid OTP");
				return;
			}

			setSuccess("Password changed successfully");

			setFormData({
				oldPassword: "",
				newPassword: "",
				confirmPassword: "",
			});

			setOtp("");

			setTimeout(() => {
				router.push("/login");
			}, 1500);

		}
		catch(err){
			console.log(err)
			setError("something went worng")
		}
	}
	if (!session) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#dbffe9] dark:bg-[#0b1120]">
				<Loader2 className="animate-spin text-black dark:text-white" />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#dbffe9] dark:bg-[#0b1120] px-4 transition-colors duration-300">
			<div className="w-full max-w-md bg-[#f4fff8] dark:bg-[#111827] rounded-2xl p-6 border border-[#c9f7db] dark:border-[#1f2937] shadow-xl">
				<h1 className="text-3xl font-bold mb-6 text-[#14532d] dark:text-white">
					Change Password
				</h1>

				{error && (
					<div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg mb-4">
						{error}
					</div>
				)}

				{success && (
					<div className="bg-green-500/20 border border-green-500 text-green-600 dark:text-green-400 p-3 rounded-lg mb-4">
						{success}
					</div>
				)}

				<div className="space-y-4">
					{!otpSent && (
						<>
					<PasswordInput
						label="Old Password"
						name="oldPassword"
						value={formData.oldPassword}
						onChange={handleChange}
						show={show.old}
						setShow={() =>
							setShow({
								...show,
								old: !show.old,
							})
						}
					/>

					<PasswordInput
						label="New Password"
						name="newPassword"
						value={formData.newPassword}
						onChange={handleChange}
						show={show.new}
						setShow={() =>
							setShow({
								...show,
								new: !show.new,
							})
						}
					/>

					<div className="text-sm text-[#15803d] dark:text-[#bbf7d0]">
						Strength:{" "}
						<span className="font-semibold">
							{getStrength(formData.newPassword)}
						</span>
					</div>

					<PasswordInput
						label="Confirm Password"
						name="confirmPassword"
						value={formData.confirmPassword}
						onChange={handleChange}
						show={show.confirm}
						setShow={() =>
							setShow({
								...show,
								confirm: !show.confirm,
							})
						}
					/>
					</>
					)}

					{otpSent && (
						<div>
							<label className="block mb-3 text-sm text-black dark:text-white">
								OTP
							</label>

							<div className="flex gap-2 justify-between">
								{Array.from({ length: 6 }).map((_, index) => (
									<input
										key={index}
										type="text"
										inputMode="numeric"
										maxLength={1}
										value={otp[index] || ""}
										onChange={(e) => {
											const value = e.target.value.replace(
												/\D/g,
												""
											);

											if (!value) return;

											const newOtp =
												otp.split("");

											newOtp[index] = value;

											setOtp(
												newOtp.join("").slice(0, 6)
											);

											if (
												index < 5 &&
												e.target.nextSibling
											) {
												e.target.nextSibling.focus();
											}
										}}
										onKeyDown={(e) => {
											if (
												e.key === "Backspace"
											) {
												const newOtp =
													otp.split("");

												if (otp[index]) {
													newOtp[index] = "";
													setOtp(
														newOtp.join("")
													);
												} else if (
													index > 0
												) {
													e.target
													.previousSibling
													.focus();
	
													newOtp[
														index - 1
													] = "";

													setOtp(
														newOtp.join("")
													);
												}
											}
										}}
										className="w-12 h-14 text-center text-xl font-semibold bg-[#ecfff4] dark:bg-[#182235] border border-[#b7ebcb] dark:border-[#263248] rounded-lg outline-none text-black dark:text-white"
										onPaste={(e) => {
											e.preventDefault();

											const pasted = e.clipboardData
												.getData("text")
												.replace(/\D/g, "")
												.slice(0, 6);

											setOtp(pasted);
										}}
									/>
								))}
							</div>
						</div>
					)}

					{!otpSent ? (
						<>
						{/* CAPTCHA */}
						<ReCAPTCHA
							ref={recaptchaRefsotp}
							sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
							onChange={handleCaptchaVerifysotp}
							size="invisible"
						/>
						<button
							onClick={requestOTP}
							disabled={loading}
							className="w-full bg-[#166534] hover:bg-[#14532d] dark:bg-[#86efac] dark:hover:bg-[#4ade80] text-white dark:text-[#052e16] font-semibold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center transition-colors"
						>
							{loading ? (
								<Loader2 className="animate-spin" />
							) : (
								"Send OTP"
							)}
						</button>
						</>
					) : (
						<>
						<div className="space-y-3">
							{/* CAPTCHA */}
							<ReCAPTCHA
								ref={recaptchaRefvotp}
								sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
								onChange={handleCaptchaVerifyvotp}
								size="invisible"
							/>
							<button
								onClick={verifyOTP}
								disabled={loading}
								className="w-full bg-[#166534] hover:bg-[#14532d] dark:bg-[#86efac] dark:hover:bg-[#4ade80] text-white dark:text-[#052e16] font-semibold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center transition-colors"
							>
								{loading ? (
									<Loader2 className="animate-spin" />
								) : (
									"Verify OTP"
								)}
							</button>

							<button
								onClick={requestOTP}
								disabled={
									cooldown > 0 || loading
								}
								className="w-full bg-[#f0fdf4] dark:bg-[#182235] border border-[#bbf7d0] dark:border-[#263248] py-3 rounded-lg disabled:opacity-50 text-[#166534] dark:text-[#d1fae5] hover:bg-[#dcfce7] dark:hover:bg-[#1d2940] transition-colors"
							>
								{cooldown > 0
									? `Resend in ${cooldown}s`
									: "Resend OTP"}
							</button>
						</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

function PasswordInput({
	label,
	name,
	value,
	onChange,
	show,
	setShow,
}) {
	return (
		<div>
			<label className="block mb-2 text-sm font-medium text-[#166534] dark:text-[#bbf7d0]">
				{label}
			</label>

			<div className="relative">
				<input
					type={show ? "text" : "password"}
					name={name}
					value={value}
					onChange={onChange}
					className="w-full bg-[#ecfff4] dark:bg-[#182235] border border-[#b7ebcb] dark:border-[#263248] rounded-lg px-4 py-3 outline-none pr-12 text-black dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400"

				/>

				<button
					type="button"
					onClick={setShow}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-300"
				>
					{show ? (
						<EyeOff size={20} />
					) : (
						<Eye size={20} />
					)}
				</button>
			</div>
		</div>
	);
}
