import { describe, test, expect } from 'bun:test';
import * as fc from 'fast-check';
import {
  validateContactForm,
  handleContactSubmission,
  checkRateLimit,
  type ContactFormData,
} from './contact';

// Feature: solvia-nova-portfolio, Property 8: Valid form submission success
// Validates: Requirements 6.4
describe('Property 8: Valid form submission success', () => {
  test('for any valid contact form data, submission should succeed and return success response', async () => {
    // Generator for valid names (2+ characters)
    const validNameArb = fc.string({ minLength: 2, maxLength: 100 }).filter(s => s.trim().length >= 2);
    
    // Generator for valid emails
    const validEmailArb = fc.emailAddress();
    
    // Generator for valid messages (10+ characters)
    const validMessageArb = fc.string({ minLength: 10, maxLength: 1000 }).filter(s => s.trim().length >= 10);
    
    // Generator for optional phone numbers
    const optionalPhoneArb = fc.option(fc.string({ minLength: 5, maxLength: 20 }), { nil: undefined });
    
    // Generator for optional service interest
    const optionalServiceArb = fc.option(
      fc.constantFrom('web-development', 'mobile-app', 'ui-ux-design', 'consulting'),
      { nil: undefined }
    );
    
    // Generator for valid contact form data
    const validContactFormArb = fc.record({
      name: validNameArb,
      email: validEmailArb,
      phone: optionalPhoneArb,
      message: validMessageArb,
      serviceInterest: optionalServiceArb,
    });

    await fc.assert(
      fc.asyncProperty(validContactFormArb, async (formData) => {
        // Generate unique IP for each test to avoid rate limiting
        const testIp = `test-${Math.random()}-${Date.now()}`;
        
        try {
          const response = await handleContactSubmission(formData, testIp);
          
          // Property: Valid form data should always result in success
          expect(response.success).toBe(true);
          expect(response.message).toBeTruthy();
          expect(typeof response.message).toBe('string');
        } catch (error) {
          // If an error occurs with valid data, the test should fail
          throw new Error(`Valid form data should not throw error: ${error}`);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Contact form validation', () => {
  test('validates required fields correctly', () => {
    const invalidData = { name: '', email: '', message: '' };
    const result = validateContactForm(invalidData);
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('validates email format', () => {
    const invalidEmail = { name: 'John Doe', email: 'invalid-email', message: 'Test message here' };
    const result = validateContactForm(invalidEmail);
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'email')).toBe(true);
  });

  test('accepts valid form data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'This is a valid message with enough characters',
    };
    const result = validateContactForm(validData);
    
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});

describe('Rate limiting', () => {
  test('allows requests within limit', () => {
    const testIp = `test-${Date.now()}`;
    
    const result1 = checkRateLimit(testIp);
    expect(result1.allowed).toBe(true);
    
    const result2 = checkRateLimit(testIp);
    expect(result2.allowed).toBe(true);
    
    const result3 = checkRateLimit(testIp);
    expect(result3.allowed).toBe(true);
  });

  test('blocks requests exceeding limit', () => {
    const testIp = `test-${Date.now()}-block`;
    
    // Make 3 requests (at the limit)
    checkRateLimit(testIp);
    checkRateLimit(testIp);
    checkRateLimit(testIp);
    
    // 4th request should be blocked
    const result = checkRateLimit(testIp);
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeDefined();
  });
});
