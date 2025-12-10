// Property-Based Tests for Portfolio Item Rendering and Filtering
// Feature: solvia-nova-portfolio

import { test, expect } from 'bun:test';
import * as fc from 'fast-check';

// Import JSDOM for DOM simulation
const { JSDOM } = await import('jsdom');

// Load the portfolio.js file content
const portfolioCode = await Bun.file('public/js/portfolio.js').text();

// Create a DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="portfolio-grid"></div><div class="portfolio-filters"></div></body></html>', {
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
  ${portfolioCode.split('// Initialize portfolio when DOM is ready')[0]}
  return { renderPortfolioItem, filterPortfolioItems, escapeHtml };
`;

const func = new Function('document', 'window', 'fetch', extractFunctions);
const { renderPortfolioItem, filterPortfolioItems, escapeHtml } = func(global.document, global.window, global.fetch);

/**
 * Arbitrary generators for portfolio item data
 */
const nonEmptyString = (minLength: number, maxLength: number) => 
  fc.string({ minLength, maxLength })
    .filter(s => s.trim().length > 0)
    .map(s => s.trim());

const urlString = fc.webUrl();

const portfolioItemArbitrary = fc.record({
  id: fc.stringMatching(/^[a-z0-9-]+$/).filter(s => s.length > 0),
  title: nonEmptyString(1, 100),
  description: nonEmptyString(1, 500),
  thumbnail: urlString,
  technologies: fc.array(nonEmptyString(1, 50), { minLength: 1, maxLength: 10 }),
  category: fc.constantFrom('web', 'mobile', 'desktop', 'api'),
  detailedDescription: fc.option(nonEmptyString(1, 1000)),
  images: fc.option(fc.array(urlString, { minLength: 0, maxLength: 5 })),
  clientName: fc.option(nonEmptyString(1, 100)),
  projectUrl: fc.option(urlString),
  completedDate: fc.option(
    fc.integer({ min: 2000, max: 2030 }).chain(year =>
      fc.integer({ min: 1, max: 12 }).chain(month =>
        fc.integer({ min: 1, max: 28 }).map(day =>
          `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        )
      )
    )
  )
});

// Property 2: Portfolio item rendering completeness
// Validates: Requirements 4.2
test('Property 2: Portfolio item rendering completeness - for any portfolio item, rendered HTML contains thumbnail, title, description, and technologies', () => {
  fc.assert(
    fc.property(portfolioItemArbitrary, (item) => {
      try {
        // Render the portfolio item
        const html = renderPortfolioItem(item);
        
        // Verify the HTML is a non-empty string
        expect(typeof html).toBe('string');
        expect(html.length).toBeGreaterThan(0);
        
        // Parse the HTML to check for required elements
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Check that the portfolio item container exists
        const itemElement = tempDiv.querySelector('.portfolio-item');
        expect(itemElement).toBeTruthy();
        expect(itemElement?.getAttribute('data-portfolio-id')).toBe(item.id);
        expect(itemElement?.getAttribute('data-category')).toBe(item.category);
        
        // Check that the thumbnail image is present
        const imageElement = tempDiv.querySelector('.portfolio-image img');
        expect(imageElement).toBeTruthy();
        expect(imageElement?.getAttribute('src')).toBe(item.thumbnail);
        // The alt attribute will be HTML-escaped, so we need to decode it for comparison
        const altText = imageElement?.getAttribute('alt') || '';
        const decodedAlt = tempDiv.ownerDocument.createElement('textarea');
        decodedAlt.innerHTML = altText;
        expect(decodedAlt.value).toBe(item.title);
        
        // Check that the title is present
        const titleElement = tempDiv.querySelector('.portfolio-title');
        expect(titleElement).toBeTruthy();
        // textContent automatically decodes HTML entities
        expect(titleElement?.textContent).toBe(item.title);
        
        // Check that the description is present
        const descriptionElement = tempDiv.querySelector('.portfolio-description');
        expect(descriptionElement).toBeTruthy();
        // textContent automatically decodes HTML entities
        expect(descriptionElement?.textContent).toBe(item.description);
        
        // Check that all technologies are present
        const techElements = tempDiv.querySelectorAll('.portfolio-tech');
        expect(techElements.length).toBe(item.technologies.length);
        
        item.technologies.forEach((tech, index) => {
          expect(techElements[index].textContent).toBe(tech);
        });
        
        // Verify the view button exists
        const viewButton = tempDiv.querySelector('.portfolio-view-btn');
        expect(viewButton).toBeTruthy();
        expect(viewButton?.getAttribute('data-portfolio-id')).toBe(item.id);
        
        return true;
      } catch (error) {
        console.error('Test failed for portfolio item:', JSON.stringify(item, null, 2));
        console.error('Error:', error);
        throw error;
      }
    }),
    { numRuns: 100, verbose: true } // Run 100 iterations as specified in the design document
  );
});

// Property 3: Portfolio filtering correctness
// Validates: Requirements 4.4
test('Property 3: Portfolio filtering correctness - for any set of portfolio items and filter criteria, filtered results only include matching items', () => {
  fc.assert(
    fc.property(
      fc.array(portfolioItemArbitrary, { minLength: 1, maxLength: 20 }),
      fc.oneof(
        fc.constant('all'),
        fc.constantFrom('web', 'mobile', 'desktop', 'api'),
        fc.oneof(
          ...['React', 'Node.js', 'Python', 'TypeScript', 'MongoDB', 'PostgreSQL'].map(fc.constant)
        )
      ),
      (items, filterValue) => {
        try {
          // Apply the filter
          const filteredItems = filterPortfolioItems(items, filterValue);
          
          // Verify the result is an array
          expect(Array.isArray(filteredItems)).toBe(true);
          
          // If filter is 'all', all items should be returned
          if (filterValue === 'all') {
            expect(filteredItems.length).toBe(items.length);
            expect(filteredItems).toEqual(items);
            return true;
          }
          
          // Verify all filtered items match the filter criteria
          filteredItems.forEach(item => {
            // Check if the filter matches the category
            const matchesCategory = item.category === filterValue;
            
            // Check if the filter matches any technology (case-insensitive)
            const matchesTechnology = item.technologies.some(tech => 
              tech.toLowerCase() === filterValue.toLowerCase()
            );
            
            // At least one condition must be true
            expect(matchesCategory || matchesTechnology).toBe(true);
          });
          
          // Verify no items were incorrectly excluded
          // For each item in the original list, if it matches the filter, it should be in the filtered list
          items.forEach(item => {
            const matchesCategory = item.category === filterValue;
            const matchesTechnology = item.technologies.some(tech => 
              tech.toLowerCase() === filterValue.toLowerCase()
            );
            
            if (matchesCategory || matchesTechnology) {
              expect(filteredItems).toContain(item);
            }
          });
          
          // Verify the filtered list length is correct
          const expectedCount = items.filter(item => {
            const matchesCategory = item.category === filterValue;
            const matchesTechnology = item.technologies.some(tech => 
              tech.toLowerCase() === filterValue.toLowerCase()
            );
            return matchesCategory || matchesTechnology;
          }).length;
          
          expect(filteredItems.length).toBe(expectedCount);
          
          return true;
        } catch (error) {
          console.error('Test failed for filter:', filterValue);
          console.error('Items:', JSON.stringify(items, null, 2));
          console.error('Error:', error);
          throw error;
        }
      }
    ),
    { numRuns: 100, verbose: true } // Run 100 iterations as specified in the design document
  );
});
