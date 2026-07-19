import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="container state-message">
      <h3>Page not found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
