const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// @route POST /api/orders
// @desc  Create a new order from the customer's cart. Each cart item must
//        already have a selected sample image. Validates every item's
//        quantity against live stock BEFORE saving anything, so a single
//        out-of-stock item doesn't partially reserve the rest of the cart.
const createOrder = async (req, res) => {
  const { items, fullName, mobile, address, village, city, state, pincode } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Your cart is empty" });
  }
  if (!fullName || !mobile || !address || !village || !city || !state || !pincode) {
    return res.status(400).json({ message: "All customer details are required" });
  }

  // Look up every product referenced in the cart in one go
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  // Validate everything first
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return res.status(404).json({ message: "One of the items in your cart no longer exists" });
    }
    if (!item.selectedImage) {
      return res.status(400).json({ message: `Please select a sample image for ${product.name}` });
    }
    if (!item.quantity || item.quantity <= 0) {
      return res.status(400).json({ message: `Enter a valid quantity for ${product.name}` });
    }
    if (item.quantity > product.stock) {
      return res.status(400).json({ message: `Only available stock for ${product.name} is ${product.stock} kg` });
    }
  }

  // Upsert a lightweight customer record keyed by mobile number
  await User.findOneAndUpdate(
    { mobile },
    { fullName, mobile, address, village, city, state, pincode },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Build the snapshot line items and reserve stock for each
  const orderItems = [];
  let itemsTotal = 0;
  for (const item of items) {
    const product = productMap.get(item.productId);
    orderItems.push({
      product: product._id,
      productName: product.name,
      category: product.category,
      variety: product.variety,
      age: product.age,
      quality: product.quality,
      selectedImage: item.selectedImage,
      quantity: item.quantity,
      pricePerKg: product.price,
    });
    itemsTotal += product.price * item.quantity;

    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    customerName: fullName,
    mobile,
    address,
    village,
    city,
    state,
    pincode,
    items: orderItems,
    itemsTotal,
    deliveryCharge: 0,
    totalAmount: 0,
    orderStatus: "pending_review",
  });

  res.status(201).json(order);
};

// @route GET /api/orders/:id
// @desc  Fetch a single order - used by the customer to track status and
//        by the payment page once the admin has sent the final amount.
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

// @route PUT /api/orders/:id/accept
// @desc  Customer accepts the final amount the admin sent, moving the
//        order forward to the payment step.
const acceptOrderAmount = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.orderStatus !== "amount_sent") {
    return res.status(400).json({ message: "This order does not have a final amount to accept yet" });
  }
  order.orderStatus = "accepted";
  await order.save();
  res.json(order);
};

// @route PUT /api/orders/:id/payment-method
// @desc  Customer chooses Cash On Delivery or Scanner payment
const setPaymentMethod = async (req, res) => {
  const { paymentMethod } = req.body; // "cod" | "scanner"
  if (!["cod", "scanner"].includes(paymentMethod)) {
    return res.status(400).json({ message: "paymentMethod must be 'cod' or 'scanner'" });
  }
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.paymentMethod = paymentMethod;
  order.paymentStatus = paymentMethod === "cod" ? "cod_pending" : "pending_verification";
  if (paymentMethod === "cod") order.orderStatus = "confirmed";
  await order.save();
  res.json(order);
};

// @route POST /api/orders/:id/payment-screenshot
// @desc  Customer uploads their UPI/scanner payment screenshot
const uploadPaymentScreenshot = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (!req.file) return res.status(400).json({ message: "No screenshot file received" });

  order.paymentScreenshot = `/uploads/payments/${req.file.filename}`;
  order.paymentStatus = "pending_verification";
  order.orderStatus = "confirmed";
  await order.save();
  res.json(order);
};

// ---------- Admin-only below ----------

// @route GET /api/admin/orders
const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("items.product").sort({ createdAt: -1 });
  res.json(orders);
};

// @route PUT /api/admin/orders/:id/approve
// @desc  Admin approves a freshly-placed order request. Must happen before
//        a delivery charge / final amount can be sent.
const approveOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.orderStatus !== "pending_review") {
    return res.status(400).json({ message: "Only orders awaiting review can be approved" });
  }
  order.orderStatus = "approved";
  await order.save();
  res.json(order);
};

// @route PUT /api/admin/orders/:id/amount
// @desc  Admin sets the delivery charge, the system calculates:
//        totalAmount = itemsTotal + deliveryCharge
//        and the order flips to "amount_sent" awaiting customer acceptance.
//        Requires the order to already be approved.
const setDeliveryChargeAndAmount = async (req, res) => {
  const { deliveryCharge } = req.body;
  if (deliveryCharge === undefined || deliveryCharge < 0) {
    return res.status(400).json({ message: "A valid deliveryCharge is required" });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.orderStatus !== "approved") {
    return res.status(400).json({ message: "Approve this order before sending a final amount" });
  }

  order.deliveryCharge = deliveryCharge;
  order.totalAmount = order.itemsTotal + deliveryCharge;
  order.orderStatus = "amount_sent";
  await order.save();
  res.json(order);
};

// @route PUT /api/admin/orders/:id/status
// @desc  General status update (e.g. verify payment, mark shipped/delivered/cancelled)
const updateOrderStatus = async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  await order.save();
  res.json(order);
};

module.exports = {
  createOrder,
  getOrderById,
  acceptOrderAmount,
  setPaymentMethod,
  uploadPaymentScreenshot,
  getAllOrders,
  approveOrder,
  setDeliveryChargeAndAmount,
  updateOrderStatus,
};
