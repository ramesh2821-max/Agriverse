# AgriVerse - Direct Grain Marketplace

A full-stack grain marketplace: customers browse paddy, ragi, horse gram, chilli, groundnuts
and little millets by variety, crop age and quality grade, view real sample photos, place an
order, and pay by Cash On Delivery or UPI scanner. Admins review every order, set the delivery
charge, send the final amount, and track payment.

```
Home -> Products -> Paddy -> Jaya -> New -> High Quality -> Samples ->
Select Sample -> Place Order -> Quantity -> Customer Details -> Order Placed ->
Admin Sends Final Amount -> Customer Accepts -> Payment (COD / Scanner) -> Done
```

---

## 1. Tech Stack

| Layer     | Technology                                   |
|-----------|-----------------------------------------------|
| Frontend  | React 18 + Vite, React Router, Axios          |
| Backend   | Node.js, Express.js                           |
| Database  | MongoDB Atlas + Mongoose                      |
| Auth      | JWT (admin-only)                              |
| Uploads   | Multer (payment screenshots)                  |

---

## 2. Folder Structure

```
AgriVerse/
├── frontend/
│   ├── public/
│   │   └── media/products/<category>/    <- product main + sample photos (DB-referenced)
│   ├── src/
│   │   ├── media/
│   │   │   ├── videos/hero-grain-video.mp4      <- drop your hero video here
│   │   │   ├── samples/                          <- optional variety/age card photos
│   │   │   └── qr/payment-qr.png                 <- drop your UPI QR code here
│   │   ├── config/
│   │   │   ├── media.js          <- ALL media paths are resolved from here
│   │   │   ├── api.js            <- axios instance
│   │   │   └── categoryFlow.js   <- defines the click-through flow per category
│   │   ├── components/
│   │   ├── pages/
│   │   │   └── admin/
│   │   ├── context/               <- AuthContext (admin session), CartContext (shopping cart)
│   │   └── styles/
│   └── index.html
├── backend/
│   ├── models/        (User, Admin, Product, Order)
│   ├── routes/
│   ├── controllers/
│   ├── middleware/     (JWT auth, multer upload, error handler)
│   ├── config/db.js
│   ├── uploads/         <- payment screenshots land here
│   ├── seed.js
│   └── server.js
└── README.md
```

---

## 3. Prerequisites

- Node.js 18+ and npm
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster

---

## 4. MongoDB Atlas Setup

1. Create a free cluster at MongoDB Atlas.
2. Under **Database Access**, create a database user with a username/password.
3. Under **Network Access**, add your IP address (or `0.0.0.0/0` for development).
4. Click **Connect -> Drivers** and copy the connection string, e.g.
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/agriverse?retryWrites=true&w=majority`
5. Paste it into `backend/.env` as `MONGO_URI` (see step 5).

---

## 5. Install & Run - Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and paste your MONGO_URI + a random JWT_SECRET
npm run seed     # creates the admin account + sample products
npm run dev      # starts the API on http://localhost:5000
```

Default seeded admin login:
- Email: `admin@gmail.com`
- Password: `admin123`

Health check: `GET http://localhost:5000/api/health`

---

## 6. Install & Run - Frontend

```bash
cd frontend
npm install
cp .env.example .env    # optional for local dev, required for production
npm run dev              # starts Vite on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` requests to `http://localhost:5000`
automatically (see `frontend/vite.config.js`), so the frontend and backend can just be
run side by side with no extra configuration.

---

## 7. Where To Upload Your Own Media

Everything below is picked up automatically the next time you run `npm run dev` /
`npm run build` - no component code needs to change.

| What                         | Where to put it                                              |
|-------------------------------|---------------------------------------------------------------|
| Hero falling-grain video      | `frontend/src/media/videos/hero-grain-video.mp4`              |
| Payment QR code                | `frontend/src/media/qr/payment-qr.png`                        |
| Product photos (main, samples, variety/age cards, home tiles) | `frontend/public/media/products/...` (folder path depends on category, see below) &mdash; **must be in `public/`, not `src/media/`**, because these paths are looked up at runtime from the database |

**Per-product photo scheme** &mdash; every exact product (one variety+age+quality combo, or
age+quality / quality where there's no variety) gets its **own folder**, and you can put as many
photos in it as you want (1, 5, 20 - whatever you actually have). Name the files `1.jpg`, `2.jpg`,
`3.jpg`... - file `1` becomes the main image, every other numbered file becomes a sample-gallery
photo:

| Category         | Folder pattern                                                     |
|-------------------|---------------------------------------------------------------------|
| Paddy              | `frontend/public/media/products/paddy/<jaya\|narmada>/<new\|old>/<poor\|medium\|high>/` |
| Ragi                | `frontend/public/media/products/ragi/<new\|old>/<poor\|medium\|high>/` |
| Horse Gram          | `frontend/public/media/products/horsegram/<new\|old>/<poor\|medium\|high>/` |
| Chilli               | `frontend/public/media/products/chilli/<low\|high>/`               |
| Groundnuts           | `frontend/public/media/products/groundnuts/<low\|high>/`           |
| Little Millets        | `frontend/public/media/products/little-millets/<low\|high>/`       |

Example: Jaya, New, High Quality paddy's photos go in
`frontend/public/media/products/paddy/jaya/new/high/1.jpg`, `2.jpg`, `3.jpg`, etc. - all its own,
not shared with any other product.

After adding your files, re-run `npm run seed` (from `/backend`) - it scans every product's
folder and wires in whatever photos it finds, so each product can have a totally different photo
count. Any folder you haven't filled in yet falls back to a placeholder photo (with a console
warning naming that folder) so the site stays fully browsable while you upload gradually.

Variety/age selection cards and the homepage category tiles show one representative product's
photo 1 (currently the "New, High Quality" folder for each variety/category) - edit
`frontend/src/config/categoryFlow.js` if you'd rather point those at a different product's photos.

Until you add your own files, the site automatically uses:
- A public sample video as a hero placeholder
- An auto-generated QR placeholder (qrserver.com)
- picsum.photos placeholder photos for any product folder you haven't filled in yet

All of this logic lives in **`frontend/src/config/media.js`**, **`frontend/src/config/categoryFlow.js`**,
and **`backend/seed.js`** - read the comment blocks at the top of each for the exact rules.

---

## 8. How To Add A New Grain Category

1. **Backend**: no schema change needed - `Product.category` already accepts any string in
   practice (tighten the `enum` in `backend/models/Product.js` if you want to restrict it),
   and add sample products for it in `backend/seed.js`.
2. **Frontend**: add one entry to `frontend/src/config/categoryFlow.js`, e.g.:
   ```js
   wheat: {
     label: "Wheat",
     steps: ["quality"],
     qualityLevels: ["low", "high"],
   }
   ```
   The `Products` dropdown, routing, and sample-gallery flow all pick this up automatically.

---

## 9. Admin Dashboard

Visit `http://localhost:5173/admin/login`.

- **Orders tab**: view every order, the customer's selected sample image, full customer
  details, set the delivery charge (the total = price x quantity + delivery charge is
  calculated live), and send the final amount to the customer. Also mark orders shipped /
  delivered / cancelled.
- **Products tab**: view all product SKUs and edit price/stock.

---

## 10. Cart, Order & Payment Flow (What Happens Behind The Scenes)

Customers can add **multiple grains** to a cart before checking out - each sample-gallery
"Add to Cart" adds one line item (cart state lives in `frontend/src/context/CartContext.jsx`,
persisted to `localStorage` so it survives a refresh). The cart icon in the navbar shows the
live item count.

1. Customer adds one or more grains to the cart, reviews quantities on `/cart`, and submits
   customer details -> `POST /api/orders` with an `items[]` array (stock is validated for
   every item and reserved immediately; if any single item is out of stock the whole request
   is rejected before anything is saved).
2. Order starts in `pending_review` - this is the "order request" sent to the admin.
3. **Admin approves the request** -> `PUT /api/admin/orders/:id/approve` -> status becomes
   `approved`. (The delivery-charge step is locked until this happens.)
4. Admin sets a delivery charge -> `PUT /api/admin/orders/:id/amount` -> status becomes
   `amount_sent`. Total = sum of every item's (price x quantity) + delivery charge.
5. Customer sees the total and accepts -> `PUT /api/orders/:id/accept` -> `accepted`.
6. Customer picks Cash On Delivery (`confirmed` immediately) or Scanner, uploads a
   screenshot (`POST /api/orders/:id/payment-screenshot`) -> `confirmed`.
7. Admin marks the order `shipped`, then `delivered`.

Order status values: `pending_review -> approved -> amount_sent -> accepted -> confirmed ->
shipped -> delivered` (or `cancelled` at any point from the Admin Dashboard).

---

## 11. Seed Data

Running `npm run seed` (inside `backend/`) creates:
- 1 admin account
- Paddy: 2 varieties x 2 crop ages x 3 quality grades = 12 products
- Ragi & Horse Gram: 2 crop ages x 3 quality grades each = 12 products
- Chilli, Groundnuts, Little Millets: 2 quality grades each = 6 products

Stock is never zero (Poor/Low: 300-400kg, Medium: 500kg, High: 900-1000kg) and every
product has 3 sample images.

---

## 12. Notes & Next Steps

- The contact form is currently frontend-only. To persist messages, add a
  `Contact` model + `POST /api/contact` route following the same pattern as
  `backend/controllers/orderController.js`.
- Product photo management from the Admin Dashboard (rather than editing `seed.js`) can be
  added with a Multer upload route mirroring `backend/middleware/uploadMiddleware.js`.
- For production, deploy the backend (Render/Railway/EC2) and set `CLIENT_ORIGIN` to your
  deployed frontend URL, then deploy the frontend (Vercel/Netlify) with
  `VITE_API_BASE_URL` pointing at your backend.
