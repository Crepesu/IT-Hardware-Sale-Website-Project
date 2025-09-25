/*
 * TechOps E-commerce Site - Main JavaScript Module
 * =====================================================
 * 
 * This file handles all core functionality for the TechOps website including:
 * - Shopping cart management with localStorage persistence
 * - Product rendering and filtering
 * - Search functionality across pages
 * - UI interactions and form handling
 * - Navigation and accessibility features
 * 
 * Dependencies:
 * - Bootstrap 5.3.3 (modals, components)
 * - Bootstrap Icons
 * - products-data.json (product data source)
 * 
 * Browser Support: Modern browsers (ES6+)
 * Last Updated: September 2025
 */

// ======================
// GLOBAL VARIABLES
// ======================

/**
 * Main shopping cart array - stores all cart items
 * Each item: { name: string, price: number, quantity: number, originalPrice?: number, isDiscounted?: boolean }
 * @type {Array<Object>}
 */
let cart = [];

// ======================
// CART MANAGEMENT FUNCTIONS
// ======================

/**
 * Loads cart data from browser's localStorage
 * Called on page initialization to restore previous cart state
 * Gracefully handles missing or corrupted cart data
 */
function loadCartFromStorage() {
  try {
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
  } catch (error) {
    console.warn('Failed to load cart from storage:', error);
    cart = []; // Reset to empty cart if data is corrupted
  }
}

/**
 * Saves current cart state to localStorage
 * Called after any cart modification (add, remove, update quantity)
 * Ensures cart persistence across browser sessions
 */
function saveCartToStorage() {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to storage:', error);
  }
}

/**
 * Adds a product to the shopping cart
 * Handles both regular and discounted prices, prevents duplicate rapid clicks
 * Updates localStorage and provides visual feedback to user
 * 
 * @param {string} productName - Name of the product to add (must match products-data.json)
 */
function addToCart(productName) {
  // Prevent multiple rapid clicks by checking button disabled state
  const btn = document.querySelector(`[data-name="${productName}"]`);
  if (btn && btn.disabled) return;
  
  // Temporarily disable the button to prevent double-clicking
  if (btn) btn.disabled = true;
  
  // Check for discounted price from button's data-price attribute
  // Featured deals may have different prices than the base product data
  const discountedBtn = document.querySelector(`[data-name="${productName}"][data-price]`);
  const discountedPrice = discountedBtn ? parseFloat(discountedBtn.getAttribute('data-price')) : null;

  // Fetch product data from JSON file
  fetch('products-data.json')
    .then(res => {
      if (!res.ok) throw new Error('Failed to load product data');
      return res.json();
    })
    .then(products => {
      // Find the requested product in the data
      const product = products.find(p => p.name === productName);
      if (!product) {
        alert('Product not found!');
        if (btn) btn.disabled = false;
        return;
      }

      // Use discounted price if available, otherwise use regular price
      const finalPrice = discountedPrice || product.price;
      
      // Check if product already exists in cart
      const existingItem = cart.find(item => item.name === productName);
      
      if (existingItem) {
        // Increment quantity for existing item
        existingItem.quantity += 1;
      } else {
        // Add new item to cart with all necessary properties
        cart.push({
          name: productName,
          price: finalPrice,
          quantity: 1,
          originalPrice: product.price,
          isDiscounted: discountedPrice !== null
        });
      }
      
      // Save updated cart to localStorage
      saveCartToStorage();
      
      // Show visual feedback to user (button animation)
      showAddToCartFeedback(productName, !!discountedBtn);
      
      // Re-enable button after feedback animation completes
      setTimeout(() => {
        if (btn) btn.disabled = false;
      }, 1600);
    })
    .catch(err => {
      // Handle any errors (network issues, JSON parsing, etc.)
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart. Please try again.');
      if (btn) btn.disabled = false;
    });
}

/**
 * Provides visual feedback when a product is added to cart
 * Temporarily changes button text and color to confirm the action
 * 
 * @param {string} productName - Name of the product that was added
 * @param {boolean} isDiscounted - Whether this was a discounted item (affects button styling)
 */
function showAddToCartFeedback(productName, isDiscounted) {
  const btn = document.querySelector(`[data-name="${productName}"]`);
  if (!btn) return;
  
  // Store original button state for restoration
  const originalText = btn.textContent;
  const originalClass = isDiscounted ? 'btn-primary' : 'btn-neon';
  
  // Change to success state
  btn.textContent = 'Added!';
  btn.className = 'btn btn-success';
  
  // Restore original state after 1.5 seconds
  setTimeout(() => {
    btn.textContent = originalText;
    btn.className = `btn ${originalClass}`;
  }, 1500);
}

/**
 * Displays the shopping cart modal with all items, pricing, and controls
 * Calculates totals, shows savings for discounted items, and provides cart management buttons
 * Updates the modal content dynamically and handles empty cart state
 */
function showCart() {
  // Initialize Bootstrap modal component
  const modal = new bootstrap.Modal(document.getElementById('cartModal'));
  const body = document.getElementById('cart-modal-body');
  
  // Handle empty cart case
  if (cart.length === 0) {
    body.innerHTML = '<p>Your cart is empty.</p>';
    modal.show();
    return;
  }

  // Initialize running totals for cart summary
  let total = 0;
  let totalSavings = 0;
  
  // Generate HTML for each cart item with pricing and controls
  const cartHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    // Calculate and display savings for discounted items
    let savingsDisplay = '';
    if (item.isDiscounted && item.originalPrice) {
      const savings = (item.originalPrice - item.price) * item.quantity;
      totalSavings += savings;
      savingsDisplay = `
        <div class="small text-muted text-decoration-line-through">
          Was: $${(item.originalPrice * item.quantity).toFixed(2)}
        </div>
        <div class="small text-success">
          Saved: $${savings.toFixed(2)}
        </div>
      `;
    }
    
    // Return HTML structure for individual cart item
    // Includes product info, quantity controls, and remove button
    // Note: Escapes single quotes in product names to prevent JS injection
    return `
      <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
        <div class="flex-grow-1">
          <strong>${item.name}</strong>
          <div class="small text-muted">$${item.price.toFixed(2)} each</div>
          ${savingsDisplay}
          <div class="d-flex align-items-center mt-2">
            <label class="small text-muted me-2">Qty:</label>
            <button class="btn btn-outline-secondary btn-sm" onclick="decreaseQuantity('${item.name.replace(/'/g, "\\'")}')" style="padding: 0.2rem 0.5rem;">-</button>
            <span class="mx-2 fw-bold">${item.quantity}</span>
            <button class="btn btn-outline-secondary btn-sm" onclick="increaseQuantity('${item.name.replace(/'/g, "\\'")}')" style="padding: 0.2rem 0.5rem;">+</button>
            <button class="btn btn-outline-danger btn-sm ms-2" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')" style="padding: 0.2rem 0.5rem;">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        <div class="text-end">
          <div class="fw-bold">$${itemTotal.toFixed(2)}</div>
        </div>
      </div>
    `;
  }).join('');
  
  // Show total savings section only if there are actual savings
  const totalSavingsDisplay = totalSavings > 0 ? `
    <div class="d-flex justify-content-between mb-2 text-success">
      <span>Total Savings:</span>
      <span class="fw-bold">-$${totalSavings.toFixed(2)}</span>
    </div>
  ` : '';
  
  // Assemble complete modal content with items, totals, and action buttons
  body.innerHTML = `
    ${cartHTML}
    <hr>
    ${totalSavingsDisplay}
    <div class="d-flex justify-content-between mb-3">
      <span class="h5">Total:</span>
      <span class="h5 fw-bold">$${total.toFixed(2)}</span>
    </div>
    <div class="d-grid gap-2">
      <button class="btn btn-neon" onclick="goToCheckout()">Checkout</button>
      <button class="btn btn-outline-secondary" onclick="clearCart()">Clear Cart</button>
    </div>
  `;
  
  // Display the populated modal
  modal.show();
}

/**
 * Clears all items from the shopping cart
 * Updates localStorage and refreshes the cart modal display
 */
function clearCart() {
  cart = [];
  saveCartToStorage();
  showCart(); // Refresh modal to show empty state
}

/**
 * Removes a specific product from the shopping cart
 * Updates localStorage and refreshes the cart modal display
 * 
 * @param {string} productName - Name of the product to remove
 */
function removeFromCart(productName) {
  cart = cart.filter(item => item.name !== productName);
  saveCartToStorage();
  showCart(); // Refresh modal to show updated cart
}

/**
 * Updates the quantity of a specific product in the cart
 * If new quantity is 0 or less, removes the item from cart
 * 
 * @param {string} productName - Name of the product to update
 * @param {number} newQuantity - New quantity to set (must be positive integer)
 */
function updateCartQuantity(productName, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productName);
    return;
  }
  
  const item = cart.find(item => item.name === productName);
  if (item) {
    item.quantity = newQuantity;
    saveCartToStorage();
    showCart(); // Refresh cart modal to reflect changes
  }
}

/**
 * Increases the quantity of a specific product in the cart by 1
 * Used by the '+' button in cart item controls
 * 
 * @param {string} productName - Name of the product to increase quantity for
 */
function increaseQuantity(productName) {
  const item = cart.find(item => item.name === productName);
  if (item) {
    item.quantity += 1;
    saveCartToStorage();
    showCart(); // Refresh cart modal to show updated quantity
  }
}

/**
 * Decreases the quantity of a specific product in the cart by 1
 * If quantity reaches 1 and is decreased, removes the item entirely
 * Used by the '-' button in cart item controls
 * 
 * @param {string} productName - Name of the product to decrease quantity for
 */
function decreaseQuantity(productName) {
  const item = cart.find(item => item.name === productName);
  if (item && item.quantity > 1) {
    item.quantity -= 1;
    saveCartToStorage();
    showCart(); // Refresh cart modal to show updated quantity
  } else if (item && item.quantity === 1) {
    removeFromCart(productName); // Remove item if quantity would become 0
  }
}

/**
 * Navigates to the checkout page
 * Ensures cart data is persisted before navigation
 * Called when user clicks "Proceed to Checkout" button
 */
function goToCheckout() {
  saveCartToStorage(); // Ensure cart is saved before leaving page
  window.location.href = 'checkout.html';
}

// ======================
// PRODUCT RENDERING
// ======================

/**
 * Generates HTML for a single product card with dynamic pricing and discount logic
 * Applies 20% discount to the first product (featured item) automatically
 * Handles price display, discount badges, and fallback images
 * 
 * @param {Object} prod - Product object from products-data.json
 * @param {string} prod.name - Product name
 * @param {number} prod.price - Original product price
 * @param {string} prod.image - Product image path
 * @param {string} prod.description - Product description
 * @param {string} prod.category - Product category
 * @param {number} [prod.discountPercent] - Optional discount percentage
 * @param {number} [index=0] - Product position (0 = featured with auto-discount)
 * @returns {string} Complete HTML string for product card
 */
function renderProductCard(prod, index=0) {
  // Determine if product should display a discount (mirror featured logic: apply 20% off first product)
  const discountPercent = (prod.discountPercent || (index === 0 ? 20 : 0));
  const hasDiscount = discountPercent > 0;
  const originalPrice = prod.price || 0;
  const discountedPrice = hasDiscount ? originalPrice * (1 - discountPercent/100) : originalPrice;
  const savings = originalPrice - discountedPrice;

  const badgeHTML = hasDiscount ? `<span class="badge sale-badge position-absolute top-0 end-0 m-2">-${discountPercent}%</span>` : '';
  const priceHTML = hasDiscount ? `
    <div class="mb-2">
      <div class="price-original">$${originalPrice.toFixed(2)}</div>
      <div class="price-new">$${discountedPrice.toFixed(2)}</div>
      <div class="price-savings">Save $${savings.toFixed(2)}</div>
    </div>` : `<div class="price mb-2">$${originalPrice.toFixed(2)}</div>`;

  const dataPriceAttr = hasDiscount ? `data-price="${discountedPrice.toFixed(2)}"` : '';

  return `
    <div class="col-sm-6 col-md-6 col-lg-4 col-xl-3 product" data-name="${prod.name}">
      <div class="card card-tech h-100 fade-in position-relative">
        ${badgeHTML}
        <img src="${prod.image || 'images/default.svg'}" class="card-img-top" alt="${prod.name}" onerror="this.src='images/default.svg'">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${prod.name}</h5>
            <p class="card-text text-muted flex-grow-1">${prod.description || ''}</p>
            ${priceHTML}
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <span class="badge bg-darktech">${prod.category}</span>
              <button class="btn btn-neon btn-sm add-to-cart-btn" ${dataPriceAttr} data-name="${prod.name}">Add to Cart</button>
            </div>
        </div>
      </div>
    </div>`;
}

/**
 * Renders all products or a limited subset to a specified container
 * Fetches product data from JSON file and generates HTML cards
 * 
 * @param {string} containerId - ID of the HTML element to render products into
 * @param {number|null} [limit=null] - Maximum number of products to render (null = all)
 */
function renderProducts(containerId, limit = null) {
  fetch('products-data.json')
    .then(res => res.json())
    .then(data => {
      let products = data.filter(p => p.name); // Only valid products with names
      if (limit) products = products.slice(0, limit); // Apply limit if specified
      const container = document.getElementById(containerId);
      if (container) {
        // Generate HTML cards using renderProductCard with index for discount logic
        container.innerHTML = products.map((p,i)=>renderProductCard(p,i)).join('');
      }
    })
    .catch(err => console.error('Error loading products:', err));
}

/**
 * Filters and displays products by category
 * Used by category filter buttons on products page
 * Shows all products when category is 'All', otherwise filters by exact category match
 * 
 * @param {string} category - Category to filter by ('All' for no filter, or specific category name)
 */
function filterProducts(category) {
  fetch('products-data.json')
    .then(res => res.json())
    .then(products => {
      // Filter products based on category selection
      const filtered = category === 'All'
        ? products.filter(p => p.name) // Show all valid products
        : products.filter(p => p.category === category && p.name); // Filter by category
      
      const container = document.getElementById('products');
      if (container) {
        // Render filtered products or show "no products" message
        container.innerHTML = filtered.length
            ? filtered.map((p, i) => renderProductCard(p, i)).join('')
          : '<div class="col-12"><div class="alert alert-warning">No products found.</div></div>';
      }
    });
}

// ======================
// FEATURED PRODUCTS
// ======================

/**
 * Renders the featured deal product with fixed 20% discount
 * Used in hero section to highlight a special offer
 * Displays original price, discounted price, and savings amount
 * 
 * @param {Object} product - Product object to feature
 * @param {string} product.name - Product name
 * @param {number} product.price - Original product price
 * @param {string} product.image - Product image path
 * @param {string} product.description - Product description
 */
function renderFeaturedDeal(product) {
  const container = document.getElementById('featured-deal');
  if (!container) return;

  const discountPercent = 20;
  const originalPrice = product.price;
  const discountedPrice = originalPrice * (1 - discountPercent / 100);
  const savings = originalPrice - discountedPrice;

  container.innerHTML = `
    <div class="position-relative">
      <span class="badge bg-primary position-absolute top-0 end-0 m-2" style="z-index: 10;">-${discountPercent}%</span>
      <img src="${product.image || 'images/default.svg'}" class="img-fluid rounded mb-3" alt="${product.name}" style="max-height: 200px; width: 100%; object-fit: cover;" onerror="this.src='images/default.svg'">
      <div class="text-center">
        <h5>${product.name}</h5>
        <p class="text-muted small">${product.description || ''}</p>
        <div class="price-section mb-3">
          <div class="text-muted text-decoration-line-through small">Was: $${originalPrice.toFixed(2)}</div>
          <div class="h4 text-success fw-bold mb-1">Now: $${discountedPrice.toFixed(2)}</div>
          <div class="small text-primary">You save: $${savings.toFixed(2)}</div>
        </div>
        <button class="btn btn-primary add-to-cart-btn" data-name="${product.name}" data-price="${discountedPrice}">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

/**
 * Renders responsive product carousel with dynamic slide organization
 * Adapts products per slide based on screen size and applies discount to first product
 * Used on homepage to showcase featured products in an interactive carousel
 * 
 * @param {string} containerId - Container ID (currently unused, could be for future flexibility)
 * @param {number} [limit=8] - Maximum number of products to include in carousel
 */
function renderFeaturedProductsCarousel(containerId, limit = 8) {
  fetch('products-data.json')
    .then(res => res.json())
    .then(data => {
      const products = data.filter(p => p.name).slice(0, limit);
      const carouselInner = document.getElementById('featured-products-carousel');
      const indicators = document.getElementById('carousel-indicators');
      
      if (!carouselInner || !indicators) return;
      
      carouselInner.innerHTML = '';
      indicators.innerHTML = '';
      
      const getProductsPerSlide = () => {
        const width = window.innerWidth;
        if (width <= 576) return 1;
        if (width <= 768) return 2;
        if (width <= 992) return 3;
        return 4;
      };
      
      const productsPerSlide = getProductsPerSlide();
      const slides = [];
      
      for (let i = 0; i < products.length; i += productsPerSlide) {
        slides.push(products.slice(i, i + productsPerSlide));
      }
      
      slides.forEach((slideProducts, index) => {
        const slide = document.createElement('div');
        slide.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        
        const getColClass = () => {
          if (productsPerSlide === 1) return 'col-12';
          if (productsPerSlide === 2) return 'col-6';
          if (productsPerSlide === 3) return 'col-md-4 col-6';
          return 'col-xl-3 col-lg-4 col-md-6 col-sm-6';
        };
        
        slide.innerHTML = `
          <div class="row g-3 justify-content-center">
            ${slideProducts.map((prod, prodIndex) => {
              const isDiscounted = index === 0 && prodIndex === 0;
              const discountPercent = 20;
              const originalPrice = prod.price;
              const discountedPrice = isDiscounted ? originalPrice * (1 - discountPercent / 100) : originalPrice;
              const savings = originalPrice - discountedPrice;
              
              const discountBadge = isDiscounted ? 
                `<span class="badge bg-danger position-absolute top-0 end-0 m-2" style="z-index: 10;">-${discountPercent}%</span>` : '';
              
              const priceHTML = isDiscounted ? `
                <div class="price-section mb-2">
                  <div class="text-muted text-decoration-line-through small">Was: $${originalPrice.toFixed(2)}</div>
                  <div class="text-success fw-bold">Now: $${discountedPrice.toFixed(2)}</div>
                  <div class="small text-primary">Save: $${savings.toFixed(2)}</div>
                </div>
              ` : `<div class="price mb-2">$${prod.price ? prod.price.toFixed(2) : 'N/A'}</div>`;
              
              return `
                <div class="${getColClass()} product" data-name="${prod.name}">
                  <div class="card card-tech h-100 fade-in position-relative">
                    ${discountBadge}
                    <img src="${prod.image || 'images/default.svg'}" class="card-img-top" alt="${prod.name}" onerror="this.src='images/default.svg'">
                    <div class="card-body d-flex flex-column">
                      <h5 class="card-title">${prod.name}</h5>
                      <p class="card-text text-muted flex-grow-1">${prod.description || ''}</p>
                      <div class="mt-auto">
                        ${priceHTML}
                        <div class="d-flex justify-content-between align-items-center">
                          <span class="badge bg-secondary">${prod.category}</span>
                          <button class="btn btn-neon btn-sm add-to-cart-btn" data-name="${prod.name}" ${isDiscounted ? `data-price="${discountedPrice}"` : ''}>Add to Cart</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
        
        carouselInner.appendChild(slide);
        
        // Create indicator
        const indicator = document.createElement('button');
        indicator.type = 'button';
        indicator.setAttribute('data-bs-target', '#featuredProductsCarousel');
        indicator.setAttribute('data-bs-slide-to', index);
        indicator.className = index === 0 ? 'active' : '';
        if (index === 0) indicator.setAttribute('aria-current', 'true');
        indicator.setAttribute('aria-label', `Slide ${index + 1}`);
        
        indicators.appendChild(indicator);
      });
      
      // Handle responsive rebuild on resize
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (getProductsPerSlide() !== productsPerSlide) {
            renderFeaturedProductsCarousel(containerId, limit);
          }
        }, 250);
      });
      
    })
    .catch(err => {
      console.error('Error loading carousel products:', err);
      document.getElementById('featuredProductsCarousel').style.display = 'none';
      document.getElementById('featured-products').style.display = 'block';
      renderProducts('featured-products', 4);
    });
}

// ======================
// SEARCH FUNCTIONALITY
// ======================

/**
 * Enhanced search function that searches across multiple product fields
 * Performs case-insensitive partial matching on name, description, and category
 * Returns all products if search term is empty
 * 
 * @param {Array} products - Array of product objects to search through
 * @param {string} searchTerm - Search query string (case-insensitive)
 * @returns {Array} Filtered array of products matching the search term
 */
function searchProducts(products, searchTerm) {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return products;
  
  return products.filter(product => {
    // Search in product name
    const nameMatch = product.name && product.name.toLowerCase().includes(term);
    
    // Search in product description
    const descriptionMatch = product.description && product.description.toLowerCase().includes(term);
    
    // Search in product category
    const categoryMatch = product.category && product.category.toLowerCase().includes(term);
    
    // Return true if any field matches
    return nameMatch || descriptionMatch || categoryMatch;
  });
}

/**
 * Sets up search form event handlers for all pages
 * Handles form submission and redirects to products page with search parameters
 * Supports search forms on homepage, products page, and contact page
 */
function setupSearch() {
  const searchForm = document.getElementById('searchForm');
  const searchFormProducts = document.getElementById('searchFormProducts');
  const searchFormContact = document.getElementById('searchFormContact');
  
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const term = document.getElementById('searchInput').value.trim();
      const url = new URL(window.location.origin + '/products.html');
      if (term) url.searchParams.set('q', term);
      window.location.href = url.pathname + url.search;
    });
  }

  if (searchFormProducts) {
    searchFormProducts.addEventListener('submit', function(e) {
      e.preventDefault();
      const term = document.getElementById('searchInputProducts').value.trim();
      fetch('products-data.json')
        .then(res => res.json())
        .then(products => {
          const filtered = searchProducts(products, term);
          const container = document.getElementById('products');
          if (container) {
            container.innerHTML = filtered.length
              ? filtered.map((p,i)=>renderProductCard(p,i)).join('')
              : '<div class="col-12"><div class="alert alert-warning">No products found matching your search.</div></div>';
          }
        });
    });
  }

  if (searchFormContact) {
    searchFormContact.addEventListener('submit', function(e) {
      e.preventDefault();
      const term = document.getElementById('searchInputContact').value.trim();
      const url = new URL(window.location.origin + '/products.html');
      if (term) url.searchParams.set('q', term);
      window.location.href = url.pathname + url.search;
    });
  }
}

// ======================
// SIDEBAR NAVIGATION
// ======================

/**
 * Sets up sidebar navigation highlighting based on scroll position and clicks
 * Uses Intersection Observer API to detect which section is currently visible
 * Highlights the corresponding navigation link in the sidebar
 */
function setupSidebarHighlight() {
  const sidebarLinks = Array.from(document.querySelectorAll('.sidebar-link[href^="#"]'));
  if (sidebarLinks.length === 0) return;

  // Click highlight
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Scroll highlight
  const ids = sidebarLinks
    .map(l => l.getAttribute('href'))
    .filter(href => href && href.startsWith('#'))
    .map(href => href.slice(1));

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    const id = visible.target.id;
    const activeLink = document.querySelector(`.sidebar-link[href="#${id}"]`);
    if (!activeLink) return;

    sidebarLinks.forEach(l => l.classList.remove('active'));
    activeLink.classList.add('active');
  }, { threshold: 0.55, rootMargin: '0px 0px -10% 0px' });

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// ======================
// FORM VALIDATION
// ======================

/**
 * Sets up contact form validation with real-time feedback
 * Implements comprehensive validation rules for name, email, phone, and message fields
 * Provides instant feedback as user types and prevents invalid form submission
 */
function setupContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;
  
  const validators = {
    name: (value) => {
      if (!value.trim()) return "Please enter your full name";
      if (value.trim().length < 2) return "Name must be at least 2 characters long";
      if (!/^[a-zA-Z\s'-]+$/.test(value)) return "Name can only contain letters, spaces, apostrophes, and hyphens";
      return null;
    },
    email: (value) => {
      if (!value.trim()) return "Please enter your email address";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
      return null;
    },
    phone: (value) => {
      if (!value.trim()) return "Please enter your phone number";
      const cleanPhone = value.replace(/\D/g, '');
      if (cleanPhone.length < 7) return "Phone number must be at least 7 digits";
      if (cleanPhone.length > 15) return "Phone number cannot exceed 15 digits";
      return null;
    },
    message: (value) => {
      if (!value.trim()) return "Please enter your message or inquiry";
      if (value.trim().length < 10) return "Message must be at least 10 characters long";
      if (value.trim().length > 1000) return "Message cannot exceed 1000 characters";
      return null;
    }
  };
  
  function createErrorElements() {
    Object.keys(validators).forEach(fieldName => {
      const field = contactForm[fieldName];
      if (field && !field.parentNode.querySelector('.error-message')) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-danger small mt-1';
        errorDiv.id = fieldName + '-error';
        errorDiv.style.display = 'none';
        field.parentNode.appendChild(errorDiv);
      }
    });
  }
  
  function showError(fieldName, message) {
    const errorElement = document.getElementById(fieldName + '-error');
    const field = contactForm[fieldName];
    if (errorElement && field) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
    }
  }
  
  function hideError(fieldName) {
    const errorElement = document.getElementById(fieldName + '-error');
    const field = contactForm[fieldName];
    if (errorElement && field) {
      errorElement.style.display = 'none';
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
    }
  }
  
  function validateField(fieldName) {
    const value = contactForm[fieldName].value;
    const error = validators[fieldName](value);
    if (error) {
      showError(fieldName, error);
      return false;
    } else {
      hideError(fieldName);
      return true;
    }
  }
  
  createErrorElements();
  
  // Real-time validation
  Object.keys(validators).forEach(fieldName => {
    const field = contactForm[fieldName];
    if (field) {
      field.addEventListener('input', () => validateField(fieldName));
    }
  });
  
  // Form submission
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let isValid = true;
    Object.keys(validators).forEach(fieldName => {
      if (!validateField(fieldName)) isValid = false;
    });
    
    if (isValid) {
      const existingAlert = document.getElementById('formAlert');
      if (existingAlert) existingAlert.remove();
      
      const successAlert = document.createElement('div');
      successAlert.id = 'formAlert';
      successAlert.className = 'alert alert-success mt-3';
      successAlert.innerHTML = `
        <i class="bi bi-check-circle"></i> 
        <strong>Thank you, ${this.name.value.split(' ')[0]}!</strong> 
        Your message has been successfully validated.
        <br><small>This is a demo form - no actual email is sent.</small>
      `;
      
      this.querySelector('button[type="submit"]').after(successAlert);
      this.reset();
      
      // Clear validation classes
      Object.keys(validators).forEach(fieldName => {
        const field = this[fieldName];
        if (field) field.classList.remove('is-invalid', 'is-valid');
        const errorElement = document.getElementById(fieldName + '-error');
        if (errorElement) errorElement.style.display = 'none';
      });
      
      successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const firstInvalidField = this.querySelector('.is-invalid');
      if (firstInvalidField) firstInvalidField.focus();
    }
  });
}

// ======================
// CHECKOUT FUNCTIONALITY  
// ======================

/**
 * Sets up checkout page functionality when not using Vue.js components
 * Handles cart rendering, form validation, shipping calculations, and order processing
 * Falls back to vanilla JS implementation if Vue component system is not detected
 */
function setupCheckout() {
  if (!window.location.pathname.endsWith('checkout.html')) return;
  
  // Check if the page is using Vue components (has #app element)
  if (document.getElementById('app')) return;

  loadCartFromStorage();
  renderCheckoutCart();
  updateCheckoutTotal();

  const shippingSelect = document.getElementById('shipping-method');
  if (shippingSelect) {
    shippingSelect.addEventListener('change', updateCheckoutTotal);
  }

  const form = document.getElementById('checkout-form');
  if (!form) return;

  const validators = {
    name: (s) => !s.trim() ? 'Please enter your full name' : (s.trim().length < 2 ? 'Name must be at least 2 characters' : (!/^[a-zA-Z\s'-]+$/.test(s) ? 'Only letters, spaces, apostrophes, hyphens allowed' : null)),
    email: (s) => !s.trim() ? 'Please enter your email' : (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? 'Enter a valid email' : null),
    mobile: (s) => !s.trim() ? 'Please enter your mobile number' : ((d => d.length < 8 || d.length > 15 ? 'Mobile must be 8–15 digits' : (!/^[\d\s+\-()]+$/.test(s) ? 'Contains invalid characters' : null))(s.replace(/\D/g, ''))),
    address: (s) => !s.trim() ? 'Please enter your full address' : (s.trim().length < 5 ? 'Address looks too short' : null),
    card: (s) => (d => d.length !== 16 ? 'Card number must be 16 digits' : null)(s.replace(/\D/g,'')),
    expiry: (s) => !/^\d{2}\/\d{2}$/.test(s) ? 'Expiry must be MM/YY' : ((([mm, yy]) => mm < 1 || mm > 12 ? 'Invalid month' : (new Date(2000 + yy, mm) < new Date(new Date().getFullYear(), new Date().getMonth() + 1) ? 'Card is expired' : null))(s.split('/').map(x => parseInt(x,10)))),
    cvv: (s) => !/^\d{3}$/.test(s) ? 'CVV must be 3 digits' : null,
    cardname: (s) => !s.trim() ? 'Please enter the name on your card' : (s.trim().length < 2 ? 'Name on card looks too short' : (!/^[a-zA-Z\s'-]+$/.test(s) ? 'Only letters, spaces, apostrophes, hyphens allowed' : null))
  };

  const fields = Object.keys(validators);
  
  // Create error elements
  fields.forEach(fieldName => {
    const input = form[fieldName];
    if (input && !input.parentNode.querySelector('.checkout-error')) {
      const err = document.createElement('div');
      err.className = 'checkout-error text-danger small mt-1';
      err.style.display = 'none';
      input.parentNode.appendChild(err);
    }
  });

  function showError(name, msg) {
    const input = form[name];
    const el = input?.parentNode.querySelector('.checkout-error');
    if (!input || !el) return;
    el.textContent = msg;
    el.style.display = 'block';
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
  }
  
  function hideError(name) {
    const input = form[name];
    const el = input?.parentNode.querySelector('.checkout-error');
    if (!input || !el) return;
    el.style.display = 'none';
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
  }
  
  function validateField(name) {
    const value = form[name].value;
    const err = validators[name](value);
    if (err) showError(name, err); else hideError(name);
    return !err;
  }

  // Live formatting and validation
  form.card.addEventListener('input', () => {
    const digits = form.card.value.replace(/\D/g,'').slice(0,16);
    form.card.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    validateField('card');
  });
  
  form.expiry.addEventListener('input', () => {
    let value = form.expiry.value.replace(/\D/g,'').slice(0,4);
    if (value.length >= 3) value = value.slice(0,2) + '/' + value.slice(2);
    form.expiry.value = value;
    validateField('expiry');
  });
  
  form.cvv.addEventListener('input', () => {
    form.cvv.value = form.cvv.value.replace(/\D/g,'').slice(0,3);
    validateField('cvv');
  });

  ['mobile', 'name', 'email', 'address', 'cardname'].forEach(field => {
    form[field].addEventListener('input', () => validateField(field));
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    loadCartFromStorage();
    const successBox = document.getElementById('checkout-success');
    successBox.innerHTML = '';

    if (cart.length === 0) {
      successBox.innerHTML = '<div class="alert alert-danger"><i class="bi bi-exclamation-triangle"></i> Your cart is empty.</div>';
      return;
    }

    const allValid = fields.every(field => validateField(field));

    if (!allValid) {
      successBox.innerHTML = '<div class="alert alert-danger"><i class="bi bi-exclamation-triangle"></i> Please correct the highlighted fields.</div>';
      form.querySelector('.is-invalid')?.focus();
      return;
    }

    successBox.innerHTML = `<div class="alert alert-success"><i class="bi bi-check-circle"></i> <strong>Payment Successful!</strong> Thank you, ${form.name.value.split(' ')[0]}.</div>`;
    localStorage.removeItem('cart');
    cart = [];
    renderCheckoutCart();
    updateCheckoutTotal();
    form.reset();
    
    fields.forEach(field => {
      form[field]?.classList.remove('is-invalid','is-valid');
      const el = form[field]?.parentNode.querySelector('.checkout-error');
      if (el) el.style.display = 'none';
    });
  });
}

/**
 * Renders the shopping cart table on checkout page
 * Displays cart items with quantity controls, pricing details, and removal buttons
 * Shows savings information for discounted items
 */
function renderCheckoutCart() {
  const container = document.getElementById('cart-items');
  if (!container) return;
  
  loadCartFromStorage();
  
  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    const totalEl = document.getElementById('checkout-total');
    if (totalEl) totalEl.innerHTML = '';
    return;
  }
  
  let html = '<table class="table table-dark table-striped align-middle"><thead><tr><th>Product</th><th>Price Details</th><th>Qty</th><th>Total</th><th></th></tr></thead><tbody>';
  
  cart.forEach((item, idx) => {
    const itemTotal = item.price * item.quantity;
    
    let priceDetails = `$${item.price.toFixed(2)} each`;
    if (item.isDiscounted && item.originalPrice) {
      const savings = (item.originalPrice - item.price) * item.quantity;
      priceDetails = `
        <div class="small">
          <span class="text-decoration-line-through text-muted">Was: $${item.originalPrice.toFixed(2)}</span><br>
          <span class="text-success fw-bold">Now: $${item.price.toFixed(2)}</span><br>
          <span class="text-primary small">Save: $${savings.toFixed(2)} total</span>
        </div>
      `;
    }
    
    html += `<tr>
      <td>
        <strong>${item.name}</strong>
        ${item.isDiscounted ? '<span class="badge bg-success ms-2">SALE</span>' : ''}
      </td>
      <td>${priceDetails}</td>
      <td>
        <input type="number" min="1" value="${item.quantity}" class="form-control form-control-sm qty-input" data-idx="${idx}" style="width:70px;">
      </td>
      <td><strong>$${itemTotal.toFixed(2)}</strong></td>
      <td>
        <button type="button" class="btn btn-outline-danger btn-sm remove-item" data-idx="${idx}">&times;</button>
      </td>
    </tr>`;
  });
  
  html += '</tbody></table>';
  container.innerHTML = html;

  // Event listeners for quantity changes and item removal
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', function() {
      const idx = this.getAttribute('data-idx');
      const val = Math.max(1, parseInt(this.value) || 1);
      cart[idx].quantity = val;
      saveCartToStorage();
      renderCheckoutCart();
      updateCheckoutTotal();
    });
  });

  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = this.getAttribute('data-idx');
      cart.splice(idx, 1);
      saveCartToStorage();
      renderCheckoutCart();
      updateCheckoutTotal();
    });
  });
}

/**
 * Calculates and displays checkout totals including shipping and savings
 * Updates in real-time when cart contents or shipping method changes
 * Shows breakdown of original prices, discounts, subtotal, shipping, and final total
 */
function updateCheckoutTotal() {
  loadCartFromStorage();
  
  let subtotal = 0;
  let totalSavings = 0;
  
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    if (item.isDiscounted && item.originalPrice) {
      totalSavings += (item.originalPrice - item.price) * item.quantity;
    }
  });
  
  const shipping = document.getElementById('shipping-method');
  const shippingCost = (shipping && shipping.value === 'express') ? 15 : 0;
  const total = subtotal + shippingCost;
  
  let totalHTML = '';
  
  if (totalSavings > 0) {
    const originalTotal = subtotal + totalSavings + shippingCost;
    totalHTML += `
      <div class="d-flex justify-content-between text-muted small">
        <span>Original Total:</span>
        <span class="text-decoration-line-through">$${originalTotal.toFixed(2)}</span>
      </div>
      <div class="d-flex justify-content-between text-success">
        <span>You Save:</span>
        <span class="fw-bold">-$${totalSavings.toFixed(2)}</span>
      </div>
    `;
  }
  
  totalHTML += `
    <div class="d-flex justify-content-between">
      <span>Subtotal:</span>
      <span>$${subtotal.toFixed(2)}</span>
    </div>
  `;
  
  totalHTML += shippingCost > 0 ? `
    <div class="d-flex justify-content-between">
      <span>Express Shipping:</span>
      <span>$${shippingCost.toFixed(2)}</span>
    </div>
  ` : `
    <div class="d-flex justify-content-between text-success">
      <span>Standard Shipping:</span>
      <span>FREE</span>
    </div>
  `;
  
  totalHTML += `
    <hr>
    <div class="d-flex justify-content-between h5">
      <span>Total:</span>
      <span class="fw-bold">$${total.toFixed(2)}</span>
    </div>
  `;
  
  const totalEl = document.getElementById('checkout-total');
  if (totalEl) totalEl.innerHTML = totalHTML;
}

// ======================
// CART MODAL FOCUS MANAGEMENT
// ======================

/**
 * Sets up cart modal event handlers for better UX
 * Removes focus from cart buttons when modal closes to prevent visual artifacts
 */
function setupCartModalEvents() {
  const cartModal = document.getElementById('cartModal');
  if (cartModal) {
    // Remove focus from cart button when modal closes
    cartModal.addEventListener('hidden.bs.modal', function () {
      // Find all cart buttons and remove focus
      const cartButtons = document.querySelectorAll('button[onclick="showCart()"]');
      cartButtons.forEach(button => {
        button.blur();
        // Remove any focus-visible class if present
        button.classList.remove('focus-visible');
      });
    });
  }
}

// ======================
// INITIALIZATION
// ======================

/**
 * Main initialization function called when DOM is loaded
 * Sets up all page functionality, event listeners, and loads initial data
 * Handles different page types (homepage, products, checkout) appropriately
 */
function initializePage() {
  loadCartFromStorage();
  
  // Set up search functionality
  setupSearch();
  
  // Set up sidebar navigation
  setupSidebarHighlight();
  
  // Set up contact form
  setupContactForm();
  
  // Set up checkout
  setupCheckout();
  
  // Set up cart modal focus management
  setupCartModalEvents();
  
  // Handle products page search parameters
  if (window.location.pathname.endsWith('products.html')) {
    renderProducts('products');
    
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('q');
    if (searchQuery) {
      const input = document.getElementById('searchInputProducts');
      if (input) input.value = searchQuery;
      
      fetch('products-data.json')
        .then(res => res.json())
        .then(products => {
          const filtered = searchProducts(products, searchQuery);
          const container = document.getElementById('products');
          if (container) {
            container.innerHTML = filtered.length
              ? filtered.map((p,i)=>renderProductCard(p,i)).join('')
              : '<div class="col-12"><div class="alert alert-warning">No products found matching your search.</div></div>';
          }
        });
    }
  }
  
  // Initialize featured products carousel or regular grid
  if (document.getElementById('featured-products-carousel')) {
    renderFeaturedProductsCarousel('featured-products-carousel', 8);
  } else {
    renderProducts('featured-products', 4);
  }
  
  // Load featured deal
  fetch('products-data.json')
    .then(res => res.json())
    .then(products => {
      if (products.length > 0) renderFeaturedDeal(products[0]);
    })
    .catch(err => console.error('Error loading featured deal:', err));
  
  // Set up filter buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('filter-btn')) {
      e.preventDefault();
      e.stopPropagation();
      
      // Get category from data attribute
      const category = e.target.getAttribute('data-category');
      if (category) {
        // Update active state
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        // Filter products
        filterProducts(category);
      }
    }
  });
}

// ======================
// EVENT LISTENERS
// ======================

/**
 * Global click event delegation for add-to-cart buttons
 * Handles all "Add to Cart" button clicks across the entire site
 * Uses event delegation for dynamic content compatibility
 */
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('add-to-cart-btn')) {
    e.preventDefault();
    e.stopPropagation();
    const productName = e.target.getAttribute('data-name');
    if (productName) {
      addToCart(productName);
    }
  }
});

/**
 * Start the application when DOM is fully loaded
 * Ensures all HTML elements are available before initializing functionality
 */
document.addEventListener('DOMContentLoaded', initializePage);
