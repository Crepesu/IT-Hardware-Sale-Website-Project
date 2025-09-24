// Contact Page Vue.js Application
// External Vue components for contact.html

const { createApp, ref, reactive } = Vue;

// Child Component: ContactForm
const ContactForm = {
  props: {
    initialData: {
      type: Object,
      required: true
    }
  },
  emits: ['form-submitted'],
  setup(props, { emit }) {
    // Form data with initial values from props
    const formData = reactive({
      name: props.initialData.name || '',
      email: '',
      phone: '',
      age: null,
      contactPreference: '',
      country: '',
      newsletter: false,
      message: ''
    });

    // Countries list for dynamic select options
    const countries = ref([
      'Australia', 'United States', 'United Kingdom', 'Canada', 
      'Germany', 'France', 'Japan', 'Singapore', 'New Zealand', 'Other'
    ]);

    // Contact preference options
    const contactPreferences = ref([
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'sms', label: 'SMS' }
    ]);

    // Validation errors
    const errors = reactive({
      name: '',
      email: '',
      phone: '',
      age: '',
      contactPreference: '',
      country: '',
      newsletter: '',
      message: ''
    });

    // UI state
    const showSuccess = ref(false);
    const showFormData = ref(false);
    const submittedData = ref(null);

    // Validation functions
    const validateName = () => {
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
        return false;
      }
      if (formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
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

    const validatePhone = () => {
      if (!formData.phone.trim()) {
        errors.phone = 'Phone number is required';
        return false;
      }
      const phoneRegex = /^[\d\s+\-()]{7,15}$/;
      if (!phoneRegex.test(formData.phone)) {
        errors.phone = 'Please enter a valid phone number';
        return false;
      }
      errors.phone = '';
      return true;
    };

    const validateAge = () => {
      if (!formData.age || formData.age <= 0) {
        errors.age = 'Please enter a valid age (positive number)';
        return false;
      }
      if (formData.age > 120) {
        errors.age = 'Please enter a realistic age';
        return false;
      }
      errors.age = '';
      return true;
    };

    const validateContactPreference = () => {
      if (!formData.contactPreference) {
        errors.contactPreference = 'Please select a contact preference';
        return false;
      }
      errors.contactPreference = '';
      return true;
    };

    const validateCountry = () => {
      if (!formData.country) {
        errors.country = 'Please select a country';
        return false;
      }
      errors.country = '';
      return true;
    };

    const validateNewsletter = () => {
      // Newsletter is now optional - no validation required
      errors.newsletter = '';
      return true;
    };

    const validateMessage = () => {
      if (!formData.message.trim()) {
        errors.message = 'Message is required';
        return false;
      }
      if (formData.message.trim().length < 10) {
        errors.message = 'Message must be at least 10 characters';
        return false;
      }
      errors.message = '';
      return true;
    };

    const validateForm = () => {
      const validations = [
        validateName(),
        validateEmail(),
        validatePhone(),
        validateAge(),
        validateContactPreference(),
        validateCountry(),
        validateMessage()
      ];
      return validations.every(Boolean);
    };

    const resetForm = () => {
      Object.assign(formData, {
        name: props.initialData.name || '',
        email: '',
        phone: '',
        age: null,
        contactPreference: '',
        country: '',
        newsletter: false,
        message: ''
      });
      
      // Clear all errors
      Object.keys(errors).forEach(key => {
        errors[key] = '';
      });
      
      showSuccess.value = false;
      showFormData.value = false;
      submittedData.value = null;
    };

    // Hide success message when user starts typing again
    const onFieldChange = () => {
      if (showSuccess.value) {
        showSuccess.value = false;
        showFormData.value = false;
      }
    };

    const handleSubmit = () => {
      if (validateForm()) {
        // Create a copy of form data for submission
        submittedData.value = { ...formData };
        
        // Show success message and form data
        showSuccess.value = true;
        showFormData.value = true;
        
        // Emit data to parent component
        emit('form-submitted', submittedData.value);
        
        // No automatic reset - message stays until manual reset
      }
    };

    return {
      formData,
      countries,
      contactPreferences,
      errors,
      showSuccess,
      showFormData,
      submittedData,
      validateName,
      validateEmail,
      validatePhone,
      validateAge,
      validateContactPreference,
      validateCountry,
      validateNewsletter,
      validateMessage,
      resetForm,
      onFieldChange,
      handleSubmit
    };
  },
  template: `
    <div class="form-container">
      <div class="text-center">
        <h2 class="contact-title">Contact Us</h2>
        <p class="contact-subtitle">Get in touch with our team - we'd love to hear from you!</p>
      </div>
      
      <!-- Success Message -->
      <div v-if="showSuccess" class="success-message">
        <i class="bi bi-check-circle me-2"></i>
        <strong>Thank you!</strong> Your message has been submitted successfully.
        <div class="mt-3">
          <button @click="resetForm" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-plus-circle me-1"></i> Submit Another Message
          </button>
        </div>
      </div>
      
      <!-- Form Data Display (simulating emit) -->
      <div v-if="showFormData && submittedData" class="form-data-display">
        <strong>Submitted Data (from ContactForm):</strong><br>
        Name: {{ submittedData.name }}<br>
        Email: {{ submittedData.email }}<br>
        Phone: {{ submittedData.phone }}<br>
        Age: {{ submittedData.age }}<br>
        Contact Preference: {{ submittedData.contactPreference }}<br>
        Country: {{ submittedData.country }}<br>
        Newsletter: {{ submittedData.newsletter ? 'Yes' : 'No' }}<br>
        Message: {{ submittedData.message }}
      </div>
      
      <form @submit.prevent="handleSubmit" v-show="!showSuccess">
        <!-- Name Field -->
        <div class="mb-4">
          <label for="name" class="form-label">
            <i class="bi bi-person me-1"></i>Full Name *
          </label>
          <input 
            type="text" 
            id="name"
            class="form-control"
            v-model="formData.name"
            @blur="validateName"
            @input="onFieldChange"
            :class="{ 'is-invalid': errors.name }"
            placeholder="Enter your full name"
          >
          <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
        </div>

        <!-- Email Field -->
        <div class="mb-4">
          <label for="email" class="form-label">
            <i class="bi bi-envelope me-1"></i>Email Address *
          </label>
          <input 
            type="email" 
            id="email"
            class="form-control"
            v-model="formData.email"
            @blur="validateEmail"
            :class="{ 'is-invalid': errors.email }"
            placeholder="your@email.com"
          >
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
        </div>

        <!-- Phone Field -->
        <div class="mb-4">
          <label for="phone" class="form-label">
            <i class="bi bi-telephone me-1"></i>Phone Number *
          </label>
          <input 
            type="tel" 
            id="phone"
            class="form-control"
            v-model="formData.phone"
            @blur="validatePhone"
            :class="{ 'is-invalid': errors.phone }"
            placeholder="+61 400 000 000"
          >
          <div v-if="errors.phone" class="error-message">{{ errors.phone }}</div>
        </div>

        <!-- Age Field (Numeric) -->
        <div class="mb-4">
          <label for="age" class="form-label">
            <i class="bi bi-calendar me-1"></i>Age *
          </label>
          <input 
            type="number" 
            id="age"
            class="form-control"
            v-model.number="formData.age"
            @blur="validateAge"
            :class="{ 'is-invalid': errors.age }"
            min="1"
            max="120"
            placeholder="25"
          >
          <div v-if="errors.age" class="error-message">{{ errors.age }}</div>
        </div>

        <!-- Contact Preference (Radio Buttons) -->
        <div class="mb-4">
          <label class="form-label">
            <i class="bi bi-chat-dots me-1"></i>Preferred Contact Method *
          </label>
          <div class="radio-group">
            <div 
              v-for="preference in contactPreferences" 
              :key="preference.value"
              class="radio-item"
            >
              <input 
                type="radio" 
                :id="preference.value"
                :value="preference.value"
                v-model="formData.contactPreference"
                @change="validateContactPreference"
                class="form-check-input"
              >
              <label :for="preference.value" class="form-check-label">
                {{ preference.label }}
              </label>
            </div>
          </div>
          <div v-if="errors.contactPreference" class="error-message">{{ errors.contactPreference }}</div>
        </div>

        <!-- Country (Dynamic Select) -->
        <div class="mb-4">
          <label for="country" class="form-label">
            <i class="bi bi-globe me-1"></i>Country *
          </label>
          <select 
            id="country"
            class="form-select"
            v-model="formData.country"
            @change="validateCountry"
            :class="{ 'is-invalid': errors.country }"
          >
            <option value="">Select your country</option>
            <option 
              v-for="country in countries" 
              :key="country" 
              :value="country"
            >
              {{ country }}
            </option>
          </select>
          <div v-if="errors.country" class="error-message">{{ errors.country }}</div>
        </div>

        <!-- Newsletter Checkbox -->
        <div class="mb-4">
          <div class="checkbox-item">
            <input 
              type="checkbox" 
              id="newsletter"
              v-model="formData.newsletter"
              @change="validateNewsletter"
              class="form-check-input"
            >
            <label for="newsletter" class="form-check-label">
              <i class="bi bi-newspaper me-1"></i>Subscribe to our newsletter for updates
            </label>
          </div>
          <div v-if="errors.newsletter" class="error-message">{{ errors.newsletter }}</div>
        </div>

        <!-- Message Field -->
        <div class="mb-4">
          <label for="message" class="form-label">
            <i class="bi bi-chat-text me-1"></i>Message *
          </label>
          <textarea 
            id="message"
            class="form-control"
            rows="5"
            v-model="formData.message"
            @blur="validateMessage"
            :class="{ 'is-invalid': errors.message }"
            placeholder="Tell us how we can help you..."
          ></textarea>
          <div v-if="errors.message" class="error-message">{{ errors.message }}</div>
        </div>

        <!-- Submit Button -->
        <div class="d-grid">
          <button type="submit" class="btn btn-primary">
            <i class="bi bi-send me-2"></i>Send Message
          </button>
        </div>
      </form>
    </div>
  `
};

// Parent Component: App
const ContactApp = {
  components: {
    ContactForm
  },
  setup() {
    // Initial data to pass via props
    const initialFormData = reactive({
      email: '',
      phone: '',
      age: null,
      country: '',
      contactPreference: '',
      newsletter: false,
      message: ''
    });

    // Data received from child component
    const submittedFormData = ref(null);
    const showAcknowledgement = ref(false);

    // Handle form submission from child
    const handleFormSubmission = (data) => {
      submittedFormData.value = data;
      showAcknowledgement.value = true;
      
      // Message stays visible until manual reset
    };

    // Manual reset function for parent acknowledgement
    const resetAcknowledgement = () => {
      showAcknowledgement.value = false;
      submittedFormData.value = null;
    };

    return {
      initialFormData,
      submittedFormData,
      showAcknowledgement,
      handleFormSubmission,
      resetAcknowledgement
    };
  },
  template: `
    <div>
      <!-- Navigation -->
      <nav class="navbar navbar-expand-lg navbar-light py-3 standard-navbar">
        <div class="container d-flex align-items-center">
          <!-- Toggler moved before brand for consistency across pages -->
          <button class="navbar-toggler me-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <a class="navbar-brand fw-bold navbar-brand-standard" href="index.html">TechOps</a>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item"><a class="nav-link nav-link-standard" href="index.html">Home</a></li>
              <li class="nav-item"><a class="nav-link nav-link-standard" href="products.html">Products</a></li>
              <li class="nav-item"><a class="nav-link nav-link-active" href="contact.html">Contact Us</a></li>
            </ul>
          </div>
          <!-- Always-visible actions -->
          <div class="d-flex align-items-center ms-auto flex-grow-1 flex-lg-grow-0 gap-2 flex-wrap navbar-actions">
            <button class="btn btn-gradient" type="button" onclick="showCart()">
              <i class="bi bi-cart"></i> Cart
            </button>
            <form id="searchFormContact" class="d-flex w-100" role="search" style="min-width:220px;">
              <input id="searchInputContact" class="form-control me-2 search-input-standard" type="search" placeholder="Search products…" aria-label="Search">
              <button class="btn btn-gradient" type="submit"><i class="bi bi-search"></i></button>
            </form>
          </div>
        </div>
      </nav>

      <!-- Cart Modal -->
      <div class="modal fade" id="cartModal" tabindex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content" style="background: linear-gradient(145deg, #ffffff, #f8f9fa); color: #333333; border: 1px solid rgba(0, 102, 204, 0.1); border-radius: 1rem; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);">
            <div class="modal-header" style="border-bottom: 1px solid rgba(0, 102, 204, 0.1);">
              <h5 class="modal-title" id="cartModalLabel" style="color: #0066cc; font-weight: 600;">Cart</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="cart-modal-body"></div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="contact-main">
        <div class="container">
          <!-- Contact Form Component -->
          <ContactForm 
            :initial-data="initialFormData"
            @form-submitted="handleFormSubmission"
          />

          <!-- Customer Acknowledgement Message (from Parent Component) -->
          <div v-if="showAcknowledgement && submittedFormData" class="acknowledgement">
            <h3><i class="bi bi-check-circle-fill me-2"></i>Thank You for Contacting Us!</h3>
            <p>Dear <strong>{{ submittedFormData.name }}</strong>,</p>
            <p>We have received your message and will get back to you soon. Here are the details we received:</p>
            
            <div class="row">
              <div class="col-md-6">
                <h5><i class="bi bi-person-fill me-2"></i>Contact Information:</h5>
                <ul class="list-unstyled">
                  <li><strong>Name:</strong> {{ submittedFormData.name }}</li>
                  <li><strong>Email:</strong> {{ submittedFormData.email }}</li>
                  <li><strong>Phone:</strong> {{ submittedFormData.phone }}</li>
                  <li><strong>Age:</strong> {{ submittedFormData.age }} years</li>
                  <li><strong>Country:</strong> {{ submittedFormData.country }}</li>
                </ul>
              </div>
              <div class="col-md-6">
                <h5><i class="bi bi-gear-fill me-2"></i>Preferences:</h5>
                <ul class="list-unstyled">
                  <li><strong>Preferred Contact:</strong> {{ submittedFormData.contactPreference }}</li>
                  <li><strong>Newsletter:</strong> {{ submittedFormData.newsletter ? 'Subscribed' : 'Not subscribed' }}</li>
                </ul>
              </div>
            </div>
            
            <h5><i class="bi bi-chat-quote-fill me-2"></i>Your Message:</h5>
            <p class="border p-3 bg-white rounded">{{ submittedFormData.message }}</p>
            
            <div class="alert alert-info">
              <i class="bi bi-info-circle-fill me-2"></i>
              We will contact you via <strong>{{ submittedFormData.contactPreference }}</strong> within 24 hours.
            </div>
            
            <div class="text-center mt-4">
              <button @click="resetAcknowledgement" class="btn btn-success">
                <i class="bi bi-check-circle me-2"></i>Got It! Close This Message
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="py-5 mt-5" style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); color: #495057; text-align: center; border-top: 1px solid rgba(0, 102, 204, 0.08); box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.03);">
        <div class="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div class="fw-medium">&copy; {{ new Date().getFullYear() }} TechOps — SIT120 Project</div>
          <div class="d-flex gap-4">
            <a href="index.html" style="color: #0066cc; text-decoration: none; font-weight: 500;">Home</a>
            <a href="products.html" style="color: #0066cc; text-decoration: none; font-weight: 500;">Products</a>
            <a href="contact.html" style="color: #0066cc; text-decoration: none; font-weight: 500;">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  `
};

// Initialize the Vue application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Mount the Vue application
  createApp(ContactApp).mount('#app');
});