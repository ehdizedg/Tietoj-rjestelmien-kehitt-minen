import { useState } from 'react'

const formatPrice = (price) => new Intl.NumberFormat('fi-FI', {
	style: 'currency',
	currency: 'EUR',
}).format(price)

export default function AdminPage({ products, users, onAddProduct, onGrantAdmin }) {
	const [status, setStatus] = useState('')
	const [orderStatus, setOrderStatus] = useState('')
	const [supplierOrders, setSupplierOrders] = useState(() => {
		try {
			const savedOrders = JSON.parse(window.localStorage.getItem('kirja-kauppa-supplier-orders') ?? '[]')
			return Array.isArray(savedOrders) ? savedOrders : []
		} catch {
			return []
		}
	})

	function handleSubmit(event) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		const product = {
			name: String(formData.get('name')).trim(),
			description: String(formData.get('description')).trim(),
			price: Number(formData.get('price')),
			genres: String(formData.get('genres'))
				.split(',')
				.map((genre) => genre.trim())
				.filter(Boolean),
		}

		onAddProduct(product)
		event.currentTarget.reset()
		setStatus(`Tuote "${product.name}" lisättiin tuotelistaan.`)
	}

	function handleOrderSubmit(event) {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		const productId = String(formData.get('product'))
		const quantity = Number(formData.get('quantity'))
		const supplier = String(formData.get('supplier')).trim()
		const product = products.find((candidate) => candidate.id === productId)

		if (!product || !supplier || !Number.isInteger(quantity) || quantity < 1) {
			setOrderStatus('Täytä tilauksen tiedot.')
			return
		}

		const order = {
			id: `ORDER-${Date.now()}`,
			productId: product.id,
			productName: product.name,
			quantity,
			supplier,
			total: product.price * quantity,
			orderedAt: new Date().toISOString(),
		}
		const updatedOrders = [order, ...supplierOrders]
		setSupplierOrders(updatedOrders)

		try {
			window.localStorage.setItem('kirja-kauppa-supplier-orders', JSON.stringify(updatedOrders))
		} catch {
			// The order remains available for the current app session.
		}

		event.currentTarget.reset()
		setOrderStatus(`Tilaus "${product.name}" (${quantity} kpl) lähetettiin toimittajalle ${supplier}.`)
	}

	return (
		<main className="store-page">
			<div className="admin-layout">
				<aside className="admin-catalog" aria-labelledby="admin-catalog-title">
					<div className="admin-catalog__heading">
						<h1 id="admin-catalog-title">Tuotteet</h1>
						<span>{products.length}</span>
					</div>
					<ul className="admin-product-list">
						{products.map((product) => (
							<li className="admin-product-list__item" key={product.id}>
								<span>{product.name}</span>
								<span>{formatPrice(product.price)}</span>
							</li>
						))}
					</ul>
				</aside>

				<section className="admin-form-panel" aria-labelledby="admin-title">
					<header className="admin-form-panel__heading">
						<p className="login-panel__eyebrow">Tuotehallinta</p>
						<h1 id="admin-title">Lisää uusi tuote</h1>
						<p>Täydennä tuotetiedot ja lisää tuote kaupan valikoimaan.</p>
					</header>

					<form className="admin-form" onSubmit={handleSubmit}>
						<div className="login-field">
							<label htmlFor="admin-product-name">Tuotteen nimi</label>
							<input id="admin-product-name" name="name" type="text" required maxLength={100} />
						</div>

						<div className="login-field">
							<label htmlFor="admin-product-description">Kuvaus</label>
							<textarea
								id="admin-product-description"
								name="description"
								rows="4"
								required
								maxLength={500}
							/>
						</div>

						<div className="login-field">
							<label htmlFor="admin-product-price">Hinta (€)</label>
							<input
								id="admin-product-price"
								name="price"
								type="number"
								min="0.01"
								step="0.01"
								required
							/>
						</div>

						<div className="login-field">
							<label htmlFor="admin-product-genres">Kategoriat</label>
							<input
								id="admin-product-genres"
								name="genres"
								type="text"
								placeholder="Esim. fantasia, seikkailu"
							/>
						</div>

						<button className="login-submit" type="submit">Lisää tuote</button>
						<p className="admin-form__status" role="status" aria-live="polite">{status}</p>
					</form>
				</section>
			</div>
			<section className="admin-orders" aria-labelledby="admin-orders-title">
				<header className="admin-orders__heading">
					<div>
						<p className="login-panel__eyebrow">Tavarantoimitus</p>
						<h2 id="admin-orders-title">Tilaa uusia tuotteita</h2>
					</div>
					<span>{supplierOrders.length} tilausta</span>
				</header>

				<div className="admin-orders__content">
					<form className="admin-order-form" onSubmit={handleOrderSubmit}>
						<div className="login-field">
							<label htmlFor="admin-order-product">Tuote</label>
							<select id="admin-order-product" name="product" required>
								<option value="">Valitse tuote</option>
								{products.map((product) => (
									<option value={product.id} key={product.id}>
										{product.name} – {formatPrice(product.price)}
									</option>
								))}
							</select>
						</div>

						<div className="login-field">
							<label htmlFor="admin-order-quantity">Määrä</label>
							<input
								id="admin-order-quantity"
								name="quantity"
								type="number"
								min="1"
								step="1"
								required
								defaultValue="1"
							/>
						</div>

						<div className="login-field">
							<label htmlFor="admin-order-supplier">Toimittaja</label>
							<input
								id="admin-order-supplier"
								name="supplier"
								type="text"
								placeholder="Toimittajan nimi"
								required
								maxLength={100}
							/>
						</div>

						<button className="login-submit" type="submit">Tee tilaus</button>
						<p className="admin-form__status" role="status" aria-live="polite">{orderStatus}</p>
					</form>

					<div className="admin-order-history">
						<h3>Viimeisimmät tilaukset</h3>
						{supplierOrders.length ? (
							<ul>
								{supplierOrders.slice(0, 5).map((order) => (
									<li key={order.id}>
										<div>
											<strong>{order.productName}</strong>
											<span>{order.quantity} kpl · {order.supplier}</span>
										</div>
										<strong>{formatPrice(order.total)}</strong>
									</li>
								))}
							</ul>
						) : (
							<p>Ei vielä tehtyjä tilauksia.</p>
						)}
					</div>
				</div>
			</section>
			<section className="admin-users" aria-labelledby="admin-users-title">
				<header className="admin-users__heading">
					<div>
						<p className="login-panel__eyebrow">Käyttöoikeudet</p>
						<h2 id="admin-users-title">Käyttäjät</h2>
					</div>
					<span>{users.length} käyttäjää</span>
				</header>
				<ul className="admin-user-list">
					{users.map((user) => (
						<li className="admin-user-list__item" key={user.id}>
							<div className="admin-user-list__identity">
								<strong>{user.name}</strong>
								<span>{user.email}</span>
							</div>
							{user.isAdmin ? (
								<span className="admin-role-badge">Ylläpitäjä</span>
							) : (
								<button
									className="admin-grant-button"
									type="button"
									onClick={() => onGrantAdmin(user.id)}
								>
									Anna ylläpitäjän oikeudet
								</button>
							)}
						</li>
					))}
				</ul>
			</section>
		</main>
	)
}
