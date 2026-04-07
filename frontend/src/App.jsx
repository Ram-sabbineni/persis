import { Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';

/**
 * App shell: React Router renders exactly one page per URL (not a single static page).
 * Browser: / and /payment  ·  Hash: #/ and #/payment
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/payment" element={<PaymentPage />} />
    </Routes>
  );
}
