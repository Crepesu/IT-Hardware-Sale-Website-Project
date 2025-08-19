// --- Cart logic ---
let cart = [];

// Load cart from localStorage
function loadCartFromStorage() {
  cart = JSON.parse(localStorage.getItem('cart') || '[]');
}

// Save cart to localStorage
function saveCartToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// --- Product rendering ---
function renderProductCard(prod) {
  return `
    <div class="col-md-6 col-lg-3 product" data-name="${prod.name}">
      <div class="card card-tech h-100 fade-in">
        <img src="${prod.image}" class="card-img-top" alt="${prod.name}">
        <div class="card-body">
          <h5 class="card-title">${prod.name}</h5>
          <p class="card-text text-muted">${prod.description}</p>
          <div class="price mb-2">$${prod.price.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
          <span class="badge bg-darktech">${prod.category}</span>
          <button class="btn btn-neon mt-2 add-to-cart-btn" data-name="${prod.name}">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
}

// Load products from JSON and render
function renderProducts(containerId, limit = null) {
  fetch('products-data.json')
    .then(res => res.json())
    .then(data => {
      let products = data;
      if (limit) products = products.slice(0, limit);
      document.getElementById(containerId).innerHTML = products.map(renderProductCard).join('');
    })
    .catch(err => console.error('Error loading products JSON', err));
}

// --- Cart actions ---
function addToCart(productName) {
  fetch('products-data.json')
    .then(res => res.json())
    .then(products => {
      const prod = products.find(p => p.name === productName);
      if (prod) {
        loadCartFromStorage();
        const existing = cart.find(item => item.name === prod.name);
        if (existing) {
          existing.qty += 1;
        } else {
          cart.push({...prod, qty: 1});
        }
        saveCartToStorage();
        showCart();
      }
    });
}

// Show cart modal
function showCart() {
  loadCartFromStorage();
  let html = '<h5>Your Cart</h5>';
  if (cart.length === 0) {
    html += '<p>Cart is empty.</p>';
  } else {
    html += '<ul class="list-group mb-2">';
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.qty;
      html += `<li class="list-group-item bg-darktech-2 text-white d-flex justify-content-between align-items-center">
        ${item.name} <span>x${item.qty} - $${(item.price * item.qty).toFixed(2)}</span>
      </li>`;
    });
    html += '</ul>';
    html += `<div class="fw-bold mb-2">Total: $${total.toFixed(2)}</div>`;
    html += '<button class="btn btn-outline-neon btn-sm me-2" onclick="clearCart()">Clear Cart</button>';
    html += '<button class="btn btn-neon btn-sm" onclick="goToCheckout()">Checkout</button>';
  }
  document.getElementById('cart-modal-body').innerHTML = html;
  const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
  cartModal.show();
}

// Clear cart
function clearCart() {
  cart = [];
  saveCartToStorage();
  showCart();
}

// Go to checkout page
function goToCheckout() {
  saveCartToStorage();
  window.location.href = 'checkout.html';
}

// --- Event listeners ---
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('add-to-cart-btn')) {
    const name = e.target.getAttribute('data-name');
    addToCart(name);
  }
});

// --- Featured Deal rendering ---
function renderFeaturedDeal(product) {
  if (!product) return;
  document.getElementById('featured-deal').innerHTML = `
    <div class="d-flex align-items-center justify-content-between mb-3">
      <span class="text-muted">Featured Deal</span>
      <span class="badge bg-neon text-dark">-20%</span>
    </div>
    <div class="ratio ratio-16x9 rounded-3 overflow-hidden mb-3">
      <img src="${product.image}" alt="${product.name}" class="w-100 h-100 object-fit-cover">
    </div>
    <h5 class="mb-1">${product.name}</h5>
    <p class="text-muted mb-3">${product.description}</p>
    <div class="d-flex align-items-center justify-content-between">
      <span class="h4 mb-0">$${product.price.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
      <button class="btn btn-sm btn-neon add-to-cart-btn" data-name="${product.name}">Add to Cart</button>
    </div>
  `;
}

// --- On page load, fetch and render featured deal ---
document.addEventListener('DOMContentLoaded', () => {
  // Only show 4 products
  renderProducts('featured-products', 4);
  loadCartFromStorage();

  // For products.html, render all products
  if (window.location.pathname.endsWith('products.html')) {
    renderProducts('products');
  }

  // Fetch and render the first product as featured deal
  fetch('products-data.json')
    .then(res => res.json())
    .then(products => {
      if (products.length > 0) renderFeaturedDeal(products[0]);
  });
  
  // Search for index.html
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const term = document.getElementById('searchInput').value.trim().toLowerCase();
      fetch('products-data.json')
        .then(res => res.json())
        .then(products => {
          const filtered = products.filter(p => p.name && p.name.toLowerCase().includes(term));
          document.getElementById('featured-products').innerHTML = filtered.length
            ? filtered.map(renderProductCard).join('')
            : '<div class="col-12"><div class="alert alert-warning">No products found.</div></div>';
        });
    });
  }

  // Search for products.html
  const searchFormProducts = document.getElementById('searchFormProducts');
  if (searchFormProducts) {
    searchFormProducts.addEventListener('submit', function(e) {
      e.preventDefault();
      const term = document.getElementById('searchInputProducts').value.trim().toLowerCase();
      fetch('products-data.json')
        .then(res => res.json())
        .then(products => {
          const filtered = products.filter(p => p.name && p.name.toLowerCase().includes(term));
          document.getElementById('products').innerHTML = filtered.length
            ? filtered.map(renderProductCard).join('')
            : '<div class="col-12"><div class="alert alert-warning">No products found.</div></div>';
        });
    });
  }
});

// --- Navbar search ---
document.addEventListener('DOMContentLoaded', () => {
  // Only show 4 products
  renderProducts('featured-products', 4);
  loadCartFromStorage();
  

  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const term = document.getElementById('searchInput').value.trim().toLowerCase();
      fetch('products-data.json')
        .then(res => res.json())
        .then(products => {
          const filtered = products.filter(p => p.name && p.name.toLowerCase().includes(term));
          document.getElementById('featured-products').innerHTML = filtered.length
            ? filtered.map(renderProductCard).join('')
            : '<div class="col-12"><div class="alert alert-warning">No products found.</div></div>';
        });
    });
  }
});

// --- Sidebar highlight ---
document.addEventListener('scroll', () => {
  const sections = ['home', 'products', 'contact'];
  let found = false;
  sections.forEach(id => {
    const el = document.getElementById(id);
    const link = document.querySelector(`.sidebar-link[href="#${id}"]`);
    if (el && link) {
      const rect = el.getBoundingClientRect();
      if (!found && rect.top < window.innerHeight / 2 && rect.bottom > 60) {
        link.classList.add('active');
        found = true;
      } else {
        link.classList.remove('active');
      }
    }
  });
});

// --- Contact form validation ---
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      let valid = true;
      let name = contactForm.name.value.trim();
      let email = contactForm.email.value.trim();
      let phone = contactForm.phone.value.trim();
      let message = contactForm.message.value.trim();

      if (!name) { contactForm.name.classList.add('is-invalid'); valid = false; } else { contactForm.name.classList.remove('is-invalid'); }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { contactForm.email.classList.add('is-invalid'); valid = false; } else { contactForm.email.classList.remove('is-invalid'); }
      if (!/^\d{7,15}$/.test(phone.replace(/\D/g,''))) { contactForm.phone.classList.add('is-invalid'); valid = false; } else { contactForm.phone.classList.remove('is-invalid'); }
      if (!message) { contactForm.message.classList.add('is-invalid'); valid = false; } else { contactForm.message.classList.remove('is-invalid'); }

      if (!valid) {
        document.getElementById('formAlert').classList.add('d-none');
        return;
      }

      document.getElementById('formAlert').classList.remove('d-none');
      contactForm.reset();
    });

    ['name','email','phone','message'].forEach(id => {
      contactForm[id].addEventListener('input', function() {
        this.classList.remove('is-invalid');
      });
    });
  }
});

// --- Checkout page logic ---
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('checkout.html')) {
    loadCartFromStorage();
    renderCheckoutCart();
    updateCheckoutTotal();
    const shippingSelect = document.getElementById('shipping-method');
    if (shippingSelect) shippingSelect.addEventListener('change', updateCheckoutTotal);

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.onsubmit = function(e) {
        e.preventDefault();
        let valid = true;
        let form = this;
        let name = form.name.value.trim();
        let email = form.email.value.trim();
        let mobile = form.mobile.value.trim();
        let address = form.address.value.trim();
        let card = form.card.value.trim().replace(/\s/g,'');
        let expiry = form.expiry.value.trim();
        let cvv = form.cvv.value.trim();
        let cardname = form.cardname.value.trim();

        if (!name) { form.name.classList.add('is-invalid'); valid = false; } else { form.name.classList.remove('is-invalid'); }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { form.email.classList.add('is-invalid'); valid = false; } else { form.email.classList.remove('is-invalid'); }
        if (!/^\+?\d{8,15}$/.test(mobile.replace(/\s/g,''))) { form.mobile.classList.add('is-invalid'); valid = false; } else { form.mobile.classList.remove('is-invalid'); }
        if (!address) { form.address.classList.add('is-invalid'); valid = false; } else { form.address.classList.remove('is-invalid'); }
        if (!/^\d{16}$/.test(card)) { form.card.classList.add('is-invalid'); valid = false; } else { form.card.classList.remove('is-invalid'); }
        if (!/^\d{2}\/\d{2}$/.test(expiry)) { form.expiry.classList.add('is-invalid'); valid = false; } else { form.expiry.classList.remove('is-invalid'); }
        if (!/^\d{3}$/.test(cvv)) { form.cvv.classList.add('is-invalid'); valid = false; } else { form.cvv.classList.remove('is-invalid'); }
        if (!cardname) { form.cardname.classList.add('is-invalid'); valid = false; } else { form.cardname.classList.remove('is-invalid'); }

        loadCartFromStorage();
        if (cart.length === 0) {
          document.getElementById('checkout-success').innerHTML = `<div class="alert alert-danger">Your cart is empty.</div>`;
          return;
        }
        if (!valid) {
          document.getElementById('checkout-success').innerHTML = `<div class="alert alert-danger">Please fill all fields correctly.</div>`;
          return;
        }
        document.getElementById('checkout-success').innerHTML = `
          <div class="alert alert-success">Payment Successful! Thank you, your order is placed.</div>
        `;
        localStorage.removeItem('cart');
        cart = [];
        renderCheckoutCart();
        updateCheckoutTotal();
        form.reset();
      };
    }
  }
});

// Render cart in checkout
function renderCheckoutCart() {
  const container = document.getElementById('cart-items');
  if (!container) return;
  loadCartFromStorage();
  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById('checkout-total').textContent = '';
    return;
  }
  let html = '<table class="table table-dark table-striped align-middle"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th></th></tr></thead><tbody>';
  cart.forEach((item, idx) => {
    html += `<tr>
      <td>${item.name}</td>
      <td>
        <input type="number" min="1" value="${item.qty}" class="form-control form-control-sm qty-input" data-idx="${idx}" style="width:70px;">
      </td>
      <td>$${(item.price * item.qty).toFixed(2)}</td>
      <td>
        <button type="button" class="btn btn-outline-danger btn-sm remove-item" data-idx="${idx}">&times;</button>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;

  // Quantity change
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', function() {
      const idx = this.getAttribute('data-idx');
      let val = parseInt(this.value);
      if (isNaN(val) || val < 1) val = 1;
      cart[idx].qty = val;
      saveCartToStorage();
      renderCheckoutCart();
      updateCheckoutTotal();
    });
  });

  // Remove item
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

// Update total in checkout
function updateCheckoutTotal() {
  loadCartFromStorage();
  let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = document.getElementById('shipping-method');
  if (shipping && shipping.value === 'express') total += 15;
  document.getElementById('checkout-total').textContent = `Total: $${total.toFixed(2)}`;
}

//Products page search
function renderProductCard(prod) {
  return `
    <div class="col-md-6 col-lg-3 product" data-name="${prod.name}">
      <div class="card card-tech h-100 fade-in">
        <img src="${prod.image || 'images/default.jpg'}" class="card-img-top" alt="${prod.name}">
        <div class="card-body">
          <h5 class="card-title">${prod.name}</h5>
          <p class="card-text text-muted">${prod.description || ''}</p>
          <div class="price mb-2">$${prod.price ? prod.price.toLocaleString(undefined, {minimumFractionDigits:2}) : 'N/A'}</div>
          <span class="badge bg-darktech">${prod.category}</span>
          <button class="btn btn-neon mt-2 add-to-cart-btn" data-name="${prod.name}">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
}

function renderProducts(containerId, limit = null) {
  fetch('products-data.json')
    .then(res => res.json())
    .then(data => {
      let products = data.filter(p => p.name); // Only show products with a name
      if (limit) products = products.slice(0, limit);
      document.getElementById(containerId).innerHTML = products.map(renderProductCard).join('');
    });
}

function filterProducts(category) {
  fetch('products-data.json')
    .then(res => res.json())
    .then(products => {
      let filtered = category === 'All'
        ? products.filter(p => p.name)
        : products.filter(p => p.category === category && p.name);
      document.getElementById('products').innerHTML = filtered.length
        ? filtered.map(renderProductCard).join('')
        : '<div class="col-12"><div class="alert alert-warning">No products found.</div></div>';
    });
}

// Show all products on products.html load
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('products.html')) {
    renderProducts('products');
  }
});
