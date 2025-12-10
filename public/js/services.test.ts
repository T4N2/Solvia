// Property-Based Tests for Service Package Rendering
// Feature: solvia-nova-portfolio, Property 1: Service package rendering completeness
// Validates: Requirements 3.2

import { test, expect } from 'bun:test';
import * as fc from 'fast-check';

// Import the rendering function
// Since we're testing browser code, we need to simulate the DOM environment
const { JSDOM } = await import('jsdom');

// Load the services.js file content
const servicesCode = await Bun.file('public/js/services.js').text();

// Create a DOM environment with a complete HTML structure
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="services-grid"></div></body></html>', {
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
// We'll manually extract the function definitions
const extractFunctions = `
  ${servicesCode.split('// Initialize service packages when DOM is ready')[0]}
  return { renderServicePackage, getServiceIcon, escapeHtml };
`;

const func = new Function('document', 'window', 'fetch', extractFunctions);
const { renderServicePackage, getServiceIcon, escapeHtml } = func(global.document, global.window, global.fetch);

/**
 * Arbitrary generator for service package data
 * Generates valid service packages with non-empty, non-whitespace content
 */
const nonEmptyString = (minLength: number, maxLength: number) => 
  fc.string({ minLength, maxLength })
    .filter(s => s.trim().length > 0)
    .map(s => s.trim());

const servicePackageArbitrary = fc.record({
  id: fc.stringMatching(/^[a-z0-9-]+$/).filter(s => s.length > 0),
  name: nonEmptyString(1, 100),
  description: nonEmptyString(1, 500),
  features: fc.array(nonEmptyString(1, 200), { minLength: 1, maxLength: 10 }),
  price: nonEmptyString(1, 100),
  popular: fc.boolean(),
  icon: fc.constantFrom('web', 'mobile', 'fullstack', 'design')
});

test('Property 1: Service package rendering completeness - for any service package, rendered HTML contains name, description, features, and price', () => {
  fc.assert(
    fc.property(servicePackageArbitrary, (service) => {
      try {
        // Render the service package
        const html = renderServicePackage(service);
        
        // Verify the HTML is a non-empty string
        expect(typeof html).toBe('string');
        expect(html.length).toBeGreaterThan(0);
        
        // Parse the HTML to check for required elements
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Check that the service name is present in the HTML
        const nameElement = tempDiv.querySelector('.service-name');
        expect(nameElement).toBeTruthy();
        expect(nameElement?.textContent).toBe(service.name);
        
        // Check that the service description is present
        const descriptionElement = tempDiv.querySelector('.service-description');
        expect(descriptionElement).toBeTruthy();
        expect(descriptionElement?.textContent).toBe(service.description);
        
        // Check that all features are present
        const featureElements = tempDiv.querySelectorAll('.service-features li');
        expect(featureElements.length).toBe(service.features.length);
        
        service.features.forEach((feature, index) => {
          expect(featureElements[index].textContent).toBe(feature);
        });
        
        // Check that the price is present
        const priceElement = tempDiv.querySelector('.service-price');
        expect(priceElement).toBeTruthy();
        expect(priceElement?.textContent).toBe(service.price);
        
        // Additional checks: verify the card has the correct data attribute
        const cardElement = tempDiv.querySelector('.service-card');
        expect(cardElement).toBeTruthy();
        expect(cardElement?.getAttribute('data-service-id')).toBe(service.id);
        
        // Verify the popular badge is present only when service.popular is true
        const badgeElement = tempDiv.querySelector('.service-badge');
        if (service.popular) {
          expect(badgeElement).toBeTruthy();
        } else {
          expect(badgeElement).toBeFalsy();
        }
        
        return true;
      } catch (error) {
        console.error('Test failed for service:', JSON.stringify(service, null, 2));
        console.error('Error:', error);
        throw error;
      }
    }),
    { numRuns: 100, verbose: true } // Run 100 iterations as specified in the design document
  );
});
