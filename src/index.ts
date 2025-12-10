import { Elysia } from 'elysia';
import { handleContactSubmission } from './api/contact';

const app = new Elysia()
  // API routes first
  .get('/api/portfolio', async ({ query, set }) => {
    try {
      const portfolioFile = Bun.file('data/portfolio.json');
      
      if (!await portfolioFile.exists()) {
        set.status = 404;
        set.headers['Cache-Control'] = 'no-cache';
        return {
          success: false,
          message: 'Portfolio data not found',
        };
      }

      const portfolioData = await portfolioFile.json();
      
      // Apply filtering if category is provided
      let filteredData = portfolioData;
      if (query.category && typeof query.category === 'string') {
        filteredData = portfolioData.filter((item: any) => 
          item.category === query.category
        );
      }

      set.headers['Cache-Control'] = 'public, max-age=3600, s-maxage=3600';
      set.headers['ETag'] = `"portfolio-${Date.now()}"`;
      
      return {
        success: true,
        data: filteredData,
      };
    } catch (error) {
      console.error('Portfolio API error:', error);
      set.status = 500;
      set.headers['Cache-Control'] = 'no-cache';
      return {
        success: false,
        message: 'Failed to retrieve portfolio data',
      };
    }
  })
  .get('/api/testimonials', async ({ set }) => {
    try {
      const testimonialsFile = Bun.file('data/testimonials.json');
      
      if (!await testimonialsFile.exists()) {
        set.status = 404;
        set.headers['Cache-Control'] = 'no-cache';
        return {
          success: false,
          message: 'Testimonials data not found',
        };
      }

      const testimonialsData = await testimonialsFile.json();

      set.headers['Cache-Control'] = 'public, max-age=3600, s-maxage=3600';
      set.headers['ETag'] = `"testimonials-${Date.now()}"`;
      
      return {
        success: true,
        data: testimonialsData,
      };
    } catch (error) {
      console.error('Testimonials API error:', error);
      set.status = 500;
      set.headers['Cache-Control'] = 'no-cache';
      return {
        success: false,
        message: 'Failed to retrieve testimonials data',
      };
    }
  })
  .post('/api/contact', async ({ body, request }) => {
    try {
      // Get client IP for rate limiting
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      
      const response = await handleContactSubmission(body, ip);
      return response;
    } catch (error) {
      console.error('Contact form error:', error);
      
      // Return appropriate error response
      if (error instanceof Error) {
        if (error.message.includes('Rate limit')) {
          return new Response(
            JSON.stringify({
              success: false,
              message: error.message,
            }),
            {
              status: 429,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
        
        if (error.message.includes('Validation failed')) {
          return new Response(
            JSON.stringify({
              success: false,
              message: error.message,
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      }
      
      // Generic server error
      return new Response(
        JSON.stringify({
          success: false,
          message: 'An error occurred while processing your request. Please try again later.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  })
  // Static file serving with caching headers
  .get('/', () => {
    const file = Bun.file('public/index.html');
    return new Response(file.stream(), {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300', // 5 minutes for HTML
      },
    });
  })
  .get('/css/*', ({ params }) => {
    const file = Bun.file(`public/css/${params['*']}`);
    return new Response(file.stream(), {
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year for CSS
        'ETag': `"css-${params['*']}"`,
        'Vary': 'Accept-Encoding',
      },
    });
  })
  .get('/dist/css/*', ({ params }) => {
    const file = Bun.file(`public/dist/css/${params['*']}`);
    return new Response(file.stream(), {
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year for minified CSS
        'ETag': `"dist-css-${params['*']}"`,
        'Vary': 'Accept-Encoding',
      },
    });
  })
  .get('/js/*', ({ params }) => {
    const file = Bun.file(`public/js/${params['*']}`);
    return new Response(file.stream(), {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year for JS
        'ETag': `"js-${params['*']}"`,
        'Vary': 'Accept-Encoding',
      },
    });
  })
  .get('/dist/js/*', ({ params }) => {
    const file = Bun.file(`public/dist/js/${params['*']}`);
    return new Response(file.stream(), {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year for minified JS
        'ETag': `"dist-js-${params['*']}"`,
        'Vary': 'Accept-Encoding',
      },
    });
  })
  .get('/images/*', ({ params }) => {
    const file = Bun.file(`public/images/${params['*']}`);
    const extension = params['*'].split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    if (extension === 'png') contentType = 'image/png';
    else if (extension === 'gif') contentType = 'image/gif';
    else if (extension === 'webp') contentType = 'image/webp';
    else if (extension === 'svg') contentType = 'image/svg+xml';
    else if (extension === 'avif') contentType = 'image/avif';
    
    return new Response(file.stream(), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year for images
        'ETag': `"img-${params['*']}"`,
        'Vary': 'Accept-Encoding',
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
  })
  .listen(3000);

console.log(`🚀 Solvia Nova Portfolio is running at http://${app.server?.hostname}:${app.server?.port}`);

// Export for Vercel
export default app;
