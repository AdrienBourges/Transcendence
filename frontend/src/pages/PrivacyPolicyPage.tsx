export default function PrivacyPolicyPage() {
	return (
		<main style={{ maxWidth: "900px", margin: "80px auto", padding: "20px", color: "#eee", lineHeight: 1.7 }}>
			<h1>Privacy Policy</h1>

			<p>
				This Privacy Policy explains how ft_transcendence handles user data inside the application.
				The project is a student web application created for the 42 curriculum.
			</p>

			<h2>Data we collect</h2>
			<p>
				The application may store account information such as username, email address, password hash,
				42 OAuth identifier, profile information, avatar URL, friendships, group memberships,
				group invitations, project registrations, conversations, and chat messages.
			</p>

			<h2>How data is used</h2>
			<p>
				Data is used only to provide the application features: authentication, user profiles,
				friend management, group management, project registration browsing, private chat,
				and online presence.
			</p>

			<h2>Passwords and authentication</h2>
			<p>
				Passwords are not stored in plain text. They are hashed before being saved.
				OAuth authentication may be used through the 42 API when the user chooses to sign in with 42.
			</p>

			<h2>Uploaded files</h2>
			<p>
				Users may upload avatar images. These files are used only to display the user profile/avatar
				inside the application.
			</p>

			<h2>Data sharing</h2>
			<p>
				The project does not sell or share user data with third parties. Data is only used inside
				the application and for project evaluation purposes.
			</p>

			<h2>Data deletion</h2>
			<p>
				Users can update some profile data and delete some content they created, such as project
				registrations or groups where permitted by the application rules.
			</p>

			<h2>Contact</h2>
			<p>
				For questions about this project, contact the project team members listed in the repository README.
			</p>
		</main>
	);
}
