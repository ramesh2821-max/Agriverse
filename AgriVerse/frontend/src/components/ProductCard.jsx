import { useNavigate } from "react-router-dom";
import { qualityLabel } from "../config/categoryFlow";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  return (
    <button className="quality-card" onClick={() => navigate(`/product/${product._id}`)}>
      <div className="quality-card-img">
        <img src={product.mainImage} alt={product.name} loading="lazy" />
        <span className="quality-card-quality-tag">{qualityLabel(product.quality)}</span>
      </div>
      <div className="quality-card-body">
        <h3>{product.name}</h3>
        <div className="quality-card-stats">
          <div className="stock">Stock: {product.stock} kg</div>
          <div className="price">
            &#8377;{product.price}
            <small> /kg</small>
          </div>
        </div>
      </div>
    </button>
  );
}
