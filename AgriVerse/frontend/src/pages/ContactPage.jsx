import { useState } from "react";
import api from "../config/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await api.post("/api/contact", form);
      setSent(true);
    } catch {
      setError("Couldn't send your message right now - please try again in a moment.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container page-section">
      <div className="section-heading">
        <div className="eyebrow">We're here to help</div>
        <h2>Contact Munirathnam Store's</h2>
        <p>Questions about a bulk order, a specific grain variety, or delivery to your area? Reach out.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 40 }} className="contact-layout">
        <div className="flow-card">
          <div className="detail-row">
            <span>Phone</span>
            <a href="tel:+919951896751">+91 99518 96751</a>
          </div>
          <div className="detail-row">
            <span>WhatsApp</span>
            <a href="https://wa.me/919951896751" target="_blank" rel="noreferrer">
              +91 99518 96751
            </a>
          </div>
          <div className="detail-row">
            <span>Email</span>
            <a href="mailto:m.ramesh1282@gmail.com">m.ramesh1282@gmail.com</a>
          </div>
          <div className="detail-row" style={{ border: "none" }}>
            <span>Address</span>
            <span style={{ textAlign: "right" }}>
              Kenchanaballa,
              <br /> vijalapuram,
              <br /> kuppam, State - 517425
            </span>
          </div>
        </div>

        <form className="flow-card" onSubmit={handleSubmit}>
          {sent ? (
            <p>Thanks, {form.name.split(" ")[0] || "there"}! Your message has been noted - we'll get back to you soon.</p>
          ) : (
            <>
              <div className="field-group">
                <label htmlFor="name">Your Name</label>
                <input id="name" required value={form.name} onChange={handleChange("name")} />
              </div>
              <div className="field-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" required value={form.email} onChange={handleChange("email")} />
              </div>
              <div className="field-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows={5} required value={form.message} onChange={handleChange("message")} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={sending}>
                {sending ? "Sending..." : "Send Message"}
              </button>
              {error && <p className="field-error">{error}</p>}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
