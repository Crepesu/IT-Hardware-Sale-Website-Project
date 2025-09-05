# TechOps — IT Hardware Sale Website

A responsive, static demo storefront for selling computers, laptops, components and accessories. Built with plain HTML/CSS/JS and Bootstrap — intended as a demo project.

This repository contains the TechOps front-end:
- Index (home) with a featured deal and sidebar navigation
- Products listing with category filters and search
- Contact page with a demo contact form (client-side validation only)
- Checkout flow that validates input and simulates payment (no real payments)
- Cart persisted in browser localStorage

---

## Features

- Responsive layout with a fixed left sidebar and top navbar
- Always-visible cart and search controls on index/products pages
- Product data driven from `products-data.json`
- Client-side product filtering and search (search on index redirects to products)
- Cart stored in `localStorage` with modal cart UI
- Checkout page with enhanced form validation and a simulated payment success flow
- Contact form with realtime validation and demo success alert
- Clean, reusable components in `style.css` and `script.js`
- Accessible-ish markup (aria labels, focus management, keyboard accessible controls)
- Changelog available in `CHANGES.md`

---

## Demo / Preview

Open `index.html` in your browser. For best experience serve the folder over a local HTTP server rather than opening files directly (to avoid fetch CORS issues when loading JSON).

Recommended quick ways to serve locally:

- VS Code: Use Live Server. This repo has an example port set in `.vscode/settings.json` (`5502`).
- Python 3:
  - `python -m http.server 8000`
  - Open http://localhost:8000
- Node (http-server):
  - `npx http-server -c-1`
  - Open http://localhost:8080

---

## Getting started (local)

1. Clone the repo
   - `git clone https://github.com/Crepesu/IT-Hardware-Sale-Website-Project.git`
2. Change into the directory
   - `cd IT-Hardware-Sale-Website-Project`
3. Start a static server (see one of the options above)
4. Open `index.html` (or http://localhost:<port>/) in your browser

---

## File structure (important files)

- `index.html` — Home page with featured deal and sidebar navigation
- `products.html` — Full product listing with category filter and search
- `contact.html` — Contact form page (client-side only)
- `checkout.html` — Checkout and order confirmation simulation
- `products-data.json` — JSON array of product objects (name, price, description, image, category)
- `style.css` — Project styles and layout tweaks (overrides and theme)
- `script.js` — All front-end JS: product loading, search, cart, checkout, validation, UI handlers
- `CHANGES.md` — Change log and recent notes
- `.vscode/settings.json` — Live Server port example (optional)

---

## How product data works

Products are stored in `products-data.json`. Each product object should include:
- `name` (string)
- `price` (number)
- `description` (string)
- `image` (path to an image file in `images/` or a URL)
- `category` (string, e.g. "Laptops", "Components", "Peripherals", "Accessories")

To add or edit products, update `products-data.json` and add the referenced image to the `images/` folder.

---

## Cart & Checkout behavior

- Adding items to cart is done via the "Add to Cart" buttons. The cart is persisted to `localStorage` under the `cart` key.
- The cart modal shows line items and a total, with options to clear cart or proceed to checkout.
- Checkout page reads the cart from `localStorage`. The checkout form performs client-side validation and, upon success, displays a success message and clears the cart. No real payment processing occurs — this is a demo.

---

## Search behavior

- The search box in the index navbar redirects users to `products.html?q=<term>` and the Products page applies the query automatically.
- The search on the Products page filters the current product grid in-place.
- Search matching is case-insensitive and matches product names.

---

## Development notes

- CSS uses Bootstrap 5.3 and some custom theme variables in `style.css`.
- JS is all in `script.js`. It contains multiple DOMContentLoaded handlers — when editing, ensure logic isn't accidentally duplicated.
- The project intentionally keeps logic client-side and needs only a static file server.
- If you change navbar structure or IDs, update references in `script.js` (search form IDs, sidebar links, etc.)

---

## Accessibility & testing

- Basic ARIA attributes and semantic tags are used, but this is a demo and not an exhaustive accessibility audit.
- Test keyboard navigation, screen-reader behavior, and contrast if accessibility is critical.
- Manual testing suggestions:
  - Add items to the cart, change quantities on checkout, remove items.
  - Test search with query on the index page — ensure it redirects and pre-fills the product search.
  - Submit the contact form with invalid and valid inputs to see validation messages.

---

## Known limitations

- No back-end: all data and state live in the browser (localStorage / JSON file).
- Contact form and payment are simulated — no emails or transactions are sent.
- Images must be added to `images/` and referenced in `products-data.json` manually.
- No authenticated user flows or order persistence beyond localStorage.

---

## Contributing

- Issues and pull requests are welcome. For quick fixes:
  - Fork the repo, make your changes, and open a PR.
  - Update `CHANGES.md` or add a note in your PR about the change.
- If you plan to add features (e.g. backend, API, authentication), open an issue first to coordinate.

---

## Changelog

See `CHANGES.md` for the latest set of UI/UX and behavioral changes (updated 2025-09-04 in this repo).

---

## Credits & Licenses

- Bootstrap (CSS framework) — https://getbootstrap.com/
- Bootstrap Icons — https://icons.getbootstrap.com/
- This project currently does not include a LICENSE file.

---
