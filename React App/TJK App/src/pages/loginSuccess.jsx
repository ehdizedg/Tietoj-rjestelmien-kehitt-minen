import { Link, useLocation } from 'react-router-dom'

export default function LoginSuccessPage() {
	const { state } = useLocation()
	const user = state?.user

	return (
		<main className="store-page login-page">
			<section className="login-success" aria-labelledby="login-success-title">
				<span className="login-success__mark" aria-hidden="true">
					{user ? '✓' : '!'}
				</span>
				<p className="login-panel__eyebrow">
					{user ? 'Kirjautuminen onnistui' : 'Kirjautumista ei löytynyt'}
				</p>
				<h1 id="login-success-title">
					{user ? `Tervetuloa, ${user.name}!` : 'Kirjaudu ensin sisään'}
				</h1>
				<p className="login-success__message">
					{user
						? 'Olet kirjautunut sisään testitilassa.'
						: 'Tämä sivu tarvitsee voimassa olevan kirjautumisistunnon.'}
				</p>
				{user ? (
					<div className="login-success__actions">
						<Link className="cart-button" to="/profile">Oma tili</Link>
						<Link className="login-success__store-link" to="/mainPage">Jatka kauppaan</Link>
					</div>
				) : (
					<Link className="cart-button" to="/login">Siirry kirjautumaan</Link>
				)}
			</section>
		</main>
	)
}
