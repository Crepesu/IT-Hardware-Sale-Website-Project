/**
 * Checkout Page Vue.js Application
 * 
 * Vue 3 Composition API implementation for the e-commerce checkout system
 * Uses template literals instead of .vue files for educational simplicity
 * 
 * Components:
 * - CheckoutForm: Complete checkout form with validation
 * - Main App: Shopping cart management and order processing
 * 
 * Features:
 * - Shopping cart display with quantity management
 * - Real-time form validation for shipping and payment details
 * - Dynamic shipping cost calculation
 * - Credit card input formatting and validation
 * - Order processing simulation with success feedback
 * - localStorage integration for cart persistence
 * 
 * Dependencies: Vue 3 (loaded via CDN)
 * Target Element: #app (checkout.html)
 * 
 * @version 1.0
 * @author IT Hardware Sale Website Project
 */

const { createApp, ref, reactive, computed, onMounted } = Vue;

/**
 * CheckoutForm Component
 * 
 * Comprehensive checkout form handling shipping, billing, and payment information
 * Includes real-time validation, input formatting, and order processing
 * 
 * Props:
 * - cartItems: Array of cart items to display
 * - cartTotal: Total cost of items in cart
 * - shippingCost: Current shipping cost based on selected method
 * 
 * Emits:
 * - order-placed: Triggered when order is successfully placed
 * - shipping-changed: Triggered when shipping method changes
 * 
 * Features:
 * - Multi-section form (contact, shipping, payment)
 * - Real-time validation with error feedback
 * - Credit card number formatting and validation
 * - Shipping method selection with cost calculation
 * - Order processing simulation with loading states
 */
const CheckoutForm = {
  props: {
    cartItems: Array,
    cartTotal: Number,
    shippingCost: Number
  },
  emits: ['order-placed', 'shipping-changed'],
  setup(props, { emit }) {
    // Form data
    const formData = reactive({
      // Contact & Shipping
      name: '',
      email: '',
      mobile: '',
      address: '',
      city: '',
      state: '',
      postcode: '',
      shippingMethod: 'standard',
      
      // Payment
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: ''
    });

    // Validation errors
    const errors = reactive({
      name: '',
      email: '',
      mobile: '',
      address: '',
      city: '',
      state: '',
      postcode: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardName: ''
    });

    // UI state
    const isProcessing = ref(false);
    const orderPlaced = ref(false);
    const orderNumber = ref('');

    // Shipping options
    const shippingOptions = ref([
      { value: 'standard', label: 'Standard Shipping', cost: 0, description: 'Free, 5-7 business days' },
      { value: 'express', label: 'Express Shipping', cost: 15, description: '$15.00, 2-3 business days' },
      { value: 'overnight', label: 'Overnight Shipping', cost: 35, description: '$35.00, Next business day' }
    ]);

    // Computed total
    const finalTotal = computed(() => {
      return props.cartTotal + props.shippingCost;
    });

    // Validation functions
    const validateName = () => {
      if (!formData.name.trim()) {
        errors.name = 'Full name is required';
        return false;
      }
      errors.name = '';
      return true;
    };

    const validateEmail = () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
        return false;
      }
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
        return false;
      }
      errors.email = '';
      return true;
    };

    const validateMobile = () => {
      const mobileRegex = /^[\d\s+\-()]{10,15}$/;
      if (!formData.mobile.trim()) {
        errors.mobile = 'Mobile number is required';
        return false;
      }
      if (!mobileRegex.test(formData.mobile)) {
        errors.mobile = 'Please enter a valid mobile number';
        return false;
      }
      errors.mobile = '';
      return true;
    };

    const validateAddress = () => {
      if (!formData.address.trim()) {
        errors.address = 'Address is required';
        return false;
      }
      errors.address = '';
      return true;
    };

    const validateCity = () => {
      if (!formData.city.trim()) {
        errors.city = 'City is required';
        return false;
      }
      errors.city = '';
      return true;
    };

    const validateState = () => {
      if (!formData.state.trim()) {
        errors.state = 'State is required';
        return false;
      }
      errors.state = '';
      return true;
    };

    const validatePostcode = () => {
      const postcodeRegex = /^\d{4}$/;
      if (!formData.postcode.trim()) {
        errors.postcode = 'Postcode is required';
        return false;
      }
      if (!postcodeRegex.test(formData.postcode)) {
        errors.postcode = 'Please enter a valid 4-digit postcode';
        return false;
      }
      errors.postcode = '';
      return true;
    };

    const validateCardNumber = () => {
      const cardRegex = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
      if (!formData.cardNumber.trim()) {
        errors.cardNumber = 'Card number is required';
        return false;
      }
      if (!cardRegex.test(formData.cardNumber)) {
        errors.cardNumber = 'Please enter a valid card number (1234 5678 9012 3456)';
        return false;
      }
      errors.cardNumber = '';
      return true;
    };

    const validateExpiryDate = () => {
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!formData.expiryDate.trim()) {
        errors.expiryDate = 'Expiry date is required';
        return false;
      }
      if (!expiryRegex.test(formData.expiryDate)) {
        errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
        return false;
      }
      errors.expiryDate = '';
      return true;
    };

    const validateCvv = () => {
      const cvvRegex = /^\d{3,4}$/;
      if (!formData.cvv.trim()) {
        errors.cvv = 'CVV is required';
        return false;
      }
      if (!cvvRegex.test(formData.cvv)) {
        errors.cvv = 'Please enter a valid CVV (3-4 digits)';
        return false;
      }
      errors.cvv = '';
      return true;
    };

    const validateCardName = () => {
      if (!formData.cardName.trim()) {
        errors.cardName = 'Name on card is required';
        return false;
      }
      errors.cardName = '';
      return true;
    };

    const validateForm = () => {
      const validations = [
        validateName(),
        validateEmail(),
        validateMobile(),
        validateAddress(),
        validateCity(),
        validateState(),
        validatePostcode(),
        validateCardNumber(),
        validateExpiryDate(),
        validateCvv(),
        validateCardName()
      ];
      return validations.every(Boolean);
    };

    // Shipping method change
    const changeShippingMethod = (method) => {
      formData.shippingMethod = method;
      const selectedOption = shippingOptions.value.find(opt => opt.value === method);
      emit('shipping-changed', selectedOption.cost);
    };

    // Format card number input
    const formatCardNumber = () => {
      let value = formData.cardNumber.replace(/\s/g, '').replace(/\D/g, '');
      value = value.substring(0, 16);
      value = value.replace(/(.{4})/g, '$1 ').trim();
      formData.cardNumber = value;
    };

    // Format expiry date input
    const formatExpiryDate = () => {
      let value = formData.expiryDate.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      formData.expiryDate = value;
    };

    // Handle form submission
    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      isProcessing.value = true;

      // Simulate payment processing
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate order number
        orderNumber.value = 'TO' + Date.now().toString().slice(-8);
        
        // Place order
        const orderData = {
          orderNumber: orderNumber.value,
          customerInfo: { ...formData },
          items: props.cartItems,
          subtotal: props.cartTotal,
          shipping: props.shippingCost,
          total: finalTotal.value,
          timestamp: new Date().toISOString()
        };
        
        emit('order-placed', orderData);
        orderPlaced.value = true;
        
        // Clear cart (this would typically be handled by the parent)
        if (typeof clearCart === 'function') {
          clearCart();
        }
        
      } catch (error) {
        console.error('Payment failed:', error);
      } finally {
        isProcessing.value = false;
      }
    };

    return {
      formData,
      errors,
      isProcessing,
      orderPlaced,
      orderNumber,
      shippingOptions,
      finalTotal,
      validateName,
      validateEmail,
      validateMobile,
      validateAddress,
      validateCity,
      validateState,
      validatePostcode,
      validateCardNumber,
      validateExpiryDate,
      validateCvv,
      validateCardName,
      changeShippingMethod,
      formatCardNumber,
      formatExpiryDate,
      handleSubmit
    };
  },
  template: `
    <div class="checkout-form">
      <!-- Order Success Message -->
      <div v-if="orderPlaced" class="success-message">
        <h4><i class="bi bi-check-circle me-2"></i>Order Placed Successfully!</h4>
        <p><strong>Order Number:</strong> {{ orderNumber }}</p>
        <p>Thank you {{ formData.name }}! Your order has been confirmed and will be shipped to:</p>
        <address>
          {{ formData.address }}<br>
          {{ formData.city }}, {{ formData.state }} {{ formData.postcode }}
        </address>
        <p>A confirmation email has been sent to {{ formData.email }}</p>
        <div class="mt-3">
          <a href="index.html" class="btn btn-neon me-2">Continue Shopping</a>
          <a href="products.html" class="btn btn-outline-neon">View Products</a>
        </div>
      </div>

      <!-- Checkout Form -->
      <form v-if="!orderPlaced" @submit.prevent="handleSubmit">
        <!-- Contact & Shipping Information -->
        <div class="form-section">
          <h5 class="mb-3"><i class="bi bi-person me-2"></i>Contact & Shipping Information</h5>
          
          <div class="row">
            <div class="col-12 mb-3">
              <label for="name" class="form-label">Full Name *</label>
              <input 
                type="text" 
                id="name"
                class="form-control"
                v-model="formData.name"
                @blur="validateName"
                :class="{ 'is-invalid': errors.name }"
                placeholder="John Doe"
              >
              <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
            </div>
            
            <div class="col-md-6 mb-3">
              <label for="email" class="form-label">Email Address *</label>
              <input 
                type="email" 
                id="email"
                class="form-control"
                v-model="formData.email"
                @blur="validateEmail"
                :class="{ 'is-invalid': errors.email }"
                placeholder="john@example.com"
              >
              <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
            </div>
            
            <div class="col-md-6 mb-3">
              <label for="mobile" class="form-label">Mobile Number *</label>
              <input 
                type="tel" 
                id="mobile"
                class="form-control"
                v-model="formData.mobile"
                @blur="validateMobile"
                :class="{ 'is-invalid': errors.mobile }"
                placeholder="+61 400 000 000"
              >
              <div v-if="errors.mobile" class="error-message">{{ errors.mobile }}</div>
            </div>
            
            <div class="col-12 mb-3">
              <label for="address" class="form-label">Street Address *</label>
              <input 
                type="text" 
                id="address"
                class="form-control"
                v-model="formData.address"
                @blur="validateAddress"
                :class="{ 'is-invalid': errors.address }"
                placeholder="123 Main Street"
              >
              <div v-if="errors.address" class="error-message">{{ errors.address }}</div>
            </div>
            
            <div class="col-md-4 mb-3">
              <label for="city" class="form-label">City *</label>
              <input 
                type="text" 
                id="city"
                class="form-control"
                v-model="formData.city"
                @blur="validateCity"
                :class="{ 'is-invalid': errors.city }"
                placeholder="Melbourne"
              >
              <div v-if="errors.city" class="error-message">{{ errors.city }}</div>
            </div>
            
            <div class="col-md-4 mb-3">
              <label for="state" class="form-label">State *</label>
              <select 
                id="state"
                class="form-select"
                v-model="formData.state"
                @change="validateState"
                :class="{ 'is-invalid': errors.state }"
              >
                <option value="">Select State</option>
                <option value="NSW">NSW</option>
                <option value="VIC">VIC</option>
                <option value="QLD">QLD</option>
                <option value="SA">SA</option>
                <option value="WA">WA</option>
                <option value="TAS">TAS</option>
                <option value="NT">NT</option>
                <option value="ACT">ACT</option>
              </select>
              <div v-if="errors.state" class="error-message">{{ errors.state }}</div>
            </div>
            
            <div class="col-md-4 mb-3">
              <label for="postcode" class="form-label">Postcode *</label>
              <input 
                type="text" 
                id="postcode"
                class="form-control"
                v-model="formData.postcode"
                @blur="validatePostcode"
                :class="{ 'is-invalid': errors.postcode }"
                placeholder="3000"
                maxlength="4"
              >
              <div v-if="errors.postcode" class="error-message">{{ errors.postcode }}</div>
            </div>
          </div>
        </div>

        <!-- Shipping Method -->
        <div class="form-section">
          <h5 class="mb-3"><i class="bi bi-truck me-2"></i>Shipping Method</h5>
          <div 
            v-for="option in shippingOptions" 
            :key="option.value"
            @click="changeShippingMethod(option.value)"
            class="shipping-option"
            :class="{ selected: formData.shippingMethod === option.value }"
          >
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <input 
                  type="radio" 
                  :id="option.value"
                  :value="option.value"
                  v-model="formData.shippingMethod"
                  class="form-check-input me-2"
                >
                <strong>{{ option.label }}</strong>
                <div class="text-muted small">{{ option.description }}</div>
              </div>
              <div class="text-end">
                <strong v-if="option.cost > 0">\${{ option.cost.toFixed(2) }}</strong>
                <strong v-else class="text-success">FREE</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Information -->
        <div class="form-section">
          <h5 class="mb-3"><i class="bi bi-credit-card me-2"></i>Payment Information</h5>
          
          <div class="payment-brands">
            <span class="payment-info-label">We Accept:</span>
            <div class="payment-brand visa">Visa</div>
            <div class="payment-brand mastercard">MC</div>
            <div class="payment-brand amex">Amex</div>
          </div>
          
          <div class="row mt-3">
            <div class="col-12 mb-3">
              <label for="cardNumber" class="form-label">Card Number *</label>
              <input 
                type="text" 
                id="cardNumber"
                class="form-control"
                v-model="formData.cardNumber"
                @input="formatCardNumber"
                @blur="validateCardNumber"
                :class="{ 'is-invalid': errors.cardNumber }"
                placeholder="1234 5678 9012 3456"
                maxlength="19"
              >
              <div v-if="errors.cardNumber" class="error-message">{{ errors.cardNumber }}</div>
            </div>
            
            <div class="col-md-6 mb-3">
              <label for="expiryDate" class="form-label">Expiry Date *</label>
              <input 
                type="text" 
                id="expiryDate"
                class="form-control"
                v-model="formData.expiryDate"
                @input="formatExpiryDate"
                @blur="validateExpiryDate"
                :class="{ 'is-invalid': errors.expiryDate }"
                placeholder="MM/YY"
                maxlength="5"
              >
              <div v-if="errors.expiryDate" class="error-message">{{ errors.expiryDate }}</div>
            </div>
            
            <div class="col-md-6 mb-3">
              <label for="cvv" class="form-label">CVV *</label>
              <input 
                type="text" 
                id="cvv"
                class="form-control"
                v-model="formData.cvv"
                @blur="validateCvv"
                :class="{ 'is-invalid': errors.cvv }"
                placeholder="123"
                maxlength="4"
              >
              <div v-if="errors.cvv" class="error-message">{{ errors.cvv }}</div>
            </div>
            
            <div class="col-12 mb-3">
              <label for="cardName" class="form-label">Name on Card *</label>
              <input 
                type="text" 
                id="cardName"
                class="form-control"
                v-model="formData.cardName"
                @blur="validateCardName"
                :class="{ 'is-invalid': errors.cardName }"
                placeholder="John Doe"
              >
              <div v-if="errors.cardName" class="error-message">{{ errors.cardName }}</div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="d-grid">
          <button 
            type="submit" 
            class="btn btn-neon btn-lg"
            :disabled="isProcessing"
          >
            <span v-if="isProcessing">
              <i class="bi bi-arrow-repeat spin me-2"></i>
              Processing Payment...
            </span>
            <span v-else>
              <i class="bi bi-lock me-2"></i>
              Complete Order - \${{ finalTotal.toFixed(2) }}
            </span>
          </button>
        </div>
      </form>
    </div>
  `
};

// Child Component: CartSummary
const CartSummary = {
  props: {
    cartItems: Array,
    cartTotal: Number,
    shippingCost: Number
  },
  emits: ['update-cart'],
  setup(props, { emit }) {
    const cartSubtotal = computed(() => {
      return props.cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    });

    const finalTotal = computed(() => {
      return cartSubtotal.value + props.shippingCost;
    });

    const updateQuantity = (itemName, newQuantity) => {
      if (newQuantity <= 0) {
        removeItem(itemName);
        return;
      }
      emit('update-cart', { action: 'update', itemName, quantity: newQuantity });
    };

    const increaseQuantity = (itemName) => {
      const item = props.cartItems.find(item => item.name === itemName);
      if (item) {
        updateQuantity(itemName, item.quantity + 1);
      }
    };

    const decreaseQuantity = (itemName) => {
      const item = props.cartItems.find(item => item.name === itemName);
      if (item && item.quantity > 1) {
        updateQuantity(itemName, item.quantity - 1);
      } else if (item && item.quantity === 1) {
        removeItem(itemName);
      }
    };

    const removeItem = (itemName) => {
      emit('update-cart', { action: 'remove', itemName });
    };

    return {
      cartSubtotal,
      finalTotal,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      removeItem
    };
  },
  template: `
    <div class="cart-summary">
      <h5 class="mb-3"><i class="bi bi-bag me-2"></i>Order Summary</h5>
      
      <!-- Empty Cart -->
      <div v-if="cartItems.length === 0" class="text-center py-4">
        <i class="bi bi-cart-x display-4 text-muted"></i>
        <p class="text-muted mt-2">Your cart is empty</p>
        <a href="products.html" class="btn btn-outline-neon">Browse Products</a>
      </div>
      
      <!-- Cart Items -->
      <div v-else>
        <div v-for="(item, index) in cartItems" :key="item.name || index" class="cart-item">
          <div class="flex-grow-1">
            <h6 class="mb-1">{{ item.name }}</h6>
            <small class="text-muted">\${{ item.price.toFixed(2) }} each</small>
            <div class="d-flex align-items-center mt-2">
              <label class="small text-muted me-2">Qty:</label>
              <button class="btn btn-outline-secondary btn-sm" @click="decreaseQuantity(item.name)" :disabled="item.quantity <= 1" style="padding: 0.2rem 0.5rem;">-</button>
              <span class="mx-2 fw-bold">{{ item.quantity }}</span>
              <button class="btn btn-outline-secondary btn-sm" @click="increaseQuantity(item.name)" style="padding: 0.2rem 0.5rem;">+</button>
              <button class="btn btn-outline-danger btn-sm ms-2" @click="removeItem(item.name)" style="padding: 0.2rem 0.5rem;" title="Remove item">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <div class="text-end">
            <strong>\${{ (item.price * item.quantity).toFixed(2) }}</strong>
          </div>
        </div>
        
        <!-- Order Totals -->
        <div class="order-summary">
          <div class="d-flex justify-content-between mb-2">
            <span>Subtotal:</span>
            <span>\${{ cartSubtotal.toFixed(2) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span>Shipping:</span>
            <span v-if="shippingCost > 0">\${{ shippingCost.toFixed(2) }}</span>
            <span v-else class="text-success">FREE</span>
          </div>
          <hr>
          <div class="d-flex justify-content-between">
            <strong>Total:</strong>
            <strong class="text-neon">\${{ finalTotal.toFixed(2) }}</strong>
          </div>
        </div>
        
        <div class="mt-3 text-center">
          <small class="text-muted">
            <i class="bi bi-shield-check me-1"></i>
            Secure 256-bit SSL encryption
          </small>
        </div>
      </div>
    </div>
  `
};

// Parent Component: App
const CheckoutApp = {
  components: {
    CheckoutForm,
    CartSummary
  },
  setup() {
    const cartItems = ref([]);
    const cartTotal = ref(0);
    const shippingCost = ref(0);
    const orderHistory = ref([]);

    // Load cart data from localStorage
    const loadCartData = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        cartItems.value = JSON.parse(savedCart);
        calculateCartTotal();
      }
    };

    // Calculate cart total
    const calculateCartTotal = () => {
      cartTotal.value = cartItems.value.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    };

    // Handle shipping method change
    const handleShippingChange = (cost) => {
      shippingCost.value = cost;
    };

    // Handle cart updates from CartSummary component
    const handleCartUpdate = ({ action, itemName, quantity }) => {
      if (action === 'update') {
        const item = cartItems.value.find(item => item.name === itemName);
        if (item) {
          item.quantity = quantity;
        }
      } else if (action === 'remove') {
        cartItems.value = cartItems.value.filter(item => item.name !== itemName);
      }
      
      // Update localStorage and recalculate total
      localStorage.setItem('cart', JSON.stringify(cartItems.value));
      calculateCartTotal();
    };

    // Handle order placement
    const handleOrderPlaced = (orderData) => {
      orderHistory.value.push(orderData);
      localStorage.setItem('orderHistory', JSON.stringify(orderHistory.value));
      
      // Clear cart
      cartItems.value = [];
      cartTotal.value = 0;
      localStorage.removeItem('cart');
    };

    // Load data on component mount
    onMounted(() => {
      loadCartData();
      
      // Load order history
      const savedOrders = localStorage.getItem('orderHistory');
      if (savedOrders) {
        orderHistory.value = JSON.parse(savedOrders);
      }
    });

    return {
      cartItems,
      cartTotal,
      shippingCost,
      orderHistory,
      handleShippingChange,
      handleOrderPlaced,
      handleCartUpdate
    };
  },
  template: `
    <main class="container py-5">
      <div class="checkout-container">
        <!-- Page Header -->
        <div class="page-header">
          <h1><i class="bi bi-shield-check me-3"></i>Secure Checkout</h1>
          <p>Complete your order safely and securely</p>
        </div>
        
        <div class="row g-4">
          <!-- Left Column: Checkout Form -->
          <div class="col-lg-8">
            <CheckoutForm 
              :cart-items="cartItems"
              :cart-total="cartTotal"
              :shipping-cost="shippingCost"
              @shipping-changed="handleShippingChange"
              @order-placed="handleOrderPlaced"
            />
          </div>
          
          <!-- Right Column: Cart Summary -->
          <div class="col-lg-4">
            <CartSummary 
              :cart-items="cartItems"
              :cart-total="cartTotal"
              :shipping-cost="shippingCost"
              @update-cart="handleCartUpdate"
            />
          </div>
        </div>
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="py-5 mt-5" style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); color: #495057; text-align: center; border-top: 1px solid rgba(0, 102, 204, 0.08); box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.03);">
      <div class="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
        <div class="fw-medium">&copy; 2024 TechOps — SIT120 Project</div>
        <div class="d-flex gap-4">
          <a href="index.html" style="color: #0066cc; text-decoration: none; font-weight: 500;">Home</a>
          <a href="products.html" style="color: #0066cc; text-decoration: none; font-weight: 500;">Products</a>
          <a href="contact.html" style="color: #0066cc; text-decoration: none; font-weight: 500;">Contact Us</a>
        </div>
      </div>
    </footer>
  `
};

// Initialize the Vue application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Mount the Vue application
  createApp(CheckoutApp).mount('#app');
});