TechOps Project — Change Log

Date: 2025-09-04

Scope
- Mobile-friendly layout, consistent navbar actions, and improved search flow.

Files changed and current state

index.html
- Added `class="has-sidebar"` to `<body>` to offset the fixed left sidebar.
- Navbar uses `navbar-light` (light background) for visibility on the light theme.
- Cart button and search form are outside the collapsed menu in a right‑aligned `div.navbar-actions` so they are always visible.
- Search form is responsive: full‑width on mobile, inline on desktop.

products.html
- Navbar uses `navbar-light`.
- Same `div.navbar-actions` as the homepage: Cart + search sit on one row on desktop and wrap neatly on mobile.
- Search bar can expand to occupy available space.

contact.html
- Navbar uses `navbar-dark` per latest user change; actions row removed so only page links are in the nav on this page.
  (Cart/search remain available on Index and Products.)

style.css
- Sidebar offset: `body.has-sidebar { padding-left: 100px; }` with mobile variant `60px` at ≤600px.
- Navbar (light theme) styling: light background, border, shadow; styled collapsed menu on mobile.
- Search input styling for light theme; full‑width behavior inside the collapsed navbar on mobile.
- `.navbar-actions`: keeps Cart + Search on a single row at ≥992px (no wrap), allows wrapping on smaller screens; max width applied on desktop for balance.
- Utility tweaks: prevent button text wrapping; allow search input to grow; general card/hero readability kept intact.

script.js
- Homepage navbar search now redirects to `products.html?q=<term>` instead of filtering featured items.
- Products page reads the `?q=` parameter on load, pre‑fills `#searchInputProducts`, and filters the grid accordingly.
- Safer search rendering: when filtering in place, results go to `#products` or `#featured-products` only if the target exists (avoids errors on pages without a grid).
- No changes to cart logic, checkout, or contact validation except for minor resilience in search.

Resulting behavior
- Desktop: Cart + Search are always visible on the right on Index and Products; page links collapse into the hamburger as needed.
- Mobile: Cart + Search stack under the brand while links toggle inside the burger; sidebar no longer overlaps content.
- Searching from the homepage takes users to the Products page with results applied.

Notes
- If you want Contact to also show the Cart + Search row, the same `navbar-actions` block can be re‑enabled there for uniformity.


