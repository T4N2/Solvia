// Property-Based Tests for Testimonial Rendering and Carousel Navigation
// Feature: solvia-nova-portfolio

import { test, expect } from 'bun:test';
import * as fc from 'fast-check';

// Import JSDOM for DOM simulation
const { JSDOM } = await import('jsdom');

// Load the testimonials.js file content
const testimonialsCode = await Bun.file('public/js/testimonials.js').text();

// Create a DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="testimonial-carousel"></div></body></html>', {
  url: 'http://localhost',
  runScripts: 'outside-only'
});

global.document = dom.window.document;
global.window = dom.window as any;

// Mock fetch to prevent it from being called during module load
global.fetch = async () => {
  throw new Error('fetch should not be called in tests');
};

// Extract only the functions we need without executing the initialization code
const extractFunctions = `
  ${testimonialsCode.split('// Initialize testimonials when DOM is ready')[0]}
  return { 
    renderTestimonial, 
    escapeHtml,
    nextTestimonial,
    previousTestimonial,
    goToTestimonial,
    getCurrentIndex: () => currentIndex,
    getTestimonials: () => testimonials,
    setTestimonials: (data) => { testimonials = data; },
    setCurrentIndex: (index) => { currentIndex = index; }
  };
`;

const func = new Function('document', 'window', 'fetch', extractFunctions);
const { 
  renderTestimonial, 
  escapeHtml,
  nextTestimonial,
  previousTestimonial,
  goToTestimonial,
  getCurrentIndex,
  getTestimonials,
  setTestimonials,
  setCurrentIndex
} = func(global.document, global.window, global.fetch);

/**
 * Arbitrary generators for testimonial data
 */
const nonEmptyString = (minLength: number, maxLength: number) => 
  fc.string({ minLength, maxLength })
    .filter(s => s.trim().length > 0)
    .map(s => s.trim());

const urlString = fc.webUrl();

const testimonialArbitrary = fc.record({
  id: fc.stringMatching(/^[a-z0-9-]+$/).filter(s => s.length > 0),
  clientName: nonEmptyString(1, 100),
  company: nonEmptyString(1, 100),
  text: nonEmptyString(1, 1000),
  photo: fc.option(urlString),
  rating: fc.option(fc.integer({ min: 1, max: 5 })),
  position: fc.option(nonEmptyString(1, 100))
});

// Property 4: Testimonial rendering completeness
// Feature: solvia-nova-portfolio, Property 4: Testimonial rendering completeness
// Validates: Requirements 5.2
test('Property 4: Testimonial rendering completeness - for any testimonial, rendered HTML contains client name, company, and testimonial text', () => {
  fc.assert(
    fc.property(testimonialArbitrary, (testimonial) => {
      try {
        // Render the testimonial
        const html = renderTestimonial(testimonial);
        
        // Verify the HTML is a non-empty string
        expect(typeof html).toBe('string');
        expect(html.length).toBeGreaterThan(0);
        
        // Parse the HTML to check for required elements
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Check that the testimonial card container exists
        const cardElement = tempDiv.querySelector('.testimonial-card');
        expect(cardElement).toBeTruthy();
        expect(cardElement?.getAttribute('data-testimonial-id')).toBe(testimonial.id);
        
        // Check that the client name is present
        const nameElement = tempDiv.querySelector('.testimonial-name');
        expect(nameElement).toBeTruthy();
        expect(nameElement?.textContent).toBe(testimonial.clientName);
        
        // Check that the company is present
        const companyElement = tempDiv.querySelector('.testimonial-company');
        expect(companyElement).toBeTruthy();
        expect(companyElement?.textContent).toBe(testimonial.company);
        
        // Check that the testimonial text is present
        const textElement = tempDiv.querySelector('.testimonial-text');
        expect(textElement).toBeTruthy();
        expect(textElement?.textContent).toBe(testimonial.text);
        
        // Check photo or placeholder is present
        const photoElement = tempDiv.querySelector('.testimonial-photo');
        const placeholderElement = tempDiv.querySelector('.testimonial-photo-placeholder');
        
        if (testimonial.photo) {
          // If photo is provided, photo element should exist
          expect(photoElement).toBeTruthy();
          expect(photoElement?.getAttribute('src')).toBe(testimonial.photo);
          expect(photoElement?.getAttribute('alt')).toBe(testimonial.clientName);
        } else {
          // If no photo, placeholder should exist
          expect(placeholderElement).toBeTruthy();
          // Placeholder should contain first letter of client name
          expect(placeholderElement?.textContent).toBe(testimonial.clientName.charAt(0));
        }
        
        // Check optional position field
        if (testimonial.position) {
          const positionElement = tempDiv.querySelector('.testimonial-position');
          expect(positionElement).toBeTruthy();
          expect(positionElement?.textContent).toBe(testimonial.position);
        }
        
        // Check optional rating field
        if (testimonial.rating) {
          const ratingElement = tempDiv.querySelector('.testimonial-rating');
          expect(ratingElement).toBeTruthy();
          // Rating should contain filled stars (★) and empty stars (☆)
          const ratingText = ratingElement?.textContent || '';
          const filledStars = (ratingText.match(/★/g) || []).length;
          const emptyStars = (ratingText.match(/☆/g) || []).length;
          expect(filledStars).toBe(testimonial.rating);
          expect(emptyStars).toBe(5 - testimonial.rating);
        }
        
        return true;
      } catch (error) {
        console.error('Test failed for testimonial:', JSON.stringify(testimonial, null, 2));
        console.error('Error:', error);
        throw error;
      }
    }),
    { numRuns: 100, verbose: true } // Run 100 iterations as specified in the design document
  );
});

// Property 5: Testimonial carousel navigation
// Feature: solvia-nova-portfolio, Property 5: Testimonial carousel navigation
// Validates: Requirements 5.4
test('Property 5: Testimonial carousel navigation - for any carousel state, next/previous changes index with wrapping', () => {
  fc.assert(
    fc.property(
      fc.array(testimonialArbitrary, { minLength: 1, maxLength: 10 }),
      fc.integer({ min: 0, max: 9 }),
      (testimonials, startIndex) => {
        try {
          // Ensure startIndex is within bounds
          const validStartIndex = startIndex % testimonials.length;
          
          // Set up the carousel state
          setTestimonials(testimonials);
          setCurrentIndex(validStartIndex);
          
          // Test next() navigation
          const initialIndex = getCurrentIndex();
          expect(initialIndex).toBe(validStartIndex);
          
          nextTestimonial();
          const afterNext = getCurrentIndex();
          
          // After calling next, index should increment by 1 (with wrapping)
          const expectedAfterNext = (validStartIndex + 1) % testimonials.length;
          expect(afterNext).toBe(expectedAfterNext);
          
          // Reset to initial state
          setCurrentIndex(validStartIndex);
          
          // Test previous() navigation
          previousTestimonial();
          const afterPrevious = getCurrentIndex();
          
          // After calling previous, index should decrement by 1 (with wrapping)
          const expectedAfterPrevious = (validStartIndex - 1 + testimonials.length) % testimonials.length;
          expect(afterPrevious).toBe(expectedAfterPrevious);
          
          // Test wrapping at boundaries
          // Test next() at last index
          setCurrentIndex(testimonials.length - 1);
          nextTestimonial();
          expect(getCurrentIndex()).toBe(0); // Should wrap to 0
          
          // Test previous() at first index
          setCurrentIndex(0);
          previousTestimonial();
          expect(getCurrentIndex()).toBe(testimonials.length - 1); // Should wrap to last
          
          // Test goToTestimonial() with valid indices
          for (let i = 0; i < testimonials.length; i++) {
            goToTestimonial(i);
            expect(getCurrentIndex()).toBe(i);
          }
          
          // Test goToTestimonial() with invalid indices (should not change)
          setCurrentIndex(validStartIndex);
          goToTestimonial(-1); // Invalid negative index
          expect(getCurrentIndex()).toBe(validStartIndex); // Should remain unchanged
          
          goToTestimonial(testimonials.length); // Invalid out-of-bounds index
          expect(getCurrentIndex()).toBe(validStartIndex); // Should remain unchanged
          
          return true;
        } catch (error) {
          console.error('Test failed for testimonials:', JSON.stringify(testimonials, null, 2));
          console.error('Start index:', startIndex);
          console.error('Error:', error);
          throw error;
        }
      }
    ),
    { numRuns: 100, verbose: true } // Run 100 iterations as specified in the design document
  );
});
