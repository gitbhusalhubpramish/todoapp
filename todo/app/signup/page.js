"use client";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function Signup() {
  const [captchaToken, setCaptchaToken] = useState(null);

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!captchaToken) {
      alert("Please verify you're not a robot");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log({
      ...form,
      captchaToken,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#dbffe9] dark:bg-[#0b1120]">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#111827] p-8 rounded-2xl shadow-lg w-[350px] flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center text-[#00bf00]">
          Sign Up
        </h1>

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-600 dark:text-gray-300 placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#00bf00]"
        />

        {/* Username */}
        <input
          type="text"
          name="username"
          placeholder="Username"
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

        {/* Confirm Password */}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-600 dark:text-gray-300 placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#00bf00]"
        />

        {/* CAPTCHA */}
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          onChange={(token) => setCaptchaToken(token)}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={!captchaToken}
          className="bg-[#00bf00] text-white py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
