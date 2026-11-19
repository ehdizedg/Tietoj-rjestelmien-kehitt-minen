import { useState } from 'react'
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import MainPage from './components/mainPage.jsx'
import CartPage from './pages/cart.jsx'
import LoginPage from './pages/login.jsx'
import LoginSuccessPage from './pages/loginSuccess.jsx'
import ProfilePage from './pages/profile.jsx'
import AdminPage from './pages/Admin.jsx'
import testData from './components/Test_Data.json'

const SESSION_USER_KEY = 'kirja-kauppa-user'
const ADMIN_IDS_KEY = 'kirja-kauppa-admin-ids'

function getSavedAdminIds() {
  try {
    const savedIds = JSON.parse(window.localStorage.getItem(ADMIN_IDS_KEY) ?? '[]')
    return Array.isArray(savedIds) ? savedIds : []
  } catch {
    return []
  }
}

function getInitialUsers() {
  const savedAdminIds = new Set(getSavedAdminIds())
  return testData.users.map((user) => ({
    ...user,
    isAdmin: user.isAdmin === true || savedAdminIds.has(user.id),
  }))
}

function getSavedUser() {
  try {
    const savedUser = window.sessionStorage.getItem(SESSION_USER_KEY)
    if (!savedUser) return null

    const parsedUser = JSON.parse(savedUser)
    const user = getInitialUsers().find((candidate) => candidate.id === parsedUser.id)
    return user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      purchaseHistory: user.purchaseHistory ?? [],
      isAdmin: user.isAdmin,
    } : null
  } catch {
    return null
  }
}

function App() {
  const [cartItems, setCartItems] = useState([])
  const [products, setProducts] = useState(testData.products)
  const [users, setUsers] = useState(getInitialUsers)
  const [currentUser, setCurrentUser] = useState(getSavedUser)
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  function addProduct(product) {
    setProducts((currentProducts) => [
      ...currentProducts,
      { ...product, id: `product-${Date.now()}` },
    ])
  }

  function addToCart(product) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id)

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [...currentItems, { ...product, quantity: 1 }]
    })
  }

  function updateQuantity(productId, quantity) {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => item.id === productId ? { ...item, quantity } : item)
        .filter((item) => item.quantity > 0),
    )
  }

  function removeFromCart(productId) {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== productId))
  }

  function handleLogin(user) {
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      purchaseHistory: user.purchaseHistory ?? [],
      isAdmin: user.isAdmin === true,
    }

    setCurrentUser(sessionUser)
    try {
      window.sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(sessionUser))
    } catch {
      // The in-memory session remains available if browser storage is disabled.
    }
  }

  function handleLogout() {
    setCurrentUser(null)
    try {
      window.sessionStorage.removeItem(SESSION_USER_KEY)
    } catch {
      // The in-memory session is still cleared.
    }
  }

  function grantAdmin(userId) {
    const updatedUsers = users.map((user) => (
      user.id === userId ? { ...user, isAdmin: true } : user
    ))
    setUsers(updatedUsers)

    try {
      window.localStorage.setItem(
        ADMIN_IDS_KEY,
        JSON.stringify(updatedUsers.filter((user) => user.isAdmin).map((user) => user.id)),
      )
    } catch {
      // The role change remains active for the current app session.
    }

    if (currentUser?.id === userId) {
      const updatedCurrentUser = { ...currentUser, isAdmin: true }
      setCurrentUser(updatedCurrentUser)
      try {
        window.sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(updatedCurrentUser))
      } catch {
        // The in-memory role remains active for the current app session.
      }
    }
  }

  return (
    <BrowserRouter>
      <header className="site-header">
        <NavLink className="site-header__brand" to="/mainPage">Kirja Kauppa</NavLink>
        <nav className="site-nav" aria-label="Päänavigaatio">
          <NavLink to="/mainPage">Tuotteet</NavLink>
          <NavLink to="/cart" className="site-nav__cart">
            Ostoskori <span className="cart-count">{cartCount}</span>
          </NavLink>
          {currentUser?.isAdmin && <NavLink to="/admin">Hallinta</NavLink>}
          {currentUser ? (
            <>
              <NavLink to="/profile">Oma tili</NavLink>
              <button className="site-nav__logout" type="button" onClick={handleLogout}>
                Kirjaudu ulos
              </button>
            </>
          ) : (
            <NavLink to="/login">Kirjaudu</NavLink>
          )}
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<MainPage products={products} onAddToCart={addToCart} />} />
        <Route path="/mainPage" element={<MainPage products={products} onAddToCart={addToCart} />} />
        <Route
          path="/admin"
          element={currentUser?.isAdmin ? (
            <AdminPage
              products={products}
              users={users.map(({ id, name, email, isAdmin }) => ({ id, name, email, isAdmin }))}
              onAddProduct={addProduct}
              onGrantAdmin={grantAdmin}
            />
          ) : (
            <Navigate to={currentUser ? '/mainPage' : '/login'} replace />
          )}
        />
        <Route
          path="/cart"
          element={
            <CartPage
              cartItems={cartItems}
              onQuantityChange={updateQuantity}
              onRemove={removeFromCart}
            />
          }
        />
        <Route path="/login" element={<LoginPage users={users} onLogin={handleLogin} />} />
        <Route path="/loginSuccess" element={<LoginSuccessPage />} />
        <Route
          path="/profile"
          element={currentUser
            ? <ProfilePage user={currentUser} />
            : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

function NotFoundPage() {
  return (
    <main className="route-page">
      <h1>Page not found</h1>
      <NavLink to="/mainPage">Go home</NavLink>
    </main>
  )
}


export default App
