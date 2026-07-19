import { useEffect, useState } from "react";
import api from "../config/api";
import ProductCard from "../components/ProductCard.jsx";
import { LoadingState, ErrorState } from "../components/LoadingState.jsx";

export default function BestSalePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/api/products/best-sale")
      .then(({ data }) => setProducts(data))
      .catch(() => setError("Could not load best sale products."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page-section">
      <div className="section-heading">
        <div className="eyebrow">Trending this week</div>
        <h2>Best Sale Grains</h2>
        <p>Our most popular picks across every category, hand-picked for consistent quality.</p>
      </div>

      {loading && <LoadingState label="Loading best sale grains" />}
      {error && !loading && <ErrorState message={error} />}
      {!loading && !error && products.length === 0 && (
        <ErrorState title="Nothing here yet" message="Check back soon for our best sale picks." />
      )}
      {!loading && !error && products.length > 0 && (
        <div className="quality-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
