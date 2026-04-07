import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import OrderSummary from './OrderSummary.jsx';
import './CartDrawer.css';

/**
 * Slide-over cart with line controls and checkout navigation.
 */
export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const {
    lines,
    increment,
    decrement,
    removeLine,
    subtotal,
    discount,
    total,
  } = useCart();

  if (!open) return null;

  const goCheckout = () => {
    onClose();
    navigate('/payment');
  };

  return (
    <div className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button
        type="button"
        className="cart-drawer__backdrop"
        aria-label="Close cart"
        onClick={onClose}
      />
      <aside className="cart-drawer__panel">
        <div className="cart-drawer__head">
          <h2 className="cart-drawer__title">Your order</h2>
          <button
            type="button"
            className="cart-drawer__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Your cart is empty.</p>
            <p className="cart-drawer__empty-hint">
              Browse the menu and tap &quot;Add to Cart&quot; to get started.
            </p>
          </div>
        ) : (
          <>
            <ul className="cart-drawer__items">
              {lines.map((l) => (
                <li key={l.menuItemId} className="cart-drawer__item">
                  <div className="cart-drawer__item-info">
                    <span className="cart-drawer__item-name">{l.name}</span>
                    <span className="cart-drawer__item-price">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(l.price)}
                    </span>
                  </div>
                  <div className="cart-drawer__qty">
                    <button
                      type="button"
                      onClick={() => decrement(l.menuItemId)}
                      aria-label={`Decrease ${l.name}`}
                    >
                      −
                    </button>
                    <span>{l.quantity}</span>
                    <button
                      type="button"
                      onClick={() => increment(l.menuItemId)}
                      aria-label={`Increase ${l.name}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="cart-drawer__remove"
                    onClick={() => removeLine(l.menuItemId)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-drawer__promo" role="status">
              <strong>Get $5 off on orders over $30</strong>
              <span>Applied automatically at checkout when your subtotal reaches $30.</span>
            </div>

            <OrderSummary
              lines={lines}
              subtotal={subtotal}
              discount={discount}
              total={total}
              showLines={false}
            />

            <button
              type="button"
              className="cart-drawer__checkout"
              onClick={goCheckout}
            >
              Checkout
            </button>
          </>
        )}
      </aside>
    </div>
  );
}
