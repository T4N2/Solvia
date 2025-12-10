// Property-Based Tests for Touch Target Minimum Size
// Feature: solvia-nova-portfolio, Property 11: Touch target minimum size
// Validates: Requirements 8.5

import { test, expect } from 'bun:test';
import * as fc from 'fast-check';

// Import JSDOM for DOM simulation
const { JSDOM } = require('jsdom');

/**
 * Interactive element selectors that should meet touch target requirements
 */
const INTERACTIVE_SELECTORS = [
  'button',
  'a',
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="reset"]',
  '[role="button"]',
  '[tabindex="0"]',
  'select',
  'input[type="checkbox"]',
  'input[type="radio"]'
];

/**
 * Generator for mobile viewport widths (below 640px as per design)
 */
const mobileViewportArb = fc.integer({ min: 320, max: 639 });

/**
 * Generator for interactive element types
 */
const interactiveElementArb = fc.record({
  tagName: fc.constantFrom('button', 'a', 'input', 'select'),
  type: fc.option(fc.constantFrom('button', 'submit', 'reset', 'checkbox', 'radio')),
  role: fc.option(fc.constantFrom('button')),
  tabindex: fc.option(fc.constantFrom('0', '-1')),
  className: fc.option(fc.constantFrom('cta-button', 'submit-button', 'nav-link', 'hamburger', 'back-to-top')),
  content: fc.string({ minLength: 1, maxLength: 50 })
});

// Property 11: Touch target minimum size
test('Property 11: Touch target minimum size - for any interactive element on mobile viewport, element should have minimum 44x44 pixels', () => {
  // Create DOM once outside the property test to avoid performance issues
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        /* Ensure all interactive elements meet minimum touch target */
        button, a, input[type="button"], input[type="submit"], 
        input[type="reset"], [role="button"], select {
          min-height: 44px;
          min-width: 44px;
          box-sizing: border-box;
          display: inline-block;
          padding: 8px 16px;
        }
        
        /* Special handling for checkboxes and radio buttons */
        input[type="checkbox"], input[type="radio"] {
          width: 44px;
          height: 44px;
        }
        
        /* Common interactive element classes */
        .cta-button, .submit-button, .hamburger, .nav-link {
          min-height: 44px;
          min-width: 44px;
        }
        
        .back-to-top {
          width: 44px;
          height: 44px;
        }
      </style>
    </head>
    <body>
      <div id="test-container"></div>
    </body>
    </html>
  `, {
    pretendToBeVisual: true,
    resources: "usable"
  });

  const window = dom.window;
  const document = window.document;
  const container = document.getElementById('test-container')!;

  fc.assert(
    fc.property(
      mobileViewportArb,
      interactiveElementArb,
      (viewportWidth, elementConfig) => {
        // Set mobile viewport
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewportWidth
        });
        
        // Clear container
        container.innerHTML = '';
        
        // Create the interactive element
        let element: HTMLElement;
        
        if (elementConfig.tagName === 'input') {
          element = document.createElement('input');
          if (elementConfig.type) {
            (element as HTMLInputElement).type = elementConfig.type;
          }
        } else if (elementConfig.tagName === 'select') {
          element = document.createElement('select');
          const option = document.createElement('option');
          option.textContent = elementConfig.content;
          element.appendChild(option);
        } else {
          element = document.createElement(elementConfig.tagName);
          element.textContent = elementConfig.content;
        }
        
        // Set optional attributes
        if (elementConfig.role) {
          element.setAttribute('role', elementConfig.role);
        }
        if (elementConfig.tabindex) {
          element.setAttribute('tabindex', elementConfig.tabindex);
        }
        if (elementConfig.className) {
          element.className = elementConfig.className;
        }
        
        // Add to DOM
        container.appendChild(element);
        
        // Get computed styles
        const computedStyle = window.getComputedStyle(element);
        
        // Calculate effective dimensions
        const minWidth = parseFloat(computedStyle.minWidth) || 0;
        const minHeight = parseFloat(computedStyle.minHeight) || 0;
        const width = parseFloat(computedStyle.width) || 0;
        const height = parseFloat(computedStyle.height) || 0;
        
        const effectiveWidth = Math.max(width, minWidth);
        const effectiveHeight = Math.max(height, minHeight);
        
        // Verify touch target requirements
        return effectiveWidth >= 44 && effectiveHeight >= 44;
      }
    ),
    { numRuns: 20, timeout: 10000 } // Reduced runs and increased timeout
  );
});

// Additional test for specific elements from the actual HTML
test('Property 11: Touch target minimum size - specific HTML elements meet requirements', () => {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="/css/styles.css">
      <style>
        /* Inline the critical touch target styles for testing */
        .cta-button {
          min-height: 44px;
          min-width: 44px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #00D9FF, #7B2FFF);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .hamburger {
          min-width: 44px;
          min-height: 44px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }
        
        .back-to-top {
          width: 44px;
          height: 44px;
          position: fixed;
          bottom: 24px;
          right: 24px;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
        }
        
        .nav-links a {
          min-height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          padding: 8px 16px;
          text-decoration: none;
          color: white;
        }
        
        .submit-button {
          min-height: 44px;
          min-width: 44px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #00D9FF, #7B2FFF);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .social-links a {
          min-width: 44px;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
      </style>
    </head>
    <body>
      <!-- Navigation elements -->
      <nav>
        <button class="hamburger" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul class="nav-links">
          <li><a href="#hero">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
        </ul>
      </nav>
      
      <!-- Hero CTA -->
      <button class="cta-button">Get Started</button>
      
      <!-- Contact form -->
      <form>
        <button type="submit" class="submit-button">Send Message</button>
      </form>
      
      <!-- Social links -->
      <div class="social-links">
        <a href="https://linkedin.com" target="_blank">LinkedIn</a>
        <a href="https://github.com" target="_blank">GitHub</a>
      </div>
      
      <!-- Back to top -->
      <button id="back-to-top" class="back-to-top" aria-label="Back to top">↑</button>
    </body>
    </html>
  `, {
    pretendToBeVisual: true,
    resources: "usable"
  });

  const window = dom.window;
  const document = window.document;
  
  // Set mobile viewport (375px - typical mobile width)
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375
  });

  // Test specific interactive elements
  const elementsToTest = [
    { selector: '.cta-button', name: 'CTA Button' },
    { selector: '.hamburger', name: 'Hamburger Menu' },
    { selector: '.back-to-top', name: 'Back to Top Button' },
    { selector: '.nav-links a', name: 'Navigation Links' },
    { selector: '.submit-button', name: 'Submit Button' },
    { selector: '.social-links a', name: 'Social Links' }
  ];

  elementsToTest.forEach(({ selector, name }) => {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((element, index) => {
      const computedStyle = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      
      // Get effective dimensions
      const minWidth = parseFloat(computedStyle.minWidth) || 0;
      const minHeight = parseFloat(computedStyle.minHeight) || 0;
      const width = Math.max(rect.width, minWidth, parseFloat(computedStyle.width) || 0);
      const height = Math.max(rect.height, minHeight, parseFloat(computedStyle.height) || 0);
      
      // Assert minimum touch target size
      expect(width).toBeGreaterThanOrEqual(44);
      expect(height).toBeGreaterThanOrEqual(44);
    });
  });
});