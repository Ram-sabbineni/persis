import { DISCOUNT_AMOUNT, DISCOUNT_THRESHOLD } from '../context/CartContext.jsx';
import './OrderSummary.css';

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    n
  );

/**
 * Reusable totals block — used in the cart drawer and on checkout.
 */
export default function OrderSummary({
  lines,
  subtotal,
  discount,
  total,
  showLines = true,
  compact = false,
}) {
  return (
    <div className={`order-summary ${compact ? 'order-summary--compact' : ''}`}>
      {showLines && lines.length > 0 && (
        <ul className="order-summary__lines">
          {lines.map((l) => (
            <li key={l.menuItemId} className="order-summary__line">
              <span className="order-summary__line-name">
                {l.name} × {l.quantity}
              </span>
              <span className="order-summary__line-price">
                {money(l.price * l.quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="order-summary__totals">
        <div className="order-summary__row">
          <span>Subtotal</span>
          <span>{money(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="order-summary__row order-summary__row--discount">
            <span>Discount (orders ${DISCOUNT_THRESHOLD}+)</span>
            <span>−{money(discount)}</span>
          </div>
        )}
        <div className="order-summary__row order-summary__row--total">
          <span>Total</span>
          <span>{money(total)}</span>
        </div>
      </div>

      {subtotal > 0 && subtotal < DISCOUNT_THRESHOLD && (
        <p className="order-summary__hint">
          Add {money(DISCOUNT_THRESHOLD - subtotal)} more for ${DISCOUNT_AMOUNT}{' '}
          off (subtotal ≥ ${DISCOUNT_THRESHOLD}).
        </p>
      )}
    </div>
  );
}
