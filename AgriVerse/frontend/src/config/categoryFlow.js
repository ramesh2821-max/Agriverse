/**
 * Defines the click-through flow for every product category.
 * CategoryFlowPage.jsx reads this to know which step to render next
 * (variety -> age -> quality) purely from the URL, so adding a brand
 * new grain category later only means adding an entry here.
 *
 * Variety/age option cards and the homepage category tiles use a
 * dedicated "cover" photo at each branch level, NOT a specific quality
 * tier's photo — e.g. the Ragi "New crop" card reads
 * `frontend/public/media/products/ragi/new/1.jpg`, a file that's
 * separate from (and shouldn't be confused with) the quality-tier
 * photos at `ragi/new/high/1.jpg`, `ragi/new/medium/1.jpg`, etc.
 * Add one `1.jpg` at each branch level (category/, category/variety/,
 * category/variety/age/) for these option cards — see the comment
 * block in `backend/seed.js` for the full per-product folder scheme
 * that separately powers the quality-step cards and sample gallery.
 */
const productPhoto = (segments, n = 1) => `/media/products/${segments.join("/")}/${n}.jpg`;

export const categoryFlow = {
  paddy: {
    label: "Paddy",
    homeImage: productPhoto(["paddy", "jaya"]),
    steps: ["variety", "age", "quality"],
    variety: [
      { id: "jaya", label: "Jaya", image: productPhoto(["paddy", "jaya"]) },
      { id: "narmada", label: "Narmada", image: productPhoto(["paddy", "narmada"]) },
    ],
    age: [
      { id: "new", label: "New", image: productPhoto(["paddy", "jaya", "new"]) },
      { id: "old", label: "Old", image: productPhoto(["paddy", "jaya", "old"]) },
    ],
    qualityLevels: ["poor", "medium", "high"],
  },
  ragi: {
    label: "Ragi",
    homeImage: productPhoto(["ragi", "new"]),
    steps: ["age", "quality"],
    age: [
      { id: "new", label: "New", image: productPhoto(["ragi", "new"]) },
      { id: "old", label: "Old", image: productPhoto(["ragi", "old"]) },
    ],
    qualityLevels: ["poor", "medium", "high"],
  },
  horsegram: {
    label: "Horse Gram",
    homeImage: productPhoto(["horsegram", "new"]),
    steps: ["age", "quality"],
    age: [
      { id: "new", label: "New", image: productPhoto(["horsegram", "new"]) },
      { id: "old", label: "Old", image: productPhoto(["horsegram", "old"]) },
    ],
    qualityLevels: ["poor", "medium", "high"],
  },
  chilli: {
    label: "Chilli",
    homeImage: productPhoto(["chilli", "high"]),
    steps: ["quality"],
    qualityLevels: ["low", "high"],
  },
  groundnuts: {
    label: "Groundnuts",
    homeImage: productPhoto(["groundnuts", "high"]),
    steps: ["quality"],
    qualityLevels: ["low", "high"],
  },
  "little-millets": {
    label: "Little Millets",
    homeImage: productPhoto(["little-millets", "high"]),
    steps: ["quality"],
    qualityLevels: ["low", "high"],
  },
};

export const categoryList = Object.entries(categoryFlow).map(([id, cfg]) => ({
  id,
  label: cfg.label,
  image: cfg.homeImage,
}));

export const qualityLabel = (quality) =>
  quality === "poor"
    ? "Poor Quality"
    : quality === "medium"
    ? "Medium Quality"
    : quality === "high"
    ? "High Quality"
    : quality === "low"
    ? "Low Quality"
    : quality;

export default categoryFlow;
