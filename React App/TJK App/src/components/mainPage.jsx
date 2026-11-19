import { useState } from 'react'
import testData from './Test_Data.json'
import Recommended from './Recommended.jsx'
import AboutFooter from '../pages/about.jsx'

const formatPrice = (price) => new Intl.NumberFormat('fi-FI', {
	style: 'currency',
	currency: 'EUR',
}).format(price)

export default function MainPage({ onAddToCart, products = testData.products }) {
	const [selectedId, setSelectedId] = useState(products[0].id)
	const selectedProduct = products.find((product) => product.id === selectedId)

	return (
		<>
		<main className="store-page">
			<div className="store-layout">
				<aside className="product-sidebar" aria-labelledby="product-list-title">
					<h1 className="product-sidebar__title" id="product-list-title">Tuotelista</h1>
					<div className="product-list" aria-label="Valitse tuote">
						{products.map((product) => (
							<button
								className={`product-list__item${product.id === selectedId ? ' is-selected' : ''}`}
								type="button"
								key={product.id}
								aria-pressed={product.id === selectedId}
								onClick={() => setSelectedId(product.id)}
							>
								<span>{product.name}</span>
								<span className="product-list__price">{formatPrice(product.price)}</span>
							</button>
						))}
					</div>
					<Recommended
						products={products}
						users={testData.users}
						userId={testData.users[0]?.id}
						excludeProductId={selectedId}
					/>
				</aside>

				<section className="product-detail" aria-labelledby="selected-product-title">
					<h2 className="product-detail__title" id="selected-product-title">
						{selectedProduct.name}
					</h2>
					<div className="product-detail__body">
						<div className="product-image" role="img" aria-label={`Kuva tuotteesta ${selectedProduct.name}`}>
							<span aria-hidden="true">Kuva</span>
						</div>
						<div className="product-info">
							<section>
								<h3>Kuvaus</h3>
								<p>{selectedProduct.description}</p>
							</section>
							<section>
								<h3>Hinta</h3>
								<p className="product-info__price">{formatPrice(selectedProduct.price)}</p>
							</section>
							<button
								className="product-info__add"
								type="button"
								onClick={() => onAddToCart(selectedProduct)}
							>
								Lisää ostoskoriin
							</button>
						</div>
					</div>
				</section>
			</div>
		</main>
		<AboutFooter />
		</>
	)
}
