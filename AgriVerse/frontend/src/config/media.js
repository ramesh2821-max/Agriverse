/**
 * ============================================================
 *  CENTRAL MEDIA REGISTRY
 * ============================================================
 * Every image and video path used anywhere in the app comes from
 * this file. Never import/reference a media path directly inside
 * a component - add it here first.
 *
 * HOW TO REPLACE PLACEHOLDER MEDIA WITH YOUR OWN:
 *
 * 1. Hero video
 *    Drop your file at: frontend/src/media/videos/hero-grain-video.mp4
 *    It will automatically be picked up (see localHeroVideo below).
 *    Until then, a public sample video is used as a placeholder.
 *
 * 2. Product photos (main image + sample gallery)
 *    Product images are stored as URLs in MongoDB (see backend/seed.js),
 *    NOT hardcoded in React. Because these paths are looked up at
 *    RUNTIME from the database (not imported at build time like the
 *    files above), they must live in Vite's `public/` folder, which is
 *    served as-is at the site root - NOT in src/media/.
 *      a) Save 9 numbered photos per category/variety into:
 *         frontend/public/media/products/<category>/<prefix>1.jpg ... 9.jpg
 *         e.g. frontend/public/media/products/paddy/jaya1.jpg ... jaya9.jpg
 *      b) Re-run `npm run seed` from /backend - it automatically wires
 *         those 9 files into every product's main + sample images.
 *    See the comment block at the top of backend/seed.js for the full
 *    naming scheme (PRODUCT_IMAGE_PREFIX table).
 *
 * 3. Payment QR code
 *    Drop your file at: frontend/src/media/qr/payment-qr.png
 *    It will automatically be picked up (see localQrCode below).
 *
 * 4. Category/variety/age option card photos
 *    These now point straight at your real product photos in
 *    frontend/public/media/products/<category>/<prefix>N.jpg (see
 *    frontend/src/config/categoryFlow.js and the comment block at the
 *    top of backend/seed.js for the full numbered-file naming scheme).
 *    The getOptionImage()/src/media/samples/ mechanism below is kept
 *    only as a fallback helper for any other generic UI images.
 * ============================================================
 */

// Vite's import.meta.glob eagerly imports every matching file at build
// time and gives us a real, bundled URL for each one. This is what lets
// us "just drop a file in the folder" without editing any component.
const localVideoModules = import.meta.glob("../media/videos/*.mp4", { eager: true, import: "default" });
const localQrModules = import.meta.glob("../media/qr/*.{png,jpg,jpeg}", { eager: true, import: "default" });
const localSampleModules = import.meta.glob("../media/samples/*.{png,jpg,jpeg,webp}", { eager: true, import: "default" });

const findLocal = (modules, filename) => {
  const match = Object.entries(modules).find(([path]) => path.endsWith(filename));
  return match ? match[1] : null;
};

// ---- Hero video ----
const localHeroVideo = findLocal(localVideoModules, "hero-grain-video.mp4");
const PLACEHOLDER_HERO_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"; // temporary internet placeholder

// ---- Payment QR ----
const localQrCode = findLocal(localQrModules, "payment-qr.png");
const PLACEHOLDER_QR_CODE =
  "https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=AgriVerse-UPI-Placeholder-QR";

// ---- Generic placeholder image generator (deterministic per key) ----
const placeholderImage = (seed, width = 700, height = 700) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;

/**
 * Resolve an option-card image (variety/age selection cards that are not
 * tied to a specific product in the database). Looks for a local file
 * named exactly `${key}.jpg` (or .png/.jpeg/.webp) in src/media/samples/,
 * otherwise falls back to a stable placeholder photo.
 */
const getOptionImage = (key) => {
  const local =
    findLocal(localSampleModules, `${key}.jpg`) ||
    findLocal(localSampleModules, `${key}.jpeg`) ||
    findLocal(localSampleModules, `${key}.png`) ||
    findLocal(localSampleModules, `${key}.webp`);
  return local || placeholderImage(key);
};

export const media = {
  heroVideo: localHeroVideo || PLACEHOLDER_HERO_VIDEO,
  qrCode: localQrCode || PLACEHOLDER_QR_CODE,
  placeholderImage,
  getOptionImage,
  logoText: "Munirathnam Store's",
};

export default media;
