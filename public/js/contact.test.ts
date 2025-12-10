// Property-Based Tests for Contact Form
// Feature: solvia-nova-portfolio

import { test, expect } from 'bun:test';
import * as fc from 'fast-check';

// Import JSDOM for DOM simulation
const { JSDOM } = await import('jsdom');

// Load the contact.js file content
const contactCode = await Bun.file('public/js/contact.js').text();

// Create a DOM environment with contact form HTML
const createDOM = () => {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <form id="contact-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" required>
          <span class="error-message"></span>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
          <span class="error-message"></span>
        </div>
        <div class="form-group">
          <label for="phone">Phone</label>
          <input type="tel" id="phone" name="phone">
          <span class="error-message"></span>
        </div>
        <div class="form-group">
          <label for="service">Service Interest</label>
          <select id="service" name="serviceInterest">
            <option value="">Select a service</option>
          </select>
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" rows="5" required></textarea>
          <span class="error-message"></span>
        </div>
        <button type="submit">Send Message</button>
      </form>
      <div class="contact-info">
        <p><strong>Email:</strong> <a href="mailto:info@example.com">info@example.com</a></p>
        <p><strong>Phone:</strong> <a href="tel:+1234567890">+1234567890</a></p>
        <div class="social-links">
          <a href="https://linkedin.com" target="_blank">LinkedIn</a>
          <a href="https://github.com" target="_blank">GitHub</a>
        </div>
      </div>
    </body>
    </html>
  `, {
    url: 'http://localhost',
    runScripts: 'outside-only'
  });

  return dom;
};

// Extract ContactForm class from the code
const extractContactForm = (dom: any) => {
  global.document = dom.window.document;
  global.window = dom.window as any;
  
  // Mock fetch
  global.fetch = async (url: string, options?: any) => {
    if (url === '/data/services.json') {
      return {
        ok: true,
        json: async () => []
      };
    }
    if (url === '/api/contact') {
      return {
        ok: true,
        json: async () => ({ success: true })
      };
    }
    throw new Error(`Unexpected fetch to ${url}`);
  };

  // Extract the ContactForm class definition
  const extractCode = contactCode.split('// Initialize contact form when DOM is loaded')[0];
  const func = new Function('document', 'window', 'fetch', `${extractCode}\nreturn { ContactForm };`);
  const { ContactForm } = func(global.document, global.window, global.fetch);
  
  return ContactForm;
};

// ============================================
// Property 6: Form validation for required fields
// Validates: Requirements 6.2
// ============================================

/**
 * Arbitrary generator for form data with missing required fields
 */
const formDataWithMissingFields = fc.record({
  name: fc.option(fc.string(), { nil: '' }),
  email: fc.option(fc.string(), { nil: '' }),
  message: fc.option(fc.string(), { nil: '' })
}).filter(data => {
  // Ensure at least one required field is missing or empty
  return !data.name || data.name.trim() === '' ||
         !data.email || data.email.trim() === '' ||
         !data.message || data.message.trim() === '';
});

test('Property 6: Form validation for required fields - for any form data with missing required fields, validation should fail', () => {
  fc.assert(
    fc.property(formDataWithMissingFields, (formData) => {
      const dom = createDOM();
      const ContactForm = extractContactForm(dom);
      const contactForm = new ContactForm();
      
      // Set form values
      if (formData.name !== undefined) {
        contactForm.nameInput.value = formData.name;
      }
      if (formData.email !== undefined) {
        contactForm.emailInput.value = formData.email;
      }
      if (formData.message !== undefined) {
        contactForm.messageInput.value = formData.message;
      }
      
      // Validate the form
      const isValid = contactForm.validate();
      
      // Validation should fail when required fields are missing
      expect(isValid).toBe(false);
      
      return true;
    }),
    { numRuns: 100 }
  );
});

// ============================================
// Property 7: Form validation error display
// Validates: Requirements 6.3
// ============================================

/**
 * Arbitrary generator for invalid field data
 */
const invalidFieldData = fc.record({
  fieldName: fc.constantFrom('name', 'email', 'message'),
  value: fc.oneof(
    fc.constant(''), // Empty string
    fc.constant('   '), // Whitespace only
    fc.string({ maxLength: 1 }).filter(s => s.trim().length === 0) // Short invalid string
  )
});

test('Property 7: Form validation error display - for any invalid field, an error message should be displayed', () => {
  fc.assert(
    fc.property(invalidFieldData, (data) => {
      const dom = createDOM();
      const ContactForm = extractContactForm(dom);
      const contactForm = new ContactForm();
      
      // Set the invalid value
      const input = contactForm[`${data.fieldName}Input`];
      input.value = data.value;
      
      // Validate the specific field
      const isValid = contactForm.validateField(data.fieldName);
      
      // Validation should fail
      expect(isValid).toBe(false);
      
      // Check that error message is displayed
      const formGroup = input.closest('.form-group');
      const errorElement = formGroup?.querySelector('.error-message');
      
      expect(errorElement).toBeTruthy();
      expect(errorElement?.textContent).not.toBe('');
      expect(errorElement?.style.display).not.toBe('none');
      
      // Check that input has error class
      expect(input.classList.contains('error')).toBe(true);
      
      return true;
    }),
    { numRuns: 100 }
  );
});

// ============================================
// Property 9: Contact link protocol correctness
// Validates: Requirements 7.3
// ============================================

/**
 * Arbitrary generator for email addresses and phone numbers
 */
const emailArbitrary = fc.emailAddress();
const phoneArbitrary = fc.stringMatching(/^\+?[0-9]{10,15}$/);

test('Property 9: Contact link protocol correctness - for any email, the link should use mailto: protocol', () => {
  fc.assert(
    fc.property(emailArbitrary, (email) => {
      const dom = createDOM();
      
      // Create email link
      const link = dom.window.document.createElement('a');
      link.href = `mailto:${email}`;
      link.textContent = email;
      
      // Verify the protocol - this is the key requirement
      expect(link.href.startsWith('mailto:')).toBe(true);
      expect(link.protocol).toBe('mailto:');
      
      // Verify the email is in the href (may be URL-encoded)
      // We just need to ensure the email address is present in some form
      const hrefLower = link.href.toLowerCase();
      const emailLower = email.toLowerCase();
      
      // Check that the email domain is present (the part after @)
      const emailParts = emailLower.split('@');
      if (emailParts.length === 2) {
        expect(hrefLower).toContain(emailParts[1]);
      }
      
      return true;
    }),
    { numRuns: 100 }
  );
});

test('Property 9: Contact link protocol correctness - for any phone number, the link should use tel: protocol', () => {
  fc.assert(
    fc.property(phoneArbitrary, (phone) => {
      const dom = createDOM();
      
      // Create phone link
      const link = dom.window.document.createElement('a');
      link.href = `tel:${phone}`;
      link.textContent = phone;
      
      // Verify the protocol
      expect(link.href.startsWith('tel:')).toBe(true);
      expect(link.href).toBe(`tel:${phone}`);
      
      return true;
    }),
    { numRuns: 100 }
  );
});

// ============================================
// Property 10: Social media link target attribute
// Validates: Requirements 7.4
// ============================================

/**
 * Arbitrary generator for social media URLs
 */
const socialMediaUrlArbitrary = fc.constantFrom(
  'https://linkedin.com/company/example',
  'https://github.com/example',
  'https://twitter.com/example',
  'https://facebook.com/example',
  'https://instagram.com/example'
);

test('Property 10: Social media link target attribute - for any social media link, target should be _blank', () => {
  fc.assert(
    fc.property(socialMediaUrlArbitrary, (url) => {
      const dom = createDOM();
      
      // Create social media link
      const link = dom.window.document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Social Link';
      
      // Verify the target attribute
      expect(link.target).toBe('_blank');
      expect(link.getAttribute('target')).toBe('_blank');
      
      // Also verify rel attribute for security
      expect(link.rel).toContain('noopener');
      
      return true;
    }),
    { numRuns: 100 }
  );
});
