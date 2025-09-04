// --- Cart logic ---
let cart = [];

// --- Load cart from localStorage ---
function loadCartFromStorage() {
  cart = JSON.parse(localStorage.getItem('cart') || '[]');
}

// --- Save cart to localStorage ---
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

// --- Load products from JSON and render ---
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

// --- Show cart modal ---
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

// --- Clear cart ---
function clearCart() {
  cart = [];
  saveCartToStorage();
  showCart();
}

// --- Go to checkout page ---
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
      const term = document.getElementById('searchInput').value.trim();
      // Always go to products page with query
      const url = new URL(window.location.origin + '/products.html');
      if (term) url.searchParams.set('q', term);
      window.location.href = url.pathname + url.search;
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
  

  const searchForm2 = document.getElementById('searchForm');
  if (searchForm2) {
    searchForm2.addEventListener('submit', function(e) {
      e.preventDefault();
      const term = document.getElementById('searchInput').value.trim();
      const url = new URL(window.location.origin + '/products.html');
      if (term) url.searchParams.set('q', term);
      window.location.href = url.pathname + url.search;
    });
  }
});

// --- Sidebar highlight ---
// --- Sidebar highlight (scroll-based) ---
document.addEventListener('scroll', () => {
  const sections = ['home', 'products', 'contact'];
  let found = false;
  sections.forEach(id => {
    const el = document.getElementById(id);
    const link = document.querySelector(`.sidebar-link[href="#${id}"]`);
    if (el && link) {
      const rect = el.getBoundingClientRect();
      // Adjust the offset for when a section is considered active
      const offset = window.innerHeight / 2; // Mid-screen
      if (!found && rect.top <= offset && rect.bottom >= offset) {
        // Only set active if it's not already the active one from a click
        if (!link.classList.contains('active-from-click')) {
          document.querySelectorAll('.sidebar-link').forEach(item => item.classList.remove('active'));
          link.classList.add('active');
        }
        found = true;
      } else {
        link.classList.remove('active');
        link.classList.remove('active-from-click'); // Remove click-based active if scrolled away
      }
    }
  });
});

// --- Contact form validation --- (updated for more robust checks, with real-time feedback)
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    
    // Create error message elements for each field
    function createErrorMessages() {
      const fields = ['name', 'email', 'phone', 'message'];
      fields.forEach(fieldName => {
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
    
    // Initialize error message elements
    createErrorMessages();
    
    // Validation functions for each field
    function validateName(name) {
      if (!name.trim()) {
        return "Please enter your full name";
      }
      if (name.trim().length < 2) {
        return "Name must be at least 2 characters long";
      }
      if (!/^[a-zA-Z\s'-]+$/.test(name)) {
        return "Name can only contain letters, spaces, apostrophes, and hyphens";
      }
      return null;
    }
    
    function validateEmail(email) {
      if (!email.trim()) {
        return "Please enter your email address";
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return "Please enter a valid email address (example@domain.com)";
      }
      return null;
    }
    
    function validatePhone(phone) {
      if (!phone.trim()) {
        return "Please enter your phone number";
      }
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 7) {
        return "Phone number must be at least 7 digits";
      }
      if (cleanPhone.length > 15) {
        return "Phone number cannot exceed 15 digits";
      }
      if (!/^[\d\s\-\+\(\)]+$/.test(phone)) {
        return "Phone number contains invalid characters";
      }
      return null;
    }
    
    function validateMessage(message) {
      if (!message.trim()) {
        return "Please enter your message or inquiry";
      }
      if (message.trim().length < 10) {
        return "Message must be at least 10 characters long";
      }
      if (message.trim().length > 1000) {
        return "Message cannot exceed 1000 characters";
      }
      return null;
    }
    
    // Show/hide error messages
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
    
    function clearAllErrors() {
      ['name', 'email', 'phone', 'message'].forEach(fieldName => {
        hideError(fieldName);
        const field = contactForm[fieldName];
        if (field) {
          field.classList.remove('is-invalid', 'is-valid');
        }
      });
    }
    
    // Real-time validation on input
    contactForm.name.addEventListener('input', function() {
      const error = validateName(this.value);
      if (error) {
        showError('name', error);
      } else {
        hideError('name');
      }
    });
    
    contactForm.email.addEventListener('input', function() {
      const error = validateEmail(this.value);
      if (error) {
        showError('email', error);
      } else {
        hideError('email');
      }
    });
    
    contactForm.phone.addEventListener('input', function() {
      const error = validatePhone(this.value);
      if (error) {
        showError('phone', error);
      } else {
        hideError('phone');
      }
    });
    
    contactForm.message.addEventListener('input', function() {
      const error = validateMessage(this.value);
      if (error) {
        showError('message', error);
      } else {
        hideError('message');
      }
    });
    
    // Form submission validation
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      let isValid = true;
      const formData = {
        name: this.name.value,
        email: this.email.value,
        phone: this.phone.value,
        message: this.message.value
      };
      
      // Validate all fields
      const nameError = validateName(formData.name);
      const emailError = validateEmail(formData.email);
      const phoneError = validatePhone(formData.phone);
      const messageError = validateMessage(formData.message);
      
      // Show errors or success for each field
      if (nameError) {
        showError('name', nameError);
        isValid = false;
      } else {
        hideError('name');
      }
      
      if (emailError) {
        showError('email', emailError);
        isValid = false;
      } else {
        hideError('email');
      }
      
      if (phoneError) {
        showError('phone', phoneError);
        isValid = false;
      } else {
        hideError('phone');
      }
      
      if (messageError) {
        showError('message', messageError);
        isValid = false;
      } else {
        hideError('message');
      }
      
      // Handle form submission
      if (isValid) {
        // Clear any previous alerts
        const existingAlert = document.getElementById('formAlert');
        if (existingAlert) {
          existingAlert.remove();
        }
        
        // Create success message
        const successAlert = document.createElement('div');
        successAlert.id = 'formAlert';
        successAlert.className = 'alert alert-success mt-3';
        successAlert.innerHTML = `
          <i class="bi bi-check-circle"></i> 
          <strong>Thank you, ${formData.name.split(' ')[0]}!</strong> 
          Your message has been successfully validated and would be sent to our team.
          <br><small>This is a demo form - no actual email is sent.</small>
        `;
        
        // Insert after the submit button
        this.querySelector('button[type="submit"]').after(successAlert);
        
        // Reset form and clear validation classes
        this.reset();
        clearAllErrors();
        
        // Scroll to success message
        successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Remove any existing success message
        const existingAlert = document.getElementById('formAlert');
        if (existingAlert && existingAlert.classList.contains('alert-success')) {
          existingAlert.remove();
        }
        
        // Focus on first invalid field
        const firstInvalidField = this.querySelector('.is-invalid');
        if (firstInvalidField) {
          firstInvalidField.focus();
        }
      }
    });
    
    // Reset button functionality
    const resetButton = contactForm.querySelector('button[type="reset"]');
    if (resetButton) {
      resetButton.addEventListener('click', function() {
        setTimeout(() => {
          clearAllErrors();
          const alert = document.getElementById('formAlert');
          if (alert) alert.remove();
        }, 10);
      });
    }
  }
});


// --- Checkout page logic (Enhanced checkout form validation) ---
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('checkout.html')) {
    loadCartFromStorage();
    renderCheckoutCart();
    updateCheckoutTotal();
    
    const shippingSelect = document.getElementById('shipping-method');
    if (shippingSelect) shippingSelect.addEventListener('change', updateCheckoutTotal);

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      
      // Enhanced validation messages for checkout
      function showCheckoutError(fieldName, message) {
        const field = checkoutForm[fieldName];
        if (field) {
          let errorElement = field.parentNode.querySelector('.checkout-error');
          if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'checkout-error text-danger small mt-1';
            field.parentNode.appendChild(errorElement);
          }
          errorElement.textContent = message;
          errorElement.style.display = 'block';
          field.classList.add('is-invalid');
        }
      }
      
      function hideCheckoutError(fieldName) {
        const field = checkoutForm[fieldName];
        if (field) {
          const errorElement = field.parentNode.querySelector('.checkout-error');
          if (errorElement) {
            errorElement.style.display = 'none';
          }
          field.classList.remove('is-invalid');
        }
      }
      
      checkoutForm.onsubmit = function(e) {
        e.preventDefault();
        let valid = true;
        
        const validations = [
          { field: 'name', value: this.name.value.trim(), message: 'Please enter your full name' },
          { field: 'email', value: this.email.value.trim(), test: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' },
          { field: 'mobile', value: this.mobile.value.trim().replace(/\s/g,''), test: /^\+?\d{8,15}$/, message: 'Mobile number must be 8-15 digits' },
          { field: 'address', value: this.address.value.trim(), message: 'Please enter your full address' },
          { field: 'card', value: this.card.value.trim().replace(/\s/g,''), test: /^\d{16}$/, message: 'Card number must be 16 digits' },
          { field: 'expiry', value: this.expiry.value.trim(), test: /^\d{2}\/\d{2}$/, message: 'Expiry must be in MM/YY format' },
          { field: 'cvv', value: this.cvv.value.trim(), test: /^\d{3}$/, message: 'CVV must be 3 digits' },
          { field: 'cardname', value: this.cardname.value.trim(), message: 'Please enter the name on your card' }
        ];
        
        validations.forEach(validation => {
          if (!validation.value || (validation.test && !validation.test.test(validation.value))) {
            showCheckoutError(validation.field, validation.message);
            valid = false;
          } else {
            hideCheckoutError(validation.field);
          }
        });

        loadCartFromStorage();
        if (cart.length === 0) {
          document.getElementById('checkout-success').innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle"></i> Your cart is empty. Please add items before checkout.</div>`;
          return;
        }
        
        if (!valid) {
          document.getElementById('checkout-success').innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle"></i> Please correct the errors above before proceeding.</div>`;
          return;
        }
        
        document.getElementById('checkout-success').innerHTML = `
          <div class="alert alert-success">
            <i class="bi bi-check-circle"></i> 
            <strong>Payment Successful!</strong> Thank you for your order, ${this.name.value.split(' ')[0]}. 
            Your items will be shipped to the provided address.
          </div>
        `;
        
        localStorage.removeItem('cart');
        cart = [];
        renderCheckoutCart();
        updateCheckoutTotal();
        this.reset();
      };
    }
  }
});

// --- Render cart in checkout ---
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

  // --- Quantity change ---
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

  // --- Remove item ---
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

// --- Update total in checkout ---
function updateCheckoutTotal() {
  loadCartFromStorage();
  let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = document.getElementById('shipping-method');
  if (shipping && shipping.value === 'express') total += 15;
  document.getElementById('checkout-total').textContent = `Total: $${total.toFixed(2)}`;
}

// --- Products page search (Consolidated and more robust) ---
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
    })
    .catch(err => console.error('Error loading products JSON', err)); // Added error handling
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

// --- Show all products on products.html load ---
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('products.html')) {
    renderProducts('products');
    // If navigated with ?q=, prefill and filter
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      const input = document.getElementById('searchInputProducts');
      if (input) input.value = q;
      fetch('products-data.json')
        .then(res => res.json())
        .then(products => {
          const filtered = products.filter(p => p.name && p.name.toLowerCase().includes(q.toLowerCase()));
          document.getElementById('products').innerHTML = filtered.length
            ? filtered.map(renderProductCard).join('')
            : '<div class="col-12"><div class="alert alert-warning">No products found.</div></div>';
        });
    }
  }
});

// --- Highlight active filter button ---
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});
