import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../config/api";
import { media } from "../config/media";
import { LoadingState, ErrorState } from "../components/LoadingState.jsx";

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [method, setMethod] = useState(null); // "cod" | "scanner"
  const [savingMethod, setSavingMethod] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api
      .get(`/api/orders/${orderId}`)
      .then(({ data }) => {
        setOrder(data);
        setMethod(data.paymentMethod);
        setDone(data.orderStatus === "confirmed" || data.orderStatus === "shipped" || data.orderStatus === "delivered");
      })
      .catch(() => setError("This order could not be found."))
      .finally(() => setLoading(false));
  }, [orderId]);

  const chooseMethod = async (chosen) => {
    setMethod(chosen);
    if (chosen === "cod") {
      setSavingMethod(true);
      try {
        await api.put(`/api/orders/${orderId}/payment-method`, { paymentMethod: "cod" });
        setDone(true);
      } catch {
        setError("Could not save your payment choice. Please try again.");
      } finally {
        setSavingMethod(false);
      }
    } else {
      try {
        await api.put(`/api/orders/${orderId}/payment-method`, { paymentMethod: "scanner" });
      } catch {
        setError("Could not save your payment choice. Please try again.");
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!screenshot) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("screenshot", screenshot);
      await api.post(`/api/orders/${orderId}/payment-screenshot`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDone(true);
    } catch {
      setError("Could not upload the payment screenshot. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="container page-section"><LoadingState label="Loading payment details" /></div>;
  if (error && !order) {
    return (
      <div className="container page-section">
        <ErrorState message={error} actionLabel="Go home" onAction={() => navigate("/")} />
      </div>
    );
  }

  return (
    <div className="container page-section">
      <div className="breadcrumb-trail">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <Link to={`/order-status/${orderId}`}>Order Status</Link>
        <span className="sep">/</span>
        <span>Payment</span>
      </div>

      <div className="flow-card" style={{ maxWidth: 620 }}>
        <h2>Complete Payment</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
              <span>{item.productName} ({item.quantity} kg)</span>
              <span>&#8377;{item.pricePerKg * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="order-summary-box">
          <div className="order-summary-row">
            <span>Items Total</span>
            <span>&#8377;{order.itemsTotal}</span>
          </div>
          <div className="order-summary-row">
            <span>Delivery charge</span>
            <span>&#8377;{order.deliveryCharge}</span>
          </div>
          <div className="order-summary-row total">
            <span>Total Amount Due</span>
            <span>&#8377;{order.totalAmount}</span>
          </div>
        </div>

        {done ? (
          <div>
            <p>
              {method === "cod"
                ? "Cash On Delivery confirmed. Please keep the exact amount ready when your order arrives."
                : "Thanks! Your payment screenshot has been sent to our team for verification."}
            </p>
            <Link to={`/order-status/${orderId}`} className="btn btn-primary">
              View Order Status
            </Link>
          </div>
        ) : (
          <>
            <div className="payment-option-grid">
              <button
                className={`payment-option-card ${method === "cod" ? "selected" : ""}`}
                onClick={() => chooseMethod("cod")}
                disabled={savingMethod}
              >
                <div className="payment-option-icon">&#128176;</div>
                <strong>Cash On Delivery</strong>
                <p style={{ fontSize: "0.82rem", marginTop: 6 }}>Pay when your order arrives</p>
              </button>
              <button className={`payment-option-card ${method === "scanner" ? "selected" : ""}`} onClick={() => chooseMethod("scanner")}>
                <div className="payment-option-icon">&#128241;</div>
                <strong>Pay using Scanner</strong>
                <p style={{ fontSize: "0.82rem", marginTop: 6 }}>Scan the QR and upload proof</p>
              </button>
            </div>

            {method === "scanner" && (
              <>
                <div className="qr-box">
                  <img src={media.qrCode} alt="AgriVerse payment QR code" />
                  <p style={{ marginBottom: 0 }}>Scan with any UPI app to pay &#8377;{order.totalAmount}</p>
                </div>
                <form onSubmit={handleUpload}>
                  <div className="field-group">
                    <label htmlFor="screenshot">Upload payment screenshot</label>
                    <input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                    />
                  </div>
                  {error && <div className="field-error">{error}</div>}
                  <button className="btn btn-primary" type="submit" disabled={!screenshot || uploading}>
                    {uploading ? "Uploading..." : "Submit Payment Proof"}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
