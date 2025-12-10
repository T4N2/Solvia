// Contact form functionality

class ContactForm {
  constructor() {
    this.form = document.getElementById('contact-form');
    this.nameInput = document.getElementById('name');
    this.emailInput = document.getElementById('email');
    this.phoneInput = document.getElementById('phone');
    this.serviceSelect = document.getElementById('service');
    this.messageInput = document.getElementById('message');
    this.submitButton = this.form?.querySelector('button[type="submit"]');
    
    this.validationRules = {
      name: {
        required: true,
        minLength: 2
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      message: {
        required: true,
        minLength: 10
      }
    };
  }

  init() {
    if (!this.form) {
      console.error('Contact form not found');
      return;
    }

    // Load service options
    this.loadServiceOptions();

    // Add form submit event listener
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Add real-time validation
    this.nameInput?.addEventListener('blur', () => this.validateField('name'));
    this.emailInput?.addEventListener('blur', () => this.validateField('email'));
    this.messageInput?.addEventListener('blur', () => this.validateField('message'));

    // Clear errors on input
    this.nameInput?.addEventListener('input', () => this.clearFieldError('name'));
    this.emailInput?.addEventListener('input', () => this.clearFieldError('email'));
    this.messageInput?.addEventListener('input', () => this.clearFieldError('message'));

    console.log('Contact form initialized');
  }

  async loadServiceOptions() {
    try {
      const response = await fetch('/data/services.json');
      const services = await response.json();
      
      if (this.serviceSelect && services && services.length > 0) {
        services.forEach(service => {
          const option = document.createElement('option');
          option.value = service.id;
          option.textContent = service.name;
          this.serviceSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error loading service options:', error);
    }
  }

  validateField(fieldName) {
    const input = this[`${fieldName}Input`];
    const rules = this.validationRules[fieldName];
    
    if (!input || !rules) return true;

    const value = input.value.trim();

    // Check required
    if (rules.required && !value) {
      this.showError(fieldName, `${this.getFieldLabel(fieldName)} is required`);
      return false;
    }

    // Check pattern (for email)
    if (rules.pattern && value && !rules.pattern.test(value)) {
      this.showError(fieldName, `Please enter a valid ${fieldName}`);
      return false;
    }

    // Check min length
    if (rules.minLength && value && value.length < rules.minLength) {
      this.showError(fieldName, `${this.getFieldLabel(fieldName)} must be at least ${rules.minLength} characters`);
      return false;
    }

    this.clearFieldError(fieldName);
    return true;
  }

  validate() {
    let isValid = true;

    // Validate all required fields
    for (const fieldName in this.validationRules) {
      if (!this.validateField(fieldName)) {
        isValid = false;
      }
    }

    return isValid;
  }

  showError(fieldName, message) {
    const input = this[`${fieldName}Input`];
    if (!input) return;

    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }

    input.classList.add('error');
  }

  clearFieldError(fieldName) {
    const input = this[`${fieldName}Input`];
    if (!input) return;

    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }

    input.classList.remove('error');
  }

  clearErrors() {
    const errorElements = this.form.querySelectorAll('.error-message');
    errorElements.forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });

    const errorInputs = this.form.querySelectorAll('.error');
    errorInputs.forEach(input => input.classList.remove('error'));
  }

  getFieldLabel(fieldName) {
    const labels = {
      name: 'Name',
      email: 'Email',
      message: 'Message'
    };
    return labels[fieldName] || fieldName;
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Clear previous errors
    this.clearErrors();

    // Validate form
    if (!this.validate()) {
      return;
    }

    // Get form data
    const formData = {
      name: this.nameInput.value.trim(),
      email: this.emailInput.value.trim(),
      phone: this.phoneInput?.value.trim() || '',
      serviceInterest: this.serviceSelect?.value || '',
      message: this.messageInput.value.trim()
    };

    // Show loading state
    this.setLoadingState(true);

    try {
      // Submit form data
      await this.submit(formData);
      
      // Show success message
      this.showSuccess();
      
      // Reset form
      this.form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      this.showError('message', 'Failed to send message. Please try again later.');
    } finally {
      this.setLoadingState(false);
    }
  }

  async submit(formData) {
    // Simulate API call (replace with actual endpoint when available)
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error('Failed to submit form');
    }

    return await response.json();
  }

  setLoadingState(isLoading) {
    if (!this.submitButton) return;

    if (isLoading) {
      this.submitButton.disabled = true;
      this.submitButton.textContent = 'Sending...';
      this.submitButton.classList.add('loading');
    } else {
      this.submitButton.disabled = false;
      this.submitButton.textContent = 'Send Message';
      this.submitButton.classList.remove('loading');
    }
  }

  showSuccess() {
    // Create success message element
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Thank you! Your message has been sent successfully.';
    
    // Insert after form
    this.form.parentNode.insertBefore(successMessage, this.form.nextSibling);

    // Remove after 5 seconds
    setTimeout(() => {
      successMessage.remove();
    }, 5000);
  }
}

// Initialize contact form when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const contactForm = new ContactForm();
    contactForm.init();
  });
} else {
  const contactForm = new ContactForm();
  contactForm.init();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ContactForm };
}
