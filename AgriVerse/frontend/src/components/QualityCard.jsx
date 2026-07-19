import { qualityLabel } from "../config/categoryFlow";

// Card shown at the quality-selection step. Backed by a real Product
// document, so it always shows live stock and price. Clicking opens the
// sample gallery for that exact product.
export default function QualityCard({ product, onSelect }) {
  const outOfStock = product.stock <= 0;
  return (
    <button className="quality-card" onClick={() => onSelect(product)} disabled={outOfStock}>
      <div className="quality-card-img">
        <img src={product.mainImage} alt={product.name} loading="lazy" />
        <span className="quality-card-quality-tag">{qualityLabel(product.quality)}</span>
      </div>
      <div className="quality-card-body">
        <h3>{product.name}</h3>
        <div className="quality-card-stats">
          <div>
            <div className="stock">Stock: {product.stock} kg</div>
            {outOfStock && <div className="out-of-stock-note">Currently out of stock</div>}
          </div>
          <div className="price">
            &#8377;{product.price}
            <small> /kg</small>
          </div>
        </div>
      </div>
    </button>
  );
}
