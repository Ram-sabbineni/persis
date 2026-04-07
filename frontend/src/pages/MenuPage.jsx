import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import FoodCard from '../components/FoodCard.jsx';
import CartDrawer from '../components/CartDrawer.jsx';
import { useCart } from '../context/CartContext.jsx';
import { fetchMenu } from '../services/api.js';
import './MenuPage.css';

/**
 * Home: hero, promo, menu grid, cart drawer.
 */
export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const { addItem, increment, decrement, lines, cartCount } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMenu();
        if (!cancelled) setMenu(data);
      } catch (e) {
        if (!cancelled) {
          setError(
            e?.response?.data?.detail ||
              e?.message ||
              'Could not load menu. Is the API running?'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const quantityByItemId = useMemo(() => {
    const map = new Map();
    for (const line of lines) map.set(line.menuItemId, line.quantity);
    return map;
  }, [lines]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(menu.map((item) => item.category).filter(Boolean))
    ).sort();
    return ['All', ...unique];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const filtered = menu.filter((item) => {
      const matchCategory =
        activeCategory === 'All' || item.category === activeCategory;
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return filtered;
  }, [menu, activeCategory, searchText, sortBy]);

  const hasActiveFilters = activeCategory !== 'All' || searchText.trim() !== '';

  const clearFilters = () => {
    setActiveCategory('All');
    setSearchText('');
    setSortBy('name-asc');
  };

  return (
    <div className="menu-page">
      <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <section className="menu-hero" aria-labelledby="hero-title">
        <div className="menu-hero__inner">
          <p className="menu-hero__eyebrow">Welcome to</p>
          <h1 id="hero-title" className="menu-hero__title">
            Persis Indian Food
          </h1>
          <p className="menu-hero__subtitle">
            Authentic flavors from the tandoor and kitchen — crafted with care,
            served fresh.
          </p>
        </div>
      </section>

      <section className="menu-promo" aria-label="Promotion">
        <div className="menu-promo__inner">
          <span className="menu-promo__badge">Limited offer</span>
          <p className="menu-promo__text">
            <strong>Get $5 off on orders over $30</strong> — discount applies
            automatically at checkout.
          </p>
        </div>
      </section>

      <main className="menu-main">
        <div className="menu-main__inner">
          <h2 className="menu-main__heading">Our menu</h2>

          {!loading && !error && menu.length > 0 && (
            <section className="menu-tools" aria-label="Menu filters">
              <div className="menu-tools__top">
                <input
                  type="search"
                  className="menu-tools__search"
                  placeholder="Search dishes..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <select
                  className="menu-tools__sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort menu"
                >
                  <option value="name-asc">Sort: Name A-Z</option>
                  <option value="name-desc">Sort: Name Z-A</option>
                  <option value="price-asc">Sort: Price Low to High</option>
                  <option value="price-desc">Sort: Price High to Low</option>
                </select>
              </div>
              <div className="menu-tools__chips">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`menu-chip ${
                      activeCategory === category ? 'menu-chip--active' : ''
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="menu-chip menu-chip--clear"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </section>
          )}

          {!loading && !error && menu.length > 0 && (
            <p className="menu-results">
              Showing {filteredMenu.length} of {menu.length} items
            </p>
          )}

          {loading && (
            <p className="menu-state" role="status">
              Loading menu…
            </p>
          )}
          {error && (
            <div className="menu-state menu-state--error" role="alert">
              {error}
            </div>
          )}
          {!loading && !error && menu.length === 0 && (
            <p className="menu-state">No items available right now.</p>
          )}

          {!loading && !error && menu.length > 0 && filteredMenu.length === 0 && (
            <p className="menu-state">No items match your filters.</p>
          )}

          {!loading && !error && filteredMenu.length > 0 && (
            <div className="menu-grid">
              {filteredMenu.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  quantityInCart={quantityByItemId.get(item.id) || 0}
                  onAdd={addItem}
                  onIncrement={() => increment(item.id)}
                  onDecrement={() => decrement(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="menu-footer">
        <p>© {new Date().getFullYear()} Persis Indian Food</p>
      </footer>
    </div>
  );
}
