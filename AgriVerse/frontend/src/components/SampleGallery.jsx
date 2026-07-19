import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

/**
 * Shows the sample photos for a single product. The customer must select
 * exactly one sample image before "Add to Cart" is enabled - this is
 * enforced here, not just visually. Adding to cart lets the customer keep
 * browsing and pick up more grains before checking out all at once.
 */
export default function SampleGallery({ product }) {
  const [selectedId, setSelectedId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addToCart, items } = useCart();

  const selectedSample = product.sampleImages.find((s) => s.sampleId === selectedId);
  const alreadyInCart = items.find((i) => i.productId === product._id);

  const handleAddToCart = () => {
    if (!selectedSample) return;
    const qty = Math.max(1, Math.min(Number(quantity) || 1, product.stock));
    addToCart(product, selectedSample, qty);
    setJustAdded(true);
  };

  return (
    <div>
      <div className="selected-product-summary">
        <img src={product.mainImage} alt={product.name} />
        <div>
          <h3 style={{ marginBottom: 4 }}>{product.name}</h3>
          <span className="badge">Stock: {product.stock} kg</span>{" "}
          <span className="badge">&#8377;{product.price} / kg</span>
        </div>
      </div>

      <h2 style={{ fontSize: "1.3rem", marginBottom: 6 }}>Select a sample photo</h2>
      <p style={{ marginBottom: 20, color: "var(--color-sack)" }}>
        Pick the grain sample photo you'd like to receive. You can only add this grain to your
        cart after selecting one.
      </p>

      {product.sampleImages.length === 0 ? (
        <p>No sample images are available for this product yet.</p>
      ) : (
        <div className="sample-gallery-grid">
          {product.sampleImages.map((sample) => (
            <button
              key={sample.sampleId}
              className={`sample-tile ${selectedId === sample.sampleId ? "selected" : ""}`}
              onClick={() => {
                setSelectedId(sample.sampleId);
                setJustAdded(false);
              }}
            >
              <img src={sample.url} alt={`${product.name} sample`} loading="lazy" />
              <span className="sample-tile-check">&#10003;</span>
              <span className="sample-tile-select-btn">
                {selectedId === sample.sampleId ? "Selected" : "Select Sample"}
              </span>
            </button>
          ))}
        </div>
      )}

      {product.stock <= 0 ? (
        <button className="btn btn-primary" disabled>
          Out of Stock
        </button>
      ) : (
        <div className="flow-card" style={{ maxWidth: 420, padding: 20 }}>
          <div className="field-group" style={{ marginBottom: 14 }}>
            <label htmlFor="cart-qty">Quantity (kg)</label>
            <input
              id="cart-qty"
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setJustAdded(false);
              }}
            />
          </div>
          <button className="btn btn-primary" disabled={!selectedSample} onClick={handleAddToCart}>
            Add to Cart
          </button>
          {!selectedSample && (
            <p className="field-hint" style={{ marginTop: 10 }}>
              Select a sample image above to enable adding to cart.
            </p>
          )}
          {alreadyInCart && !justAdded && (
            <p className="field-hint" style={{ marginTop: 10 }}>
              Already in your cart: {alreadyInCart.quantity} kg
            </p>
          )}
          {justAdded && (
            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span className="badge" style={{ background: "var(--color-husk-deep)" }}>
                Added to cart
              </span>
              <Link to="/cart" className="btn btn-gold" style={{ padding: "8px 18px" }}>
                View Cart
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
