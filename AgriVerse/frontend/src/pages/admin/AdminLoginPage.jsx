import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { media } from "../../config/media";

export default function AdminLoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-shell">
      <form className="flow-card" style={{ width: 380 }} onSubmit={handleSubmit}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          {media.logoText} Admin
        </div>
        <h2>Admin Login</h2>

        <div className="field-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {error && <div className="field-error" style={{ marginBottom: 14 }}>{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="field-hint" style={{ marginTop: 14 }}>
          Default seed credentials: admin@gmail.com / admin123
        </p>
      </form>
    </div>
  );
}
