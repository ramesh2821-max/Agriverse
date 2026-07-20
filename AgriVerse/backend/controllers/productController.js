const Product = require("../models/Product");

// @route GET /api/products?category=paddy&variety=jaya&age=new
// @desc  Returns the products matching the given filters. Used to render
//        the quality cards (Poor/Medium/High or Low/High) at the bottom
//        of a category flow. Any of variety/age can be omitted for
//        categories that don't use them.
const getProducts = async (req, res) => {
  const { category, variety, age, quality } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (variety) filter.variety = variety;
  if (age) filter.age = age;
  if (quality) filter.quality = quality;

  const products = await Product.find(filter).sort({ price: 1 });
  res.json(products);
};

// @route GET /api/products/best-sale
const getBestSaleProducts = async (req, res) => {
  const products = await Product.find({ isBestSale: true, stock: { $gt: 0 } });
  res.json(products);
};

// @route GET /api/products/:id
// @desc  Single product with its sample gallery
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// ---------- Admin-only below ----------

// @route POST /api/admin/products
const createProduct = async (req, res) => {
  const product = new Product(req.body);
  const saved = await product.save();
  res.status(201).json(saved);
};

// @route PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// @route DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted" });
};

// @route GET /api/admin/products
const getAllProductsAdmin = async (req, res) => {
  const products = await Product.find().sort({ category: 1, variety: 1, age: 1, quality: 1 });
  res.json(products);
};

module.exports = {
  getProducts,
  getBestSaleProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
};
