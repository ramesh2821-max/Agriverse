import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { categoryFlow, qualityLabel } from "../config/categoryFlow";
import api from "../config/api";
import OptionCard from "../components/OptionCard.jsx";
import QualityCard from "../components/QualityCard.jsx";
import SampleGallery from "../components/SampleGallery.jsx";
import { LoadingState, ErrorState } from "../components/LoadingState.jsx";

/**
 * Drives the entire "Home -> Products -> Paddy -> Jaya -> New -> High
 * Quality -> Samples" flow from a single route: /category/:category/*
 *
 * The splat (the "*" part of the URL) holds every selection made so far,
 * e.g. "jaya/new". Comparing its length against the category's configured
 * `steps` tells us exactly which step to render next.
 */
export default function CategoryFlowPage() {
  const { category, "*": splat } = useParams();
  const navigate = useNavigate();
  const config = categoryFlow[category];

  const selections = splat ? splat.split("/").filter(Boolean) : [];
  const stepIndex = selections.length;
  const isLeaf = config && stepIndex === config.steps.length;
  const currentStepName = config && !isLeaf ? config.steps[stepIndex] : null;

  const [qualityProducts, setQualityProducts] = useState([]);
  const [leafProduct, setLeafProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Build the filter object implied by the selections made so far
  const buildFilter = () => {
    const filter = { category };
    config.steps.forEach((step, i) => {
      if (i < selections.length) filter[step] = selections[i];
    });
    return filter;
  };

  useEffect(() => {
    if (!config) return;
    setError(null);

    if (currentStepName === "quality") {
      setLoading(true);
      const filter = buildFilter();
      api
        .get("/api/products", { params: filter })
        .then(({ data }) => setQualityProducts(data))
        .catch(() => setError("Could not load products for this selection."))
        .finally(() => setLoading(false));
    }

    if (isLeaf) {
      setLoading(true);
      const filter = buildFilter();
      api
        .get("/api/products", { params: filter })
        .then(({ data }) => {
          if (data.length === 0) {
            setError("This exact product could not be found.");
          } else {
            setLeafProduct(data[0]);
          }
        })
        .catch(() => setError("Could not load this product."))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, splat]);

  if (!config) {
    return (
      <div className="container page-section">
        <ErrorState title="Unknown category" message={`We couldn't find a category called "${category}".`} actionLabel="Go home" onAction={() => navigate("/")} />
      </div>
    );
  }

  const goToStep = (value) => {
    navigate(`/category/${category}/${[...selections, value].join("/")}`);
  };

  const breadcrumbParts = [
    { label: "Home", to: "/" },
    { label: config.label, to: `/category/${category}` },
    ...selections.map((sel, i) => ({
      label: config.steps[i] === "quality" ? qualityLabel(sel) : sel[0].toUpperCase() + sel.slice(1),
      to: `/category/${category}/${selections.slice(0, i + 1).join("/")}`,
    })),
  ];

  return (
    <div className="container page-section">
      <div className="breadcrumb-trail">
        {breadcrumbParts.map((part, i) => (
          <span key={part.to} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <span className="sep">/</span>}
            {i === breadcrumbParts.length - 1 ? <span>{part.label}</span> : <Link to={part.to}>{part.label}</Link>}
          </span>
        ))}
      </div>

      {loading && <LoadingState label="Loading" />}
      {error && !loading && <ErrorState message={error} actionLabel="Back to category" onAction={() => navigate(`/category/${category}`)} />}

      {!loading && !error && currentStepName === "variety" && (
        <>
          <div className="section-heading">
            <h2>Choose a {config.label} variety</h2>
          </div>
          <div className="option-grid">
            {config.variety.map((opt) => (
              <OptionCard key={opt.id} image={opt.image} label={opt.label} onClick={() => goToStep(opt.id)} />
            ))}
          </div>
        </>
      )}

      {!loading && !error && currentStepName === "age" && (
        <>
          <div className="section-heading">
            <h2>{config.label}: New or Old crop?</h2>
          </div>
          <div className="option-grid">
            {config.age.map((opt) => (
              <OptionCard key={opt.id} image={opt.image} label={opt.label} onClick={() => goToStep(opt.id)} />
            ))}
          </div>
        </>
      )}

      {!loading && !error && currentStepName === "quality" && (
        <>
          <div className="section-heading">
            <h2>Choose a quality grade</h2>
            <p>Every card shows live stock and price per kilo.</p>
          </div>
          {qualityProducts.length === 0 ? (
            <ErrorState title="No stock available" message="There are no products listed for this selection yet." />
          ) : (
            <div className="quality-grid">
              {qualityProducts.map((p) => (
                <QualityCard key={p._id} product={p} onSelect={() => goToStep(p.quality)} />
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !error && isLeaf && leafProduct && <SampleGallery product={leafProduct} />}
    </div>
  );
}
