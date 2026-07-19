import { Link } from "react-router-dom";
import { categoryList } from "../config/categoryFlow";
import { media } from "../config/media";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>{media.logoText}</h4>
            <p>
              A direct line between grain-growing farms and your kitchen or godown - graded,
              sampled and priced honestly, with no middlemen in between.
            </p>
          </div>
          <div>
            <h4>Grains</h4>
            {categoryList.map((cat) => (
              <Link key={cat.id} to={`/category/${cat.id}`}>
                {cat.label}
              </Link>
            ))}
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/best-sale">Best Sale</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/admin/login">Admin Login</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Munirathnam Store's. All rights reserved.</span>
          <span>Built for farmers, traders and buyers.</span>
        </div>
      </div>
    </footer>
  );
}
