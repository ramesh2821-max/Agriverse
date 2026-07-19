import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { media } from "../config/media";
import { categoryList } from "../config/categoryFlow";
import api from "../config/api";
import ProductCard from "../components/ProductCard.jsx";
import { LoadingState } from "../components/LoadingState.jsx";

// Purely decorative CSS grain particles behind the hero video.
function GrainParticles() {
  const particles = Array.from({ length: 26 });
  return (
    <div className="grain-particles" aria-hidden="true">
      {particles.map((_, i) => {
        const left = Math.round(Math.random() * 100);
        const duration = 3 + Math.random() * 4;
        const delay = Math.random() * 5;
        return (
          <span
            key={i}
            className="grain-particle"
            style={{ left: `${left}%`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
          />
        );
      })}
    </div>
  );
}

function Hero() {
  const videoRef = useRef(null);

  const handleEnter = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => {
      // Autoplay-with-sound can be blocked by the browser until the user
      // has interacted with the page - falling back to muted playback.
      v.muted = true;
      v.play().catch(() => {});
    });
  };

  const handleLeave = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
  };

  return (
    <section className="hero" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <div className="hero-video-layer">
        <video ref={videoRef} src={media.heroVideo} loop playsInline preload="auto" />
      </div>
      <div className="hero-scrim" />
      <GrainParticles />
      <div className="hero-content">
        <div className="hero-content-inner">
          <div className="hero-eyebrow">Farm-graded &middot; Sample-verified &middot; Direct to you</div>
          <h1 className="hero-title">
            Grain, bought the way <em>farmers</em> would buy it.
          </h1>
          <p className="hero-sub">
            Browse paddy, ragi, horse gram, chilli, groundnuts and little millets by variety,
            age and quality grade - see a real sample before you order a single kilo.
          </p>
          <div className="hero-cta-row">
            <Link to="/category/paddy" className="btn btn-gold">
              Browse Paddy
            </Link>
            <Link to="/best-sale" className="btn btn-outline" style={{ borderColor: "#fff", color: "#fff" }}>
              See Best Sale
            </Link>
          </div>
          <div className="hero-hint">Hover the sacks to watch the grain fall &darr;</div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">6</div>
              <div className="hero-stat-label">Grain Categories</div>
            </div>
            <div>
              <div className="hero-stat-num">3</div>
              <div className="hero-stat-label">Quality Grades</div>
            </div>
            <div>
              <div className="hero-stat-num">100%</div>
              <div className="hero-stat-label">Sample-first Ordering</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BestSaleTeaser() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get("/api/products/best-sale")
      .then(({ data }) => active && setProducts(data.slice(0, 4)))
      .catch(() => active && setProducts([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingState label="Loading best sale grains" />;
  if (products.length === 0) return null;

  return (
    <section className="page-section">
      <div className="container">
        <div className="section-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%", maxWidth: "none" }}>
          <div>
            <div className="eyebrow">Trending this week</div>
            <h2>Best Sale Grains</h2>
          </div>
          <Link to="/best-sale" className="btn btn-outline">
            View All
          </Link>
        </div>
        <div className="quality-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="page-section">
        <div className="container">
          <div className="section-heading">
            <div className="eyebrow">Shop by grain</div>
            <h2>Every category, graded and ready</h2>
            <p>
              Pick a grain to walk through variety, crop age and quality - each step shows
              real stock and price before you commit.
            </p>
          </div>
          <div className="category-grid">
            {categoryList.map((cat) => (
              <Link key={cat.id} to={`/category/${cat.id}`} className="category-tile">
                <img src={cat.image} alt={cat.label} loading="lazy" />
                <div className="category-tile-label">{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <BestSaleTeaser />

      <section className="page-section" style={{ background: "var(--color-husk-deep)" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <div className="eyebrow">Why Munirathnam Store's</div>
            <h2>See the sample. Then order the sack.</h2>
            <p>
              Every quality grade is backed by real photographed samples, transparent
              per-kilo pricing and live stock counts - so what arrives is exactly what you
              picked.
            </p>
            <Link to="/contact" className="btn btn-primary">
              Talk to Us
            </Link>
          </div>
          <img
            src={media.getOptionImage("home-story", 600, 440)}
            alt="Grain sacks at a farm collection point"
            style={{ borderRadius: 16, boxShadow: "var(--shadow-lift)" }}
          />
        </div>
      </section>
    </>
  );
}
