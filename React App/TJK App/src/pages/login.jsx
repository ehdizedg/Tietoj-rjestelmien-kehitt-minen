import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import testData from '../components/Test_Data.json'

export default function LoginPage({ onLogin, users = testData.users }) {
	const navigate = useNavigate()
	const [passwordVisible, setPasswordVisible] = useState(false)
	const [status, setStatus] = useState({ message: '', isError: false })

	function handleSubmit(event) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		const email = String(formData.get('email')).trim().toLowerCase()
		const password = String(formData.get('password'))
		const user = users.find((candidate) => (
			candidate.email.toLowerCase() === email && candidate.password === password
		))

		if (user) {
			const signedInUser = {
				id: user.id,
				name: user.name,
				email: user.email,
				purchaseHistory: user.purchaseHistory,
				isAdmin: user.isAdmin === true,
			}
			onLogin(signedInUser)
			navigate('/loginSuccess', {
				state: {
					user: {
						name: signedInUser.name,
						email: signedInUser.email,
					},
				},
			})
			return
		}

		setStatus({
			message: 'Sähköposti tai salasana on virheellinen.',
			isError: true,
		})
	}

	return (
		<main className="store-page login-page">
			<section className="login-panel" aria-labelledby="login-title">
				<div className="login-panel__heading">
					<p className="login-panel__eyebrow">Kirjaudu</p>
					<h1 id="login-title">Tervetuloa takaisin</h1>
					<p>Kirjaudu sisään jatkaaksesi.</p>
				</div>

				<form className="login-form" onSubmit={handleSubmit}>
					<div className="login-field">
						<label htmlFor="login-email">Sähköposti</label>
						<input
							id="login-email"
							name="email"
							type="email"
							autoComplete="email"
							required
						/>
					</div>

					<div className="login-field">
						<div className="login-field__label-row">
							<label htmlFor="login-password">Salasana</label>
							<button
								className="login-password-toggle"
								type="button"
								aria-pressed={passwordVisible}
								onClick={() => setPasswordVisible((visible) => !visible)}
							>
								{passwordVisible ? 'Piilota' : 'Näytä'}
							</button>
						</div>
						<input
							id="login-password"
							name="password"
							type={passwordVisible ? 'text' : 'password'}
							autoComplete="current-password"
							required
							minLength={8}
						/>
					</div>

					<button className="login-submit" type="submit">Kirjaudu sisään</button>
					<p
						className={`login-status${status.isError ? ' is-error' : ' is-success'}`}
						role="status"
						aria-live="polite"
					>
						{status.message}
					</p>
				</form>

				<div className="login-panel__footer">
					<Link to="/mainPage">Takaisin kauppaan</Link>
				</div>
			</section>
		</main>
	)
}
