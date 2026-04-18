"use client";
import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Link from "next/link";

export default function Signup() {
	const recaptchaRef = useRef(null);
	const [mounted, setMounted] = useState(false);
	const [captchaToken, setCaptchaToken] = useState(null);
	const [error, setError] = useState("")
	const [conformpass, setConformpass] = useState("")
	const inputsRef = useRef([]);
	
	/*useEffect(() => {
	setMounted(true);
}, []);*/


	const [form, setForm] = useState({
		action:"",
		username: "",
		password: "",
		code:Array(6).fill(""),
	});
	
	const handelForget = () =>{
		setForm((prev)=>({
			...prev,
			action: "forget",
			forget: true,
		}))
		console.log(form)
	}

	//if (!mounted) return null;
	const handleChange = (e) => {
		const { name, value } = e.target;

		setForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};
	const handleChangeOTP = (value, index) => {
	if (!/^\d?$/.test(value)) return;

	const newCode = [...form.code];
	newCode[index] = value;

	setForm((prev) => ({
		...prev,
		code: newCode,
	}));

	if (value && index < 5) {
		inputsRef.current[index + 1]?.focus();
	}
};

const handleKeyDownOTP = (e, index) => {
	if (e.key === "Backspace" && !form.code[index] && index > 0) {
		inputsRef.current[index - 1]?.focus();
	}
};
	const getCaptchaToken = () => {
  return new Promise((resolve) => {
    if (!window.grecaptcha) {
      console.error("reCAPTCHA not loaded");
      return;
    }

    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, {
          action: "login",
        })
        .then(resolve);
    });
  });

};

const handleSubmit = async (e) => {
    e.preventDefault();
    setError("")
    if (!e.target.checkValidity()) {
		e.target.reportValidity();
		return;
	}
	if (form.password !== conformpass && form.action !== "verify"){
		setError("Password Doesn't Match")
		return
	}
    // 👉 trigger invisible captcha
    if (!recaptchaRef.current) return;
	recaptchaRef.current.execute();
  };
const handleCaptchaVerify = async (token) => {
    try {
      setCaptchaToken(token);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          captchaToken: token,
        }),
      });
		
      const data = await res.json();
      console.log(data);
      
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
		if (res.status === 201){
			alert("login success");
			window.location.reload()
		}
      else if (res.status>=400){
			setError(data.error)
			return
			
			//alert("Error: " + data.error);
		}
		

      //if (!recaptchaRef.current) return;
      if (form.action === "forget"){
			setForm((prev)=>({
				...prev,
				action:"verify",
				password: "",
				code:Array(6).fill(""),
			}));
			console.log(form)
			return
		}
      setForm({
			action:"",
			username: "",
			password: "",
			code:Array(6).fill(""),
		})
    } catch (err) {
      console.error(err);
    }
  };
	

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#dbffe9] dark:bg-[#0b1120]">
			<form
				onSubmit={handleSubmit}
				className="bg-white dark:bg-[#111827] p-8 rounded-2xl shadow-lg w-[350px] flex flex-col gap-4"
			>
				<h1 className="text-2xl font-bold text-center text-[#00bf00]">
					{form.action !=="" ? "reset password" : "Log In"}
				</h1>
				{error && (
    <p className="text-red-500 text-sm font-medium text-center">
      {error}
    </p>
  )}

				{(["", "forget"].includes(form.action)) ? (
					<>
					{/* Username */}
					<input
						pattern="[a-zA-Z0-9_@.\-]+"
						type="text"
						name="username"
						placeholder="Email or Username"
						value={form.username}
						onChange={handleChange}
						required
						className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-600 dark:text-gray-300 placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#00bf00]"
					/>

					{/* Password */}
					<input
						type="password"
						name="password"
						placeholder="Password"
						value={form.password}
						onChange={handleChange}
						required
						className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-600 dark:text-gray-300 placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#00bf00]"
					/>
					{form.action === "forget" && (
						<input
							type="password"
							name="password"
							placeholder="Conform Password"
							value={conformpass}
							onChange={(e)=>setConformpass(e.target.value)}
							required
							className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-600 dark:text-gray-300 placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#00bf00]"
						/>
					)}
					{form.action ==="" && (<p className="text-end text-blue-500"><button className="underline cursor-pointer" type="button" onClick={handelForget}>Forgot password?</button></p>)}</>
				):(<>
					<div className="flex gap-2">
			{form.code.map((digit, i) => (
				<input
					key={i}
					ref={(el) => (inputsRef.current[i] = el)}
					type="text"
					inputMode="numeric"
					maxLength={1}
					value={digit}
					onChange={(e) => handleChangeOTP(e.target.value, i)}
					onKeyDown={(e) => handleKeyDownOTP(e, i)}
					className="w-10 h-12 text-center text-lg p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-600 dark:text-gray-300 placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#00bf00]"
				/>
			))}
		</div>
				</>)}

				{/* CAPTCHA */}
				<ReCAPTCHA
				ref={recaptchaRef}
					sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
					onChange={handleCaptchaVerify}
					size="invisible"
				/>

				{/* Submit */}
				<button
					type="submit"
					className="bg-[#00bf00] text-white py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
				>
					{form.action !=="" ? "Submit" : "Log In"}
				</button>
				<p className="dark:text-white text-center">Not having an account? <Link className="text-blue-500 underline" href="/signup">Sign up</Link></p>
			</form>
			
		</div>
		
	);
}
