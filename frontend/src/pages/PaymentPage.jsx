import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import CartDrawer from '../components/CartDrawer.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import { useCart } from '../context/CartContext.jsx';
import { placeOrder } from '../services/api.js';
import {
  validateCardHolder,
  validateCardNumber,
  validateCvv,
  validateEmail,
  validateExpiry,
  validateFullName,
  validatePhone,
} from '../utils/validateCheckout.js';
import './PaymentPage.css';

const initialErrors = {
  fullName: '',
  phone: '',
  email: '',
  cardHolder: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
};

/**
 * Checkout: payment form (simulated), order summary, validation, success state.
 */
export default function PaymentPage() {
  const {
    lines,
    subtotal,
    discount,
    total,
    clearCart,
    cartCount,
  } = useCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [apiError, setApiError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    cardHolder: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    billingAddress: '',
  });
  const [errors, setErrors] = useState(initialErrors);

  const canSubmit = lines.length > 0 && !submitting;

  const fieldClass = (name) =>
    errors[name] ? 'payment-field payment-field--error' : 'payment-field';

  const runValidation = () => {
    const next = {
      fullName: validateFullName(form.fullName),
      phone: validatePhone(form.phone),
      email: validateEmail(form.email),
      cardHolder: validateCardHolder(form.cardHolder),
      cardNumber: validateCardNumber(form.cardNumber),
      expiry: validateExpiry(form.expiry),
      cvv: validateCvv(form.cvv),
    };
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (lines.length === 0) return;
    if (!runValidation()) return;

    setSubmitting(true);
    try {
      const payload = {
        customerName: form.fullName.trim(),
        phoneNumber: form.phone.trim(),
        email: form.email.trim(),
        cardHolderName: form.cardHolder.trim(),
        cardNumber: form.cardNumber.trim(),
        expiry: form.expiry.trim(),
        cvv: form.cvv.trim(),
        billingAddress: form.billingAddress.trim() || null,
        lines: lines.map((l) => ({
          menuItemId: l.menuItemId,
          quantity: l.quantity,
        })),
        subtotal,
        discount,
        total,
      };

      const order = await placeOrder(payload);
      clearCart();
      setSuccess(order);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        'Could not place order. Try again.';
      setApiError(typeof msg === 'string' ? msg : 'Could not place order.');
    } finally {
      setSubmitting(false);
    }
  };

  const successMoney = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }),
    []
  );

  if (success) {
    return (
      <div className="payment-page">
        <Navbar cartCount={0} onCartClick={() => setCartOpen(true)} />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <div className="payment-success">
          <div className="payment-success__card">
            <h1 className="payment-success__title">Thank you!</h1>
            <p className="payment-success__text">
              Your order <strong>#{success.id}</strong> was placed successfully.
              Payment was simulated — no real charge was made.
            </p>
            <p className="payment-success__text">
              Total: <strong>{successMoney.format(success.total)}</strong>
              {success.paymentLast4 && (
                <>
                  {' '}
                  · Card ending in <strong>{success.paymentLast4}</strong>
                </>
              )}
            </p>
            <div className="payment-success__actions">
              <Link to="/" className="payment-success__btn">
                Back to Menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="payment-page">
        <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <div className="payment-empty">
          <h1 className="payment-empty__title">Your cart is empty</h1>
          <p className="payment-empty__text">
            Add items from the menu before checking out.
          </p>
          <Link to="/" className="payment-empty__btn">
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="payment-layout">
        <Link to="/" className="payment-back">
          ← Back to Menu
        </Link>

        <div className="payment-grid">
          <form className="payment-form" onSubmit={handleSubmit} noValidate>
            <h1 className="payment-form__title">Checkout</h1>
            <p className="payment-form__note">
              Demo only — do not use a real card. We never store full card
              numbers; only the last 4 digits are saved on the server.
            </p>

            {apiError && (
              <div className="payment-form__api-error" role="alert">
                {apiError}
              </div>
            )}

            <fieldset className="payment-fieldset">
              <legend>Contact</legend>
              <label className={fieldClass('fullName')}>
                <span>Full name *</span>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />
                {errors.fullName && (
                  <span className="payment-field__err">{errors.fullName}</span>
                )}
              </label>
              <label className={fieldClass('phone')}>
                <span>Phone number *</span>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  placeholder="e.g. 5551234567"
                />
                {errors.phone && (
                  <span className="payment-field__err">{errors.phone}</span>
                )}
              </label>
              <label className={fieldClass('email')}>
                <span>Email *</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && (
                  <span className="payment-field__err">{errors.email}</span>
                )}
              </label>
            </fieldset>

            <fieldset className="payment-fieldset">
              <legend>Payment (simulated)</legend>
              <label className={fieldClass('cardHolder')}>
                <span>Card holder name *</span>
                <input
                  name="cardHolder"
                  value={form.cardHolder}
                  onChange={handleChange}
                  autoComplete="cc-name"
                />
                {errors.cardHolder && (
                  <span className="payment-field__err">
                    {errors.cardHolder}
                  </span>
                )}
              </label>
              <label className={fieldClass('cardNumber')}>
                <span>Card number *</span>
                <input
                  name="cardNumber"
                  inputMode="numeric"
                  value={form.cardNumber}
                  onChange={handleChange}
                  autoComplete="cc-number"
                  placeholder="4111 1111 1111 1111"
                />
                {errors.cardNumber && (
                  <span className="payment-field__err">
                    {errors.cardNumber}
                  </span>
                )}
              </label>
              <div className="payment-form__row">
                <label className={fieldClass('expiry')}>
                  <span>Expiry (MM/YY) *</span>
                  <input
                    name="expiry"
                    value={form.expiry}
                    onChange={handleChange}
                    autoComplete="cc-exp"
                    placeholder="12/28"
                  />
                  {errors.expiry && (
                    <span className="payment-field__err">{errors.expiry}</span>
                  )}
                </label>
                <label className={fieldClass('cvv')}>
                  <span>CVV *</span>
                  <input
                    name="cvv"
                    inputMode="numeric"
                    value={form.cvv}
                    onChange={handleChange}
                    autoComplete="cc-csc"
                    placeholder="123"
                  />
                  {errors.cvv && (
                    <span className="payment-field__err">{errors.cvv}</span>
                  )}
                </label>
              </div>
            </fieldset>

            <fieldset className="payment-fieldset">
              <legend>Billing (optional)</legend>
              <label className="payment-field">
                <span>Billing address</span>
                <textarea
                  name="billingAddress"
                  rows={3}
                  value={form.billingAddress}
                  onChange={handleChange}
                />
              </label>
            </fieldset>

            <button
              type="submit"
              className="payment-form__submit"
              disabled={!canSubmit}
            >
              {submitting ? 'Placing order…' : 'Place Order'}
            </button>
          </form>

          <aside className="payment-aside">
            <h2 className="payment-aside__title">Order summary</h2>
            <div className="payment-aside__promo">
              <strong>$5 off orders $30+</strong> applied automatically when
              eligible.
            </div>
            <OrderSummary
              lines={lines}
              subtotal={subtotal}
              discount={discount}
              total={total}
              compact
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
