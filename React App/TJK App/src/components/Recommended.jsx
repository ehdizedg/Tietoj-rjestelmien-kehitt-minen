const DAY_IN_MS = 24 * 60 * 60 * 1000

function getRecommendations({
	products,
	users,
	userId,
	excludeProductId,
	limit = 2,
}) {
	const user = users.find((candidate) => candidate.id === userId)
	const purchaseHistory = user?.purchaseHistory ?? []
	const purchasedProductIds = new Set()
	const genreInterests = new Map()
	const popularity = new Map()
	const productById = new Map(products.map((product) => [product.id, product]))
	const orderTimestamps = purchaseHistory
		.map((order) => Date.parse(order.purchasedAt))
		.filter(Number.isFinite)
	const latestPurchaseAt = orderTimestamps.length ? Math.max(...orderTimestamps) : 0

	for (const customer of users) {
		for (const order of customer.purchaseHistory ?? []) {
			for (const item of order.items ?? []) {
				popularity.set(
					item.productId,
					(popularity.get(item.productId) ?? 0) + item.quantity,
				)
			}
		}
	}

	for (const order of purchaseHistory) {
		const purchasedAt = Date.parse(order.purchasedAt)
		const daysBeforeLatest = latestPurchaseAt && Number.isFinite(purchasedAt)
			? Math.max(0, (latestPurchaseAt - purchasedAt) / DAY_IN_MS)
			: 0
		const recencyWeight = 1 / (1 + daysBeforeLatest / 30)

		for (const item of order.items ?? []) {
			purchasedProductIds.add(item.productId)
			const product = productById.get(item.productId)
			const genres = product?.genres ?? []

			for (const genre of genres) {
				const interest = (item.quantity * recencyWeight) / genres.length
				genreInterests.set(genre, (genreInterests.get(genre) ?? 0) + interest)
			}
		}
	}

	return products
		.filter((product) => (
			!purchasedProductIds.has(product.id) && product.id !== excludeProductId
		))
		.map((product) => {
			const genres = product.genres ?? []
			const genreScore = genres.length
				? genres.reduce((score, genre) => score + (genreInterests.get(genre) ?? 0), 0) / genres.length
				: 0

			return {
				...product,
				genreScore,
				popularityScore: popularity.get(product.id) ?? 0,
				reason: genreScore > 0
					? 'Perustuu lukuhistoriaasi'
					: 'Suosittu muiden lukijoiden keskuudessa',
			}
		})
		.sort((first, second) => (
			second.genreScore - first.genreScore
			|| second.popularityScore - first.popularityScore
			|| first.name.localeCompare(second.name, 'fi')
		))
		.slice(0, limit)
}

const formatPrice = (price) => new Intl.NumberFormat('fi-FI', {
	style: 'currency',
	currency: 'EUR',
}).format(price)

export default function Recommended({ products, users, userId, excludeProductId }) {
	const recommendations = getRecommendations({
		products,
		users,
		userId,
		excludeProductId,
	})

	return (
		<section className="recommendations" aria-labelledby="recommendations-title">
			<h2 id="recommendations-title">Suosituksia</h2>
			{recommendations.length ? (
				<ul className="recommendation-list">
					{recommendations.map((product) => (
						<li className="recommendation-list__item" key={product.id}>
							<span className="recommendation-list__name">{product.name}</span>
							<span className="recommendation-list__reason">{product.reason}</span>
							<span className="recommendation-list__price">{formatPrice(product.price)}</span>
						</li>
					))}
				</ul>
			) : (
				<p>Ei suosituksia tällä hetkellä.</p>
			)}
		</section>
	)
}
