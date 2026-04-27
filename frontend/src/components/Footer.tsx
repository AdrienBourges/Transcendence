import { Link } from "react-router-dom";

export default function Footer() {
	return (
		<footer style={{
			borderTop: "1px solid #222",
			padding: "20px",
			marginTop: "60px",
			textAlign: "center",
			fontSize: "0.75rem",
			color: "#666",
			fontFamily: "JetBrains Mono, monospace"
		}}>
			<span>42_TRANSCENDENCE</span>
			<span style={{ margin: "0 12px" }}>·</span>
			<Link to="/privacy-policy" style={{ color: "#A2D2FF" }}>
				Privacy Policy
			</Link>
			<span style={{ margin: "0 12px" }}>·</span>
			<Link to="/terms-of-service" style={{ color: "#A2D2FF" }}>
				Terms of Service
			</Link>
		</footer>
	);
}
