import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../config/api";
import StatusChip from "../components/StatusChip.jsx";
import { LoadingState, ErrorState } from "../components/LoadingState.jsx";

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get(`/api/orders/${orderId}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setError("This order could not be found."))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await api.put(`/api/orders/${orderId}/accept`);
      navigate(`/payment/${orderId}`);
    } catch {
      setError("Could not accept the amount. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) return <div className="container page-section"><LoadingState label="Loading order" /></div>;
  if (error || !order) {
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
        <span>Order Status</span>
      </div>

      <div className="flow-card" style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ marginBottom: 0 }}>Order #{order._id.slice(-6).toUpperCase()}</h2>
          <StatusChip status={order.orderStatus} />
        </div>

        <div className="cart-list" style={{ marginBottom: 20 }}>
          {order.items.map((item, i) => (
            <div className="cart-line" key={i} style={{ gridTemplateColumns: "72px 1fr auto" }}>
              <img src={item.selectedImage} alt={item.productName} />
              <div className="cart-line-body">
                <h3>{item.productName}</h3>
                <span className="badge">{item.quantity} kg</span>{" "}
                <span className="badge">&#8377;{item.pricePerKg} / kg</span>
              </div>
              <div className="cart-line-total">&#8377;{item.pricePerKg * item.quantity}</div>
            </div>
          ))}
        </div>

        {order.orderStatus === "pending_review" && (
          <p>
            Thanks, {order.customerName.split(" ")[0]}! Your order request has been sent to our
            team for review. Once approved, we'll calculate the delivery charge and send you the
            final amount. Refresh this page in a little while to check for updates.
          </p>
        )}

        {order.orderStatus === "approved" && (
          <p>
            Good news - your order has been approved! Our team is now calculating the delivery
            charge and will send you the final amount shortly.
          </p>
        )}

        {order.orderStatus === "amount_sent" && (
          <>
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
                <span>Total Amount</span>
                <span>&#8377;{order.totalAmount}</span>
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleAccept} disabled={accepting}>
              {accepting ? "Please wait..." : "Accept & Proceed to Payment"}
            </button>
          </>
        )}

        {(order.orderStatus === "accepted" || order.orderStatus === "confirmed") && (
          <>
            <p>Your total amount is <strong>&#8377;{order.totalAmount}</strong>.</p>
            <Link to={`/payment/${order._id}`} className="btn btn-primary">
              Go to Payment
            </Link>
          </>
        )}

        {order.orderStatus === "shipped" && <p>Your order is on its way!</p>}
        {order.orderStatus === "delivered" && <p>Your order has been delivered. Thanks for buying with Munirathnam store's!</p>}
        {order.orderStatus === "cancelled" && <p>This order was cancelled.</p>}

        <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={load}>
          Refresh Status
        </button>
      </div>
    </div>
  );
}
