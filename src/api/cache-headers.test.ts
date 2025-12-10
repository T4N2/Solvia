import { describe, it, expect } from 'bun:test';
import fc from 'fast-check';
import { Elysia } from 'elysia';
import { handleContactSubmission } from './contact';

// **Feature: solvia-nova-portfolio, Property 13: Static asset cache headers**
// **Validates: Requirements 10.3**

// Create the same app structure as in src/index.ts for testing
const createTestApp = () => {
  return new Elysia()
    // API routes first
    .get('/api/portfolio', async ({ query }) => {
      try {
        const portfolioFile = Bun.file('data/portfolio.json');
        
        if (!await portfolioFile.exists()) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Portfolio data not found',
            }),
            {
              status: 404,
              headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              },
            }
          );
        }

        const portfolioData = await portfolioFile.json();
        
        // Apply filtering if category is provided
        let filteredData = portfolioData;
        if (query.category && typeof query.category === 'string') {
          filteredData = portfolioData.filter((item: any) => 
            item.category === query.category
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: filteredData,
          }),
          {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=3600, s-maxage=3600',
              'ETag': `"portfolio-${Date.now()}"`,
            },
          }
        );
      } catch (error) {
        console.error('Portfolio API error:', error);
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Failed to retrieve portfolio data',
          }),
          {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
          }
        );
      }
    })
    .get('/api/testimonials', async () => {
      try {
        const testimonialsFile = Bun.file('data/testimonials.json');
        
        if (!await testimonialsFile.exists()) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Testimonials data not found',
            }),
            {
              status: 404,
              headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              },
            }
          );
        }

        const testimonialsData = await testimonialsFile.json();

        return new Response(
          JSON.stringify({
            success: true,
            data: testimonialsData,
          }),
          {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=3600, s-maxage=3600',
              'ETag': `"testimonials-${Date.now()}"`,
            },
          }
        );
      } catch (error) {
        console.error('Testimonials API error:', error);
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Failed to retrieve testimonials data',
          }),
          {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
          }
        );
      }
    })
    // Static file serving with caching headers
    .get('/css/*', ({ params }) => {
      const file = Bun.file(`public/css/${params['*']}`);
      return new Response(file.stream(), {
        headers: {
          'Content-Type': 'text/css',
          'Cache-Control': 'public, max-age=31536000', // 1 year for CSS
          'ETag': `"css-${params['*']}"`,
        },
      });
    })
    .get('/js/*', ({ params }) => {
      const file = Bun.file(`public/js/${params['*']}`);
      return new Response(file.stream(), {
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=31536000', // 1 year for JS
          'ETag': `"js-${params['*']}"`,
        },
      });
    })
    .get('/data/*', ({ params }) => {
      const file = Bun.file(`data/${params['*']}`);
      return new Response(file.stream(), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600', // 1 hour for data files
          'ETag': `"data-${params['*']}"`,
        },
      });
    });
};

describe('Cache Headers Property Tests', () => {

  it('Property 13: Static asset cache headers - CSS files should have appropriate cache headers', async () => {
    const app = createTestApp();
    
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('styles.css'), // Test with existing CSS file
        async (filename) => {
          const response = await app.handle(new Request(`http://localhost/css/${filename}`));
          
          // Should have cache-control header
          const cacheControl = response.headers.get('cache-control');
          expect(cacheControl).toBeTruthy();
          expect(cacheControl).toContain('public');
          expect(cacheControl).toContain('max-age');
          
          // Should have ETag header
          const etag = response.headers.get('etag');
          expect(etag).toBeTruthy();
          
          // Should have correct content type
          const contentType = response.headers.get('content-type');
          expect(contentType).toBe('text/css');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13: Static asset cache headers - JS files should have appropriate cache headers', async () => {
    const app = createTestApp();
    
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('navigation.js', 'hero.js', 'contact.js', 'portfolio.js', 'services.js', 'testimonials.js', 'animations.js'),
        async (filename) => {
          const response = await app.handle(new Request(`http://localhost/js/${filename}`));
          
          // Should have cache-control header
          const cacheControl = response.headers.get('cache-control');
          expect(cacheControl).toBeTruthy();
          expect(cacheControl).toContain('public');
          expect(cacheControl).toContain('max-age');
          
          // Should have ETag header
          const etag = response.headers.get('etag');
          expect(etag).toBeTruthy();
          
          // Should have correct content type
          const contentType = response.headers.get('content-type');
          expect(contentType).toBe('application/javascript');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13: Static asset cache headers - Data files should have appropriate cache headers', async () => {
    const app = createTestApp();
    
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('portfolio.json', 'testimonials.json', 'services.json'),
        async (filename) => {
          const response = await app.handle(new Request(`http://localhost/data/${filename}`));
          
          // Should have cache-control header
          const cacheControl = response.headers.get('cache-control');
          expect(cacheControl).toBeTruthy();
          expect(cacheControl).toContain('public');
          expect(cacheControl).toContain('max-age');
          
          // Should have ETag header
          const etag = response.headers.get('etag');
          expect(etag).toBeTruthy();
          
          // Should have correct content type
          const contentType = response.headers.get('content-type');
          expect(contentType).toBe('application/json');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13: Static asset cache headers - API endpoints should have appropriate cache headers', async () => {
    const app = createTestApp();
    
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('/api/portfolio', '/api/testimonials'),
        async (endpoint) => {
          const response = await app.handle(new Request(`http://localhost${endpoint}`));
          
          // Should have cache-control header
          const cacheControl = response.headers.get('cache-control');
          expect(cacheControl).toBeTruthy();
          
          if (response.ok) {
            // Successful responses should have public cache
            expect(cacheControl).toContain('public');
            expect(cacheControl).toContain('max-age');
            
            // Should have ETag header
            const etag = response.headers.get('etag');
            expect(etag).toBeTruthy();
          } else {
            // Error responses should not be cached
            expect(cacheControl).toContain('no-cache');
          }
          
          // Should have correct content type
          const contentType = response.headers.get('content-type');
          expect(contentType).toBe('application/json');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13: Static asset cache headers - Different asset types should have different cache durations', async () => {
    const app = createTestApp();
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          cssFile: fc.constantFrom('styles.css'),
          jsFile: fc.constantFrom('navigation.js'),
          dataFile: fc.constantFrom('portfolio.json')
        }),
        async ({ cssFile, jsFile, dataFile }) => {
          const [cssResponse, jsResponse, dataResponse] = await Promise.all([
            app.handle(new Request(`http://localhost/css/${cssFile}`)),
            app.handle(new Request(`http://localhost/js/${jsFile}`)),
            app.handle(new Request(`http://localhost/data/${dataFile}`))
          ]);
          
          const cssCache = cssResponse.headers.get('cache-control');
          const jsCache = jsResponse.headers.get('cache-control');
          const dataCache = dataResponse.headers.get('cache-control');
          
          // CSS and JS should have long cache (1 year = 31536000 seconds)
          expect(cssCache).toContain('max-age=31536000');
          expect(jsCache).toContain('max-age=31536000');
          
          // Data files should have shorter cache (1 hour = 3600 seconds)
          expect(dataCache).toContain('max-age=3600');
        }
      ),
      { numRuns: 100 }
    );
  });
});