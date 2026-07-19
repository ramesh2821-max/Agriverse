import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import api from "../config/api";
import { qualityLabel } from "../config/categoryFlow";

const EMPTY_FORM = {
  fullName: "",
  mobile: "",
  address: "",
  village: "",
  city: "",
  state: "",
  pincode: "",
};

function CartLine({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  return (
    <div className="cart-line">
      <img src={item.selectedImage} alt={item.productName} />
      <div className="cart-line-body">
        <h3>{item.productName}</h3>
        <span className="badge">{qualityLabel(item.quality)}</span>{" "}
        <span className="badge">&#8377;{item.price} / kg</span>{" "}
        <span className="badge">In stock: {item.stock} kg</span>
      </div>
      <div className="cart-line-qty">
        <label>Qty (kg)</label>
        <input
          type="number"
          min="1"
          max={item.stock}
          value={item.quantity}
          onChange={(e) => updateQuantity(item.productId, Number(e.target.value) || 1)}
        />
      </div>
      <div className="cart-line-total">&#8377;{item.price * item.quantity}</div>
      <button className="btn btn-ghost cart-line-remove" onClick={() => removeFromCart(item.productId)}>
        Remove
      </button>
    </div>
  );
}

export default function CartPage() {
  const { items, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState("cart"); // "cart" | "details"
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleFormChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validateForm = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = "Full name is required";
    if (!/^[0-9]{10}$/.test(form.mobile.trim())) errors.mobile = "Enter a valid 10-digit mobile number";
    if (!form.address.trim()) errors.address = "Address is required";
    if (!form.village.trim()) errors.village = "Village is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.state.trim()) errors.state = "State is required";
    if (!/^[0-9]{6}$/.test(form.pincode.trim())) errors.pincode = "Enter a valid 6-digit pincode";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data } = await api.post("/api/orders", {
        items: items.map((i) => ({
          productId: i.productId,
          selectedImage: i.selectedImage,
          quantity: i.quantity,
        })),
        ...form,
      });
      clearCart();
      navigate(`/order-status/${data._id}`);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Could not place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container page-section state-message">
        <h3>Your cart is empty</h3>
        <p>Browse our grains and add a few samples you like before checking out.</p>
        <Link to="/" className="btn btn-primary">
          Browse Grains
        </Link>
      </div>
    );
  }

  return (
    <div className="container page-section">
      <div className="breadcrumb-trail">
        <Link to="/">Home</Link>
        <span className="sep">/</span>
        <span>Cart</span>
      </div>

      <div className="stepper">
        <span className={`stepper-item ${step === "cart" ? "active" : "done"}`}>1. Review Cart</span>
        <span className={`stepper-item ${step === "details" ? "active" : ""}`}>2. Customer Details</span>
      </div>

      {step === "cart" && (
        <>
          <div className="cart-list">
            {items.map((item) => (
              <CartLine key={item.productId} item={item} />
            ))}
          </div>

          <div className="order-summary-box" style={{ maxWidth: 400 }}>
            <div className="order-summary-row total">
              <span>Items Total</span>
              <span>&#8377;{cartTotal}</span>
            </div>
          </div>
          <p className="field-hint" style={{ marginBottom: 18 }}>
            Delivery charges are added by our team after they review your order request.
          </p>

          <div style={{ display: "flex", gap: 12 }}>
            <Link to="/" className="btn btn-ghost">
              Add More Grains
            </Link>
            <button className="btn btn-primary" onClick={() => setStep("details")}>
              Place Order
            </button>
          </div>
        </>
      )}

      {step === "details" && (
        <form className="flow-card" onSubmit={handleSubmitOrder}>
          <div className="field-group">
            <label htmlFor="fullName">Full Name</label>
            <input id="fullName" value={form.fullName} onChange={handleFormChange("fullName")} />
            {formErrors.fullName && <div className="field-error">{formErrors.fullName}</div>}
          </div>

          <div className="field-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input id="mobile" value={form.mobile} onChange={handleFormChange("mobile")} placeholder="10-digit mobile number" />
            {formErrors.mobile && <div className="field-error">{formErrors.mobile}</div>}
          </div>

          <div className="field-group">
            <label htmlFor="address">Address</label>
            <textarea id="address" rows={3} value={form.address} onChange={handleFormChange("address")} />
            {formErrors.address && <div className="field-error">{formErrors.address}</div>}
          </div>

          <div className="field-row">
            <div className="field-group">
              <label htmlFor="village">Village</label>
              <input id="village" value={form.village} onChange={handleFormChange("village")} />
              {formErrors.village && <div className="field-error">{formErrors.village}</div>}
            </div>
            <div className="field-group">
              <label htmlFor="city">City</label>
              <input id="city" value={form.city} onChange={handleFormChange("city")} />
              {formErrors.city && <div className="field-error">{formErrors.city}</div>}
            </div>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label htmlFor="state">State</label>
              <input id="state" value={form.state} onChange={handleFormChange("state")} />
              {formErrors.state && <div className="field-error">{formErrors.state}</div>}
            </div>
            <div className="field-group">
              <label htmlFor="pincode">Pincode</label>
              <input id="pincode" value={form.pincode} onChange={handleFormChange("pincode")} />
              {formErrors.pincode && <div className="field-error">{formErrors.pincode}</div>}
            </div>
          </div>

          {submitError && <div className="field-error" style={{ marginBottom: 14 }}>{submitError}</div>}

          <div style={{ display: "flex", gap: 12 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setStep("cart")}>
              Back to Cart
            </button>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Sending Request..." : "Send Order Request"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
