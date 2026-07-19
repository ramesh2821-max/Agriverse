import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../config/api";
import SampleGallery from "../components/SampleGallery.jsx";
import { LoadingState, ErrorState } from "../components/LoadingState.jsx";

export default function ProductSamplePage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get(`/api/products/${productId}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setError("This product could not be found."))
      .finally(() => setLoading(false));
  }, [productId]);

  return (
    <div className="container page-section">
      <div className="breadcrumb-trail">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <Link to="/best-sale">Best Sale</Link>
        <span className="sep">/</span>
        <span>{product ? product.name : "..."}</span>
      </div>

      {loading && <LoadingState label="Loading product" />}
      {error && !loading && <ErrorState message={error} actionLabel="Back to Best Sale" onAction={() => navigate("/best-sale")} />}
      {!loading && !error && product && <SampleGallery product={product} />}
    </div>
  );
}
