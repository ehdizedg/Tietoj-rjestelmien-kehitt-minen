import { Link } from 'react-router-dom'

const formatDate = (date) => new Intl.DateTimeFormat('fi-FI', {
	dateStyle: 'long',
}).format(new Date(date))

const formatPrice = (price) => new Intl.NumberFormat('fi-FI', {
	style: 'currency',
	currency: 'EUR',
}).format(price)

export default function ProfilePage({ user }) {
	const productNames = new Map(
		user.purchaseHistory.flatMap((order) => order.items).map((item) => [
			item.productId,
			item.productName ?? item.productId,
		]),
	)

	return (
		<main className="store-page profile-page">
			<div className="profile-layout">
				<header className="profile-heading">
					<div>
						<p className="login-panel__eyebrow">Oma tili</p>
						<h1>Tervetuloa, {user.name}</h1>
						<p>{user.email}</p>
					</div>
					<Link className="profile-heading__link" to="/mainPage">Takaisin kauppaan</Link>
				</header>

				<section className="profile-section" aria-labelledby="purchase-history-title">
					<div className="profile-section__heading">
						<h2 id="purchase-history-title">Ostohistoria</h2>
						<span>{user.purchaseHistory.length} tilausta</span>
					</div>

					{user.purchaseHistory.length ? (
						<div className="purchase-history">
							{user.purchaseHistory
								.slice()
								.sort((first, second) => Date.parse(second.purchasedAt) - Date.parse(first.purchasedAt))
								.map((order) => (
									<article className="purchase-order" key={order.orderId}>
										<header className="purchase-order__header">
											<div>
												<h3>Tilaus {order.orderId}</h3>
												<p>{formatDate(order.purchasedAt)}</p>
											</div>
											<strong>{formatPrice(order.total)}</strong>
										</header>
										<ul>
											{order.items.map((item) => (
												<li key={`${order.orderId}-${item.productId}`}>
													<span>{productNames.get(item.productId)} × {item.quantity}</span>
													<span>{formatPrice(item.unitPrice * item.quantity)}</span>
												</li>
											))}
										</ul>
									</article>
								))}
						</div>
					) : (
						<p className="purchase-history__empty">Ostohistoriaasi ei ole vielä kertynyt.</p>
					)}
				</section>
			</div>
		</main>
	)
}
