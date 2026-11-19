import { Link } from 'react-router-dom'

const formatPrice = (price) => new Intl.NumberFormat('fi-FI', {
	style: 'currency',
	currency: 'EUR',
}).format(price)

export default function CartPage({ cartItems, onQuantityChange, onRemove }) {
	const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

	if (cartItems.length === 0) {
		return (
			<main className="store-page">
				<section className="cart-empty" aria-labelledby="cart-title">
					<h1 id="cart-title">Ostoskori</h1>
					<p>Ostoskorisi on vielä tyhjä.</p>
					<Link className="cart-button" to="/mainPage">Tutustu tuotteisiin</Link>
				</section>
			</main>
		)
	}

	return (
		<main className="store-page">
			<div className="cart-page">
				<header className="cart-page__header">
					<h1>Ostoskori</h1>
					<p>{cartItems.reduce((count, item) => count + item.quantity, 0)} tuotetta</p>
				</header>

				<div className="cart-layout">
					<section className="cart-items" aria-label="Ostoskorin tuotteet">
						{cartItems.map((item) => (
							<article className="cart-item" key={item.id}>
								<div className="cart-item__details">
									<h2>{item.name}</h2>
									<p>{formatPrice(item.price)} / kpl</p>
								</div>
								<div className="cart-item__controls">
									<div className="quantity-control" aria-label={`${item.name}, määrä ${item.quantity}`}>
										<button
											type="button"
											aria-label={`Vähennä tuotteen ${item.name} määrää`}
											disabled={item.quantity <= 1}
											onClick={() => onQuantityChange(item.id, item.quantity - 1)}
										>
											−
										</button>
										<span aria-live="polite">{item.quantity}</span>
										<button
											type="button"
											aria-label={`Lisää tuotteen ${item.name} määrää`}
											onClick={() => onQuantityChange(item.id, item.quantity + 1)}
										>
											+
										</button>
									</div>
									<button
										className="cart-item__remove"
										type="button"
										onClick={() => onRemove(item.id)}
									>
										Poista
									</button>
								</div>
								<strong className="cart-item__total">
									{formatPrice(item.price * item.quantity)}
								</strong>
							</article>
						))}
						<Link className="cart-continue" to="/mainPage">Jatka ostoksia</Link>
					</section>

					<aside className="cart-summary" aria-labelledby="cart-summary-title">
						<h2 id="cart-summary-title">Yhteenveto</h2>
						<div className="cart-summary__row">
							<span>Välisumma</span>
							<strong>{formatPrice(subtotal)}</strong>
						</div>
						<p className="cart-summary__note">Toimituskulut lasketaan kassalla.</p>
						<div className="cart-summary__total">
							<span>Yhteensä</span>
							<strong>{formatPrice(subtotal)}</strong>
						</div>
					</aside>
				</div>
			</div>
		</main>
	)
}
