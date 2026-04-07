import { Link } from 'react-router-dom';
import './Navbar.css';

/**
 * Top bar: brand + optional cart button with badge count.
 */
export default function Navbar({ onCartClick, cartCount }) {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-mark" aria-hidden="true" />
          <span className="navbar__brand-text">Persis</span>
        </Link>
        <nav className="navbar__actions" aria-label="Main">
          <Link to="/" className="navbar__link">
            Menu
          </Link>
          <button
            type="button"
            className="navbar__cart"
            onClick={onCartClick}
            aria-label={`Open cart, ${cartCount} items`}
          >
            <span className="navbar__cart-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                <circle cx="18" cy="20" r="1.5" fill="currentColor" />
              </svg>
            </span>
            {cartCount > 0 && (
              <span className="navbar__cart-badge">{cartCount}</span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
