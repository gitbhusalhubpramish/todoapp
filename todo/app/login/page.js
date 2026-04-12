"use client";
import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    isRobotVerified: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.isRobotVerified) {
      alert("Please verify you're not a robot");
      return;
    }

    console.log(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#dbffe9] dark:bg-[#0b1120]">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#111827] p-8 rounded-2xl shadow-lg w-[350px] flex flex-col gap-5"
      >
        <h1 className="text-2xl font-bold text-center text-[#00bf00]">
          Login
        </h1>

        <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} required className="p-3 rounded-lg border  border-gray-300 dark:border-gray-600  bg-transparent dark:text-gray-400 text-gray-600 placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#00bf00]"
/>

<input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent dark:text-gray-400 text-gray-600 placeholder:text-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#00bf00]"
/>

        {/* Robot Verification */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            name="isRobotVerified"
            checked={form.isRobotVerified}
            onChange={handleChange}
            className="accent-[#00bf00] w-4 h-4"
          />
          I'm not a robot
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="bg-[#00bf00] text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
