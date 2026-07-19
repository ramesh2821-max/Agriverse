import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { fileUrl } from "../../config/api";
import { useAuth } from "../../context/AuthContext.jsx";
import { media } from "../../config/media";
import StatusChip from "../../components/StatusChip.jsx";
import { LoadingState, ErrorState } from "../../components/LoadingState.jsx";

function OrderDetailModal({ order, onClose, onUpdated }) {
  const [deliveryCharge, setDeliveryCharge] = useState(order.deliveryCharge || 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const previewTotal = order.itemsTotal + Number(deliveryCharge || 0);
  const isPending = order.orderStatus === "pending_review";
  const isApproved = order.orderStatus === "approved";
  const canSendAmount = isApproved; // must be approved before the delivery charge can be sent

  const handleApprove = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.put(`/api/admin/orders/${order._id}/approve`);
      onUpdated(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not approve this order.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendAmount = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.put(`/api/admin/orders/${order._id}/amount`, {
        deliveryCharge: Number(deliveryCharge),
      });
      onUpdated(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send the final amount.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (orderStatus) => {
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.put(`/api/admin/orders/${order._id}/status`, { orderStatus });
      onUpdated(data);
    } catch {
      setError("Could not update status.");
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentStatusChange = async (paymentStatus) => {
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.put(`/api/admin/orders/${order._id}/status`, { paymentStatus });
      onUpdated(data);
    } catch {
      setError("Could not update payment status.");
    } finally {
      setSaving(false);
    }
  };

  const paymentMethodLabel =
    order.paymentMethod === "cod" ? "Cash On Delivery" : order.paymentMethod === "scanner" ? "Pay Using Scanner" : "Not chosen yet";
  const paymentStatusLabel = {
    not_applicable: "\u2014",
    pending_verification: "Awaiting your verification",
    verified: "Verified",
    cod_pending: "Cash not yet collected",
    cod_collected: "Cash collected",
  }[order.paymentStatus] || order.paymentStatus;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box-inner">
          <button className="btn btn-ghost modal-close" onClick={onClose}>
            Close
          </button>
          <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>

          <div style={{ marginBottom: 14 }}>
            <StatusChip status={order.orderStatus} />
          </div>

          <h4 style={{ marginBottom: 8, fontSize: "1rem" }}>Items ({order.items.length})</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <img
                  src={item.selectedImage}
                  alt={item.productName}
                  style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }}
                />
                <div>
                  <strong style={{ fontSize: "0.92rem" }}>{item.productName}</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-sack)" }}>
                    {item.quantity} kg &middot; &#8377;{item.pricePerKg}/kg &middot; &#8377;{item.pricePerKg * item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h4 style={{ marginBottom: 8, fontSize: "1rem" }}>Customer Details</h4>
          <div className="detail-row"><span>Name</span><span>{order.customerName}</span></div>
          <div className="detail-row"><span>Mobile</span><span>{order.mobile}</span></div>
          <div className="detail-row"><span>Address</span><span>{order.address}</span></div>
          <div className="detail-row"><span>Village</span><span>{order.village}</span></div>
          <div className="detail-row"><span>City</span><span>{order.city}</span></div>
          <div className="detail-row"><span>State</span><span>{order.state}</span></div>
          <div className="detail-row"><span>Pincode</span><span>{order.pincode}</span></div>

          {order.orderStatus !== "pending_review" && order.orderStatus !== "approved" && order.orderStatus !== "amount_sent" && (
            <>
              <h4 style={{ margin: "18px 0 8px", fontSize: "1rem" }}>Payment</h4>
              <div className="detail-row"><span>Method</span><span>{paymentMethodLabel}</span></div>
              <div className="detail-row"><span>Status</span><span>{paymentStatusLabel}</span></div>
            </>
          )}

          {order.paymentScreenshot && (
            <>
              <h4 style={{ margin: "18px 0 8px", fontSize: "1rem" }}>Payment Screenshot</h4>
              <img
                src={fileUrl(order.paymentScreenshot)}
                alt="Payment proof"
                style={{ width: "100%", maxWidth: 260, borderRadius: 10, border: "1px solid var(--color-line)" }}
              />
            </>
          )}

          {isPending && (
            <>
              <h4 style={{ margin: "18px 0 8px", fontSize: "1rem" }}>Review Request</h4>
              <p style={{ fontSize: "0.9rem" }}>
                This order request is awaiting your approval. Approve it to unlock the delivery
                charge step below.
              </p>
            </>
          )}

          <h4 style={{ margin: "18px 0 8px", fontSize: "1rem" }}>Delivery Charge & Final Amount</h4>
          {!canSendAmount && !["amount_sent", "accepted", "confirmed", "shipped", "delivered"].includes(order.orderStatus) && (
            <p className="field-hint" style={{ marginBottom: 12 }}>
              Approve this order first to enable sending a final amount.
            </p>
          )}
          <div className="field-group">
            <label htmlFor="deliveryCharge">Delivery Charge (&#8377;)</label>
            <input
              id="deliveryCharge"
              type="number"
              min="0"
              value={deliveryCharge}
              onChange={(e) => setDeliveryCharge(e.target.value)}
              disabled={!canSendAmount}
            />
          </div>
          <div className="order-summary-box">
            <div className="order-summary-row">
              <span>Items Total</span>
              <span>&#8377;{order.itemsTotal}</span>
            </div>
            <div className="order-summary-row">
              <span>Delivery charge</span>
              <span>&#8377;{Number(deliveryCharge || 0)}</span>
            </div>
            <div className="order-summary-row total">
              <span>Total Amount</span>
              <span>&#8377;{previewTotal}</span>
            </div>
          </div>

          {error && <div className="field-error" style={{ marginBottom: 12 }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {isPending && (
              <button className="btn btn-primary" onClick={handleApprove} disabled={saving}>
                {saving ? "Approving..." : "Approve Order"}
              </button>
            )}
            <button className="btn btn-primary" onClick={handleSendAmount} disabled={saving || !canSendAmount}>
              {saving ? "Saving..." : "Send Final Amount to Customer"}
            </button>
            {order.paymentMethod === "cod" && order.paymentStatus === "cod_pending" && (
              <button className="btn btn-outline" onClick={() => handlePaymentStatusChange("cod_collected")} disabled={saving}>
                Mark Cash Collected
              </button>
            )}
            {order.paymentMethod === "scanner" && order.paymentStatus === "pending_verification" && (
              <button className="btn btn-outline" onClick={() => handlePaymentStatusChange("verified")} disabled={saving}>
                Mark Payment Verified
              </button>
            )}
            {order.orderStatus === "confirmed" && (
              <button className="btn btn-outline" onClick={() => handleStatusChange("shipped")} disabled={saving}>
                Mark Shipped
              </button>
            )}
            {order.orderStatus === "shipped" && (
              <button className="btn btn-outline" onClick={() => handleStatusChange("delivered")} disabled={saving}>
                Mark Delivered
              </button>
            )}
            <button className="btn btn-danger" onClick={() => handleStatusChange("cancelled")} disabled={saving}>
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/api/admin/orders")
      .then(({ data }) => setOrders(data))
      .catch(() => setError("Could not load orders."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => o.orderStatus === "pending_review").length;
    const approved = orders.filter((o) => o.orderStatus === "approved").length;
    const awaitingAccept = orders.filter((o) => o.orderStatus === "amount_sent").length;
    const confirmed = orders.filter((o) => ["confirmed", "shipped", "delivered"].includes(o.orderStatus)).length;
    const revenue = orders
      .filter((o) => o.orderStatus === "delivered")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return { pending, approved, awaitingAccept, confirmed, revenue, total: orders.length };
  }, [orders]);

  if (loading) return <LoadingState label="Loading orders" />;
  if (error) return <ErrorState message={error} actionLabel="Retry" onAction={load} />;

  return (
    <>
      <div className="admin-stats-row">
        <div className="admin-stat-card"><div className="num">{stats.total}</div><div className="label">Total Orders</div></div>
        <div className="admin-stat-card"><div className="num">{stats.pending}</div><div className="label">Awaiting Approval</div></div>
        <div className="admin-stat-card"><div className="num">{stats.approved}</div><div className="label">Approved</div></div>
        <div className="admin-stat-card"><div className="num">{stats.awaitingAccept}</div><div className="label">Amount Sent</div></div>
        <div className="admin-stat-card"><div className="num">{stats.confirmed}</div><div className="label">Confirmed+</div></div>
        <div className="admin-stat-card"><div className="num">&#8377;{stats.revenue}</div><div className="label">Delivered Revenue</div></div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Qty</th>
              <th>Status</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>#{o._id.slice(-6).toUpperCase()}</td>
                <td>{o.customerName}<br /><span style={{ fontSize: "0.78rem", color: "var(--color-sack)" }}>{o.mobile}</span></td>
                <td>
                  {o.items[0]?.productName}
                  {o.items.length > 1 && ` + ${o.items.length - 1} more`}
                </td>
                <td>{o.items.reduce((sum, i) => sum + i.quantity, 0)} kg</td>
                <td>
                  <StatusChip status={o.orderStatus} />
                  {o.paymentMethod && (
                    <div style={{ fontSize: "0.72rem", opacity: 0.7, marginTop: 4 }}>
                      {o.paymentMethod === "cod" ? "COD" : "Scanner"}
                      {o.paymentStatus === "cod_collected" || o.paymentStatus === "verified" ? " \u2713" : ""}
                    </div>
                  )}
                </td>
                <td>{o.totalAmount ? `\u20B9${o.totalAmount}` : "-"}</td>
                <td>
                  <button className="btn btn-outline admin-row-btn" onClick={() => setSelectedOrder(o)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 30 }}>
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={(updated) => {
            setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
            setSelectedOrder(updated);
          }}
        />
      )}
    </>
  );
}

function ProductEditModal({ product, onClose, onUpdated }) {
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.put(`/api/admin/products/${product._id}`, {
        price: Number(price),
        stock: Number(stock),
      });
      onUpdated(data);
      onClose();
    } catch {
      setError("Could not update product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <h3>{product.name}</h3>
        <div className="field-group">
          <label>Price per kg (&#8377;)</label>
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="field-group">
          <label>Stock (kg)</label>
          <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
        {error && <div className="field-error" style={{ marginBottom: 12 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewProductModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    category: "paddy",
    variety: "",
    age: "",
    quality: "",
    price: "",
    stock: "",
    mainImage: "",
    sampleImage1: "",
    sampleImage2: "",
    sampleImage3: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleCreate = async () => {
    if (!form.name || !form.category || !form.quality || !form.price || !form.stock || !form.mainImage) {
      setError("Name, category, quality, price, stock and a main image are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const sampleImages = [form.sampleImage1, form.sampleImage2, form.sampleImage3]
        .filter(Boolean)
        .map((url, i) => ({ sampleId: `${form.category}-${form.variety || "na"}-${form.age || "na"}-${form.quality}-custom-${i + 1}`, url }));
      const { data } = await api.post("/api/admin/products", {
        name: form.name,
        category: form.category,
        variety: form.variety || null,
        age: form.age || null,
        quality: form.quality,
        price: Number(form.price),
        stock: Number(form.stock),
        mainImage: form.mainImage,
        sampleImages,
      });
      onCreated(data);
      onClose();
    } catch {
      setError("Could not create product. Check that all fields are valid.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <h3>Add New Product</h3>
        <div className="field-group">
          <label>Name</label>
          <input value={form.name} onChange={set("name")} placeholder="e.g. Jaya New High Quality Paddy" />
        </div>
        <div className="field-group">
          <label>Category</label>
          <select value={form.category} onChange={set("category")}>
            <option value="paddy">Paddy</option>
            <option value="ragi">Ragi</option>
            <option value="horsegram">Horse Gram</option>
            <option value="chilli">Chilli</option>
            <option value="groundnuts">Groundnuts</option>
            <option value="little-millets">Little Millets</option>
          </select>
        </div>
        <div className="field-group">
          <label>Variety (optional, e.g. jaya)</label>
          <input value={form.variety} onChange={set("variety")} />
        </div>
        <div className="field-group">
          <label>Age (optional, e.g. new / old)</label>
          <input value={form.age} onChange={set("age")} />
        </div>
        <div className="field-group">
          <label>Quality (e.g. poor / medium / high / low)</label>
          <input value={form.quality} onChange={set("quality")} />
        </div>
        <div className="field-group">
          <label>Price per kg (&#8377;)</label>
          <input type="number" min="0" value={form.price} onChange={set("price")} />
        </div>
        <div className="field-group">
          <label>Stock (kg)</label>
          <input type="number" min="0" value={form.stock} onChange={set("stock")} />
        </div>
        <div className="field-group">
          <label>Main image path (e.g. /media/products/paddy/jaya1.jpg)</label>
          <input value={form.mainImage} onChange={set("mainImage")} />
        </div>
        <div className="field-group">
          <label>Sample image 1</label>
          <input value={form.sampleImage1} onChange={set("sampleImage1")} />
        </div>
        <div className="field-group">
          <label>Sample image 2</label>
          <input value={form.sampleImage2} onChange={set("sampleImage2")} />
        </div>
        <div className="field-group">
          <label>Sample image 3</label>
          <input value={form.sampleImage3} onChange={set("sampleImage3")} />
        </div>
        {error && <div className="field-error" style={{ marginBottom: 12 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
            {saving ? "Creating..." : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/api/admin/products")
      .then(({ data }) => setProducts(data))
      .catch(() => setError("Could not load products."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingState label="Loading products" />;
  if (error) return <ErrorState message={error} actionLabel="Retry" onAction={load} />;

  return (
    <div className="admin-table-wrap">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          + Add New Product
        </button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Variety</th>
            <th>Age</th>
            <th>Quality</th>
            <th>Price/kg</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td style={{ textTransform: "capitalize" }}>{p.category}</td>
              <td style={{ textTransform: "capitalize" }}>{p.variety || "-"}</td>
              <td style={{ textTransform: "capitalize" }}>{p.age || "-"}</td>
              <td style={{ textTransform: "capitalize" }}>{p.quality}</td>
              <td>&#8377;{p.price}</td>
              <td>{p.stock} kg</td>
              <td>
                <button className="btn btn-outline admin-row-btn" onClick={() => setEditing(p)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <ProductEditModal
          product={editing}
          onClose={() => setEditing(null)}
          onUpdated={(updated) => setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))}
        />
      )}
      {creating && (
        <NewProductModal
          onClose={() => setCreating(false)}
          onCreated={(created) => setProducts((prev) => [created, ...prev])}
        />
      )}
    </div>
  );
}

function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/api/admin/contact-messages")
      .then(({ data }) => setMessages(data))
      .catch(() => setError("Could not load messages."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markRead = async (id) => {
    try {
      const { data } = await api.put(`/api/admin/contact-messages/${id}/read`);
      setMessages((prev) => prev.map((m) => (m._id === id ? data : m)));
    } catch {
      // silently ignore - not critical
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this message permanently?")) return;
    try {
      await api.delete(`/api/admin/contact-messages/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch {
      // silently ignore - not critical
    }
  };

  if (loading) return <LoadingState label="Loading messages" />;
  if (error) return <ErrorState message={error} actionLabel="Retry" onAction={load} />;
  if (messages.length === 0) {
    return <p style={{ opacity: 0.7 }}>No messages from the Contact page yet.</p>;
  }

  return (
    <div className="admin-table-wrap">
      {messages.map((m) => (
        <div
          key={m._id}
          className="flow-card"
          style={{ marginBottom: 14, opacity: m.isRead ? 0.7 : 1, cursor: "pointer" }}
          onClick={() => !m.isRead && markRead(m._id)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <strong>{m.name}</strong>{" "}
              <span style={{ opacity: 0.7, fontSize: "0.9rem" }}>&lt;{m.email}&gt;</span>
              {!m.isRead && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "var(--color-leaf)",
                    color: "#fff",
                  }}
                >
                  New
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                {new Date(m.createdAt).toLocaleString()}
              </span>
              <button
                className="btn btn-outline"
                style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                onClick={(e) => {
                  e.stopPropagation();
                  remove(m._id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
          <p style={{ marginTop: 10, marginBottom: 0, whiteSpace: "pre-wrap" }}>{m.message}</p>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("orders");

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">{media.logoText}</div>
        <button className={`admin-nav-link ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")} style={{ textAlign: "left", background: tab === "orders" ? "rgba(255,255,255,0.1)" : "transparent", border: "none", color: "inherit" }}>
          Orders
        </button>
        <button className={`admin-nav-link ${tab === "products" ? "active" : ""}`} onClick={() => setTab("products")} style={{ textAlign: "left", background: tab === "products" ? "rgba(255,255,255,0.1)" : "transparent", border: "none", color: "inherit" }}>
          Products
        </button>
        <button className={`admin-nav-link ${tab === "messages" ? "active" : ""}`} onClick={() => setTab("messages")} style={{ textAlign: "left", background: tab === "messages" ? "rgba(255,255,255,0.1)" : "transparent", border: "none", color: "inherit" }}>
          Messages
        </button>
        <div className="admin-sidebar-footer">
          <div style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: 10 }}>{admin?.email}</div>
          <button className="btn btn-outline" style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff", width: "100%" }} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <h2 style={{ marginBottom: 0 }}>{tab === "orders" ? "Orders" : tab === "products" ? "Products" : "Messages"}</h2>
        </div>
        {tab === "orders" ? <OrdersTab /> : tab === "products" ? <ProductsTab /> : <MessagesTab />}
      </main>
    </div>
  );
}
