"use client";

import { useState } from "react";

function sanitizeInput(value) {
	return value
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.trim();
}

export default function NewProjectPage() {
	const [projectTitle, setProjectTitle] = useState("");
	const [projectDesc, setProjectDesc] = useState("");
	const [tasks, setTasks] = useState([
		{ name: "", description: "" },
	]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleTaskChange = (index, field, value) => {
		const updated = [...tasks];
		updated[index][field] = value;
		setTasks(updated);
	};

	const addTask = () => {
		setError("")
		setTasks([...tasks, { name: "", description: "" }]);
	};

	const deleteTask = (index) => {
		if (tasks.length === 1){
			setError("You must add at least one task")
			return;
		}
		setError("")
		const updated = tasks.filter((_, i) => i !== index);
		setTasks(updated);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const payload = {
				title: sanitizeInput(projectTitle),
				description: sanitizeInput(projectDesc),
				isdone:false,
				tasks: tasks.map((t) => ({
					name: sanitizeInput(t.name),
					description: sanitizeInput(t.description),
					isdone: false,
				})),
			};
			console.log(payload)

			const res = await fetch("/api/newproject", {
				method: "POST",
				credentials: "include", 
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to create project");
			}

			// reset
			setProjectTitle("");
			setProjectDesc("");
			setTasks([{ name: "", description: "" }]);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#dbffe9] dark:bg-[#0b1120] flex justify-center items-start py-10 px-4">
			<div className="w-full max-w-3xl bg-white dark:bg-[#111827] rounded-2xl shadow-lg p-6 space-y-6">
				<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
					Create New Project
				</h1>

				<form onSubmit={handleSubmit} className="space-y-5">
					{/* Project Title */}
					<input
						type="text"
						placeholder="Project Title"
						value={projectTitle}
						onChange={(e) => setProjectTitle(e.target.value)}
						required
						className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
					/>

					{/* Project Description */}
					<textarea
						placeholder="Project Description"
						value={projectDesc}
						onChange={(e) => setProjectDesc(e.target.value)}
						rows={3}
						className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
					/>

					{/* Tasks */}
					<div className="space-y-4">
						<h2 className="font-semibold text-gray-700 dark:text-gray-200">
							Tasks
						</h2>

						{tasks.map((task, index) => (
							<div
								key={index}
								className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3"
							>
								<input
									type="text"
									placeholder="Task Name"
									value={task.name}
									onChange={(e) =>
										handleTaskChange(index, "name", e.target.value)
									}
									className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
								/>

								<textarea
									placeholder="Task Description"
									value={task.description}
									onChange={(e) =>
										handleTaskChange(index, "description", e.target.value)
									}
									rows={2}
									className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
								/>

								<button
									type="button"
									onClick={() => deleteTask(index)}
									className="text-red-500 text-sm hover:underline cursor-pointer"
								>
									Delete Task
								</button>
							</div>
						))}
						<div className="flex justify-end">
							<button
								type="button"
								onClick={addTask}
								className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-green-400 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition cursor-pointer"
							>
								+ Add Task
							</button>
						</div>
					</div>

					{/* Error */}
					{error && (
						<p className="text-red-500 text-sm">{error}</p>
					)}

					{/* Submit */}
					<button
						type="submit"
						disabled={loading}
						className="w-full py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 font-semibold transition cursor-pointer"
					>
						{loading ? "Creating..." : "Create Project"}
					</button>
				</form>
			</div>
		</div>
	);
}
