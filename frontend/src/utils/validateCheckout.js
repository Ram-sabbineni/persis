/**
 * Client-side checkout validation (server still validates and recalculates totals).
 */

export function validateFullName(value) {
  const v = (value || '').trim();
  if (!v) return 'Please enter your full name.';
  if (v.length < 2) return 'Name looks too short.';
  return '';
}

export function validatePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return 'Please enter a phone number.';
  if (digits.length < 10 || digits.length > 15)
    return 'Enter a valid phone number (10–15 digits).';
  return '';
}

export function validateEmail(value) {
  const v = (value || '').trim();
  if (!v) return 'Please enter your email.';
  // Practical email pattern (not exhaustive RFC)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    return 'Enter a valid email address.';
  return '';
}

export function validateCardHolder(value) {
  const v = (value || '').trim();
  if (!v) return 'Please enter the name on the card.';
  return '';
}

export function validateCardNumber(value) {
  const digits = String(value || '').replace(/\s/g, '').replace(/\D/g, '');
  if (!digits) return 'Please enter a card number.';
  if (digits.length < 13 || digits.length > 19)
    return 'Card number should be 13–19 digits.';
  return '';
}

export function validateExpiry(value) {
  const v = (value || '').trim();
  if (!v) return 'Please enter expiry date.';
  const m = v.match(/^(\d{2})\s*\/\s*(\d{2,4})$/);
  if (!m) return 'Use format MM/YY or MM/YYYY.';
  const month = parseInt(m[1], 10);
  if (month < 1 || month > 12) return 'Month must be between 01 and 12.';
  const yearStr = m[2].length === 2 ? `20${m[2]}` : m[2];
  const year = parseInt(yearStr, 10);
  const now = new Date();
  const exp = new Date(year, month, 0, 23, 59, 59);
  if (exp < new Date(now.getFullYear(), now.getMonth(), 1))
    return 'Card appears expired.';
  return '';
}

export function validateCvv(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return 'Please enter CVV.';
  if (digits.length < 3 || digits.length > 4)
    return 'CVV must be 3 or 4 digits.';
  return '';
}
