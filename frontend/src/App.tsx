import { useEffect, useState } from "react";

function App() {
	const [message, setMessage] = useState("Loading...");
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchHealth = async () => {
			try {
				const response = await fetch("http://localhost:3000/api/health");

				if (!response.ok) {
					throw new Error(`HTTP error: ${response.status}`);
				}

				const data = await response.json();
				setMessage(data.message);
			} catch (err) {
				setError("Failed to reach backend");
				console.error(err);
			}
		};

		fetchHealth();
	}, []);

	return (
		<div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
			<h1>Transcendence</h1>
			<p>Frontend is running.</p>
			<p>Backend message: {message}</p>
			{error && <p>{error}</p>}
		</div>
	);
}

export default App;
