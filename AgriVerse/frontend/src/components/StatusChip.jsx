const STATUS_LABELS = {
  pending_review: "Awaiting Approval",
  approved: "Order Approved",
  amount_sent: "Final Amount Sent",
  accepted: "Amount Accepted",
  confirmed: "Order Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function StatusChip({ status }) {
  return (
    <span className={`status-chip status-${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
