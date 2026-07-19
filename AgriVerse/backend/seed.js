/**
 * Seeds MongoDB Atlas with:
 *  - one default Admin account
 *  - sample Product data for every category/variety/age/quality combo
 *
 * Run with:  npm run seed   (from inside /backend)
 *
 * Image URLs point at your real product photos, using the per-product
 * folder scheme described below. Just drop photo files in the right
 * folder and re-run `npm run seed` - no other code needs to change.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");
const Product = require("./models/Product");

/**
 * ============================================================
 *  REAL PRODUCT PHOTOS - ONE FOLDER PER EXACT PRODUCT
 * ============================================================
 * Every specific product (a single variety+age+quality combo, or just
 * age+quality / quality for categories with no variety/age) gets its
 * OWN folder, holding its OWN photos - nothing is shared or reused
 * between products, and you can put as many photos in a folder as you
 * like (1, 5, 20 - whatever you actually have).
 *
 * Folder path = frontend/public/media/products/ followed by the
 * category, then variety (if any), then age (if any), then quality:
 *
 *   paddy/jaya/new/poor/      paddy/jaya/new/medium/     paddy/jaya/new/high/
 *   paddy/jaya/old/poor/      paddy/jaya/old/medium/     paddy/jaya/old/high/
 *   paddy/narmada/new/poor/   ...same pattern for narmada...
 *   ragi/new/poor/            ragi/new/medium/           ragi/new/high/
 *   ragi/old/poor/            ragi/old/medium/           ragi/old/high/
 *   horsegram/new/poor/       ...same pattern as ragi...
 *   chilli/low/                chilli/high/
 *   groundnuts/low/            groundnuts/high/
 *   little-millets/low/        little-millets/high/
 *
 * Inside each of those folders, name your files 1.jpg, 2.jpg, 3.jpg...
 * (any image extension: jpg/jpeg/png/webp). File "1" becomes that
 * product's main image; every other numbered file becomes one of its
 * sample-gallery photos - add as many or as few as you want.
 *
 * Any folder you HAVEN'T filled in yet automatically falls back to a
 * placeholder photo, so the site stays fully browsable while you
 * upload folder by folder. A console warning names exactly which
 * folder is still empty every time you run the seed script.
 * ============================================================
 */
const PRODUCTS_DIR = path.join(__dirname, "..", "frontend", "public", "media", "products");
const placeholder = (seed, w = 800, h = 600) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

// Scans one product's folder (given as path segments, e.g.
// ["paddy","jaya","new","high"]) and returns { main, samples: [...] }.
// File "1.*" is the main image; every other numbered file is a sample.
// If the folder is empty/missing, falls back to placeholder images.
const resolveImages = (segments) => {
  const dir = path.join(PRODUCTS_DIR, ...segments);
  const urlPath = `/media/products/${segments.join("/")}`;
  const pattern = /^(\d+)\.(jpg|jpeg|png|webp)$/i;

  let files = [];
  try {
    files = fs.readdirSync(dir);
  } catch {
    files = [];
  }

  const numbered = files
    .map((f) => ({ file: f, match: f.match(pattern) }))
    .filter((x) => x.match)
    .map((x) => ({ n: Number(x.match[1]), file: x.file }))
    .sort((a, b) => a.n - b.n);

  if (numbered.length === 0) {
    console.warn(`No images found in ${dir} (expected 1.jpg, 2.jpg, ...) - using a placeholder until you add files there.`);
    const seedKey = segments.join("-");
    return {
      main: placeholder(seedKey, 800, 600),
      samples: [1, 2, 3].map((i) => placeholder(`${seedKey}-sample-${i}`, 700, 700)),
    };
  }

  const urlFor = (file) => `${urlPath}/${file}`;
  const main = urlFor(numbered[0].file);
  // If you've only added one photo so far, it's used as both the main
  // image and the (only) selectable sample, so Add to Cart still works.
  const samples = numbered.length > 1 ? numbered.slice(1).map((x) => urlFor(x.file)) : [main];
  return { main, samples };
};

const samplesFor = (key, urls) => urls.map((url, i) => ({ sampleId: `${key}-${i + 1}`, url }));

const paddyVarieties = ["jaya", "narmada"];
const ages = ["new", "old"];
const threeQualities = [
  { quality: "poor", stock: 300, price: 40 },
  { quality: "medium", stock: 500, price: 50 },
  { quality: "high", stock: 1000, price: 60 },
];
const twoQualities = [
  { quality: "low", stock: 400, price: 35 },
  { quality: "high", stock: 900, price: 55 },
];

const buildProducts = () => {
  const products = [];

  // ---- Paddy: variety x age x quality ----
  paddyVarieties.forEach((variety) => {
    ages.forEach((age) => {
      threeQualities.forEach(({ quality, stock, price }) => {
        const key = `paddy-${variety}-${age}-${quality}`;
        const { main, samples } = resolveImages(["paddy", variety, age, quality]);
        products.push({
          name: `${variety[0].toUpperCase()}${variety.slice(1)} ${age === "new" ? "New" : "Old"} ${quality[0].toUpperCase()}${quality.slice(1)} Quality Paddy`,
          category: "paddy",
          variety,
          age,
          quality,
          price,
          stock,
          mainImage: main,
          sampleImages: samplesFor(key, samples),
          isBestSale: variety === "jaya" && age === "new" && quality === "high",
        });
      });
    });
  });

  // ---- Ragi & Horse Gram: age x quality (no variety) ----
  ["ragi", "horsegram"].forEach((category) => {
    const label = category === "ragi" ? "Ragi" : "Horse Gram";
    ages.forEach((age) => {
      threeQualities.forEach(({ quality, stock, price }) => {
        const key = `${category}-${age}-${quality}`;
        const { main, samples } = resolveImages([category, age, quality]);
        products.push({
          name: `${label} ${age === "new" ? "New" : "Old"} ${quality[0].toUpperCase()}${quality.slice(1)} Quality`,
          category,
          variety: null,
          age,
          quality,
          price,
          stock,
          mainImage: main,
          sampleImages: samplesFor(key, samples),
          isBestSale: age === "new" && quality === "high",
        });
      });
    });
  });

  // ---- Chilli, Groundnuts, Little Millets: quality only (Low/High) ----
  ["chilli", "groundnuts", "little-millets"].forEach((category) => {
    const label = category === "little-millets" ? "Little Millets" : category[0].toUpperCase() + category.slice(1);
    twoQualities.forEach(({ quality, stock, price }) => {
      const key = `${category}-${quality}`;
      const { main, samples } = resolveImages([category, quality]);
      products.push({
        name: `${label} ${quality[0].toUpperCase()}${quality.slice(1)} Quality`,
        category,
        variety: null,
        age: null,
        quality,
        price,
        stock,
        mainImage: main,
        sampleImages: samplesFor(key, samples),
        isBestSale: quality === "high",
      });
    });
  });

  return products;
};

const seed = async () => {
  await connectDB();

  // --- Admin ---
  const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  await Admin.deleteMany({ email: adminEmail });
  await Admin.create({ email: adminEmail, password: adminPassword, name: "AgriVerse Admin" });
  console.log(`Admin created -> ${adminEmail} / ${adminPassword}`);

  // --- Products ---
  await Product.deleteMany({});
  const products = buildProducts();
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);

  await mongoose.connection.close();
  console.log("Seeding complete. Connection closed.");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
