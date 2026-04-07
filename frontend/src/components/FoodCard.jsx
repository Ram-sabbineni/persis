import { useEffect, useState } from 'react';
import { publicUrl } from '../utils/publicUrl.js';
import './FoodCard.css';

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect fill='%23e8ddd4' width='400' height='240'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%235c534c' font-family='sans-serif' font-size='16'%3EPersis%3C/text%3E%3C/svg%3E";

/**
 * One menu tile: image, text, price, add to cart.
 * Images live in public/images — see README to swap in your photos.
 */
export default function FoodCard({
  item,
  quantityInCart = 0,
  onAdd,
  onIncrement,
  onDecrement,
}) {
  const [imgSrc, setImgSrc] = useState(
    item.imageUrl ? publicUrl(item.imageUrl) : PLACEHOLDER
  );

  useEffect(() => {
    setImgSrc(item.imageUrl ? publicUrl(item.imageUrl) : PLACEHOLDER);
  }, [item.imageUrl]);

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(item.price);

  return (
    <article className="food-card">
      <div className="food-card__image-wrap">
        <img
          src={imgSrc}
          alt=""
          className="food-card__image"
          onError={() => setImgSrc(PLACEHOLDER)}
          loading="lazy"
        />
      </div>
      <div className="food-card__body">
        <p className="food-card__category">{item.category}</p>
        <h3 className="food-card__title">{item.name}</h3>
        <p className="food-card__desc">{item.description}</p>
        <div className="food-card__footer">
          <span className="food-card__price">{formatted}</span>
          {quantityInCart > 0 ? (
            <div className="food-card__qty" aria-label={`${item.name} quantity`}>
              <button
                type="button"
                className="food-card__qty-btn"
                onClick={onDecrement}
                aria-label={`Decrease ${item.name}`}
              >
                -
              </button>
              <span className="food-card__qty-value">{quantityInCart}</span>
              <button
                type="button"
                className="food-card__qty-btn"
                onClick={onIncrement}
                aria-label={`Increase ${item.name}`}
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="food-card__btn"
              onClick={() => onAdd(item)}
              disabled={!item.isAvailable}
            >
              {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
