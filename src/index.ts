import { Elysia } from 'elysia';
import { handleContactSubmission } from './api/contact';
import { 
  verifyAdminCredentials, 
  isLockedOut, 
  recordFailedAttempt, 
  clearFailedAttempts 
} from './auth/admin-config';
import { generateToken, requireAuth } from './auth/middleware';

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
  .get('/api/services', async ({ set }) => {
    try {
      const servicesFile = Bun.file('data/services.json');
      
      if (!await servicesFile.exists()) {
        set.status = 404;
        set.headers['Cache-Control'] = 'no-cache';
        return {
          success: false,
          message: 'Services data not found',
        };
      }

      const servicesData = await servicesFile.json();

      set.headers['Cache-Control'] = 'public, max-age=3600, s-maxage=3600';
      set.headers['ETag'] = `"services-${Date.now()}"`;
      
      return {
        success: true,
        data: servicesData,
      };
    } catch (error) {
      console.error('Services API error:', error);
      set.status = 500;
      set.headers['Cache-Control'] = 'no-cache';
      return {
        success: false,
        message: 'Failed to retrieve services data',
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
  // Admin login endpoint
  .post('/api/admin/login', async ({ body, request, set }) => {
    try {
      const { username, password } = body as { username: string; password: string };
      
      // Get client IP
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      
      // Check if IP is locked out
      if (isLockedOut(ip)) {
        set.status = 429;
        return {
          success: false,
          message: 'Too many failed login attempts. Please try again later.'
        };
      }
      
      // Verify credentials
      const isValid = await verifyAdminCredentials(username, password);
      
      if (!isValid) {
        recordFailedAttempt(ip);
        set.status = 401;
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }
      
      // Clear failed attempts on successful login
      clearFailedAttempts(ip);
      
      // Generate JWT token
      const { token, expires } = generateToken(username);
      
      return {
        success: true,
        message: 'Login successful',
        token,
        expires
      };
    } catch (error) {
      console.error('Login error:', error);
      set.status = 500;
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  })
  // Admin API endpoints
  .post('/api/admin/services', async ({ body, request, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get('authorization'));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }
    try {
      const servicesFile = Bun.file('data/services.json');
      const services = await servicesFile.json();
      
      const serviceData = body as any;
      const existingIndex = services.findIndex((s: any) => s.id === serviceData.id);
      
      if (existingIndex >= 0) {
        services[existingIndex] = serviceData;
      } else {
        services.push(serviceData);
      }
      
      await Bun.write('data/services.json', JSON.stringify(services, null, 2));
      
      return { success: true, message: 'Service saved successfully' };
    } catch (error) {
      console.error('Admin services error:', error);
      set.status = 500;
      return { success: false, message: 'Failed to save service' };
    }
  })
  .delete('/api/admin/services/:id', async ({ params, request, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get('authorization'));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }
    try {
      const servicesFile = Bun.file('data/services.json');
      const services = await servicesFile.json();
      
      const filteredServices = services.filter((s: any) => s.id !== params.id);
      
      await Bun.write('data/services.json', JSON.stringify(filteredServices, null, 2));
      
      return { success: true, message: 'Service deleted successfully' };
    } catch (error) {
      console.error('Admin services delete error:', error);
      set.status = 500;
      return { success: false, message: 'Failed to delete service' };
    }
  })
  .post('/api/admin/portfolio', async ({ body, request, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get('authorization'));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }
    try {
      const portfolioFile = Bun.file('data/portfolio.json');
      const portfolio = await portfolioFile.json();
      
      const portfolioData = body as any;
      const existingIndex = portfolio.findIndex((p: any) => p.id === portfolioData.id);
      
      if (existingIndex >= 0) {
        portfolio[existingIndex] = portfolioData;
      } else {
        portfolio.push(portfolioData);
      }
      
      await Bun.write('data/portfolio.json', JSON.stringify(portfolio, null, 2));
      
      return { success: true, message: 'Portfolio saved successfully' };
    } catch (error) {
      console.error('Admin portfolio error:', error);
      set.status = 500;
      return { success: false, message: 'Failed to save portfolio' };
    }
  })
  .delete('/api/admin/portfolio/:id', async ({ params, request, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get('authorization'));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }
    try {
      const portfolioFile = Bun.file('data/portfolio.json');
      const portfolio = await portfolioFile.json();
      
      const filteredPortfolio = portfolio.filter((p: any) => p.id !== params.id);
      
      await Bun.write('data/portfolio.json', JSON.stringify(filteredPortfolio, null, 2));
      
      return { success: true, message: 'Portfolio deleted successfully' };
    } catch (error) {
      console.error('Admin portfolio delete error:', error);
      set.status = 500;
      return { success: false, message: 'Failed to delete portfolio' };
    }
  })
  .post('/api/admin/testimonials', async ({ body, request, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get('authorization'));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }
    try {
      const testimonialsFile = Bun.file('data/testimonials.json');
      const testimonials = await testimonialsFile.json();
      
      const testimonialData = body as any;
      const existingIndex = testimonials.findIndex((t: any) => t.id === testimonialData.id);
      
      if (existingIndex >= 0) {
        testimonials[existingIndex] = testimonialData;
      } else {
        testimonials.push(testimonialData);
      }
      
      await Bun.write('data/testimonials.json', JSON.stringify(testimonials, null, 2));
      
      return { success: true, message: 'Testimonial saved successfully' };
    } catch (error) {
      console.error('Admin testimonials error:', error);
      set.status = 500;
      return { success: false, message: 'Failed to save testimonial' };
    }
  })
  .delete('/api/admin/testimonials/:id', async ({ params, request, set }) => {
    // Check authentication
    const authResult = requireAuth(request.headers.get('authorization'));
    if (!authResult.success) {
      set.status = 401;
      return { success: false, message: authResult.error };
    }
    try {
      const testimonialsFile = Bun.file('data/testimonials.json');
      const testimonials = await testimonialsFile.json();
      
      const filteredTestimonials = testimonials.filter((t: any) => t.id !== params.id);
      
      await Bun.write('data/testimonials.json', JSON.stringify(filteredTestimonials, null, 2));
      
      return { success: true, message: 'Testimonial deleted successfully' };
    } catch (error) {
      console.error('Admin testimonials delete error:', error);
      set.status = 500;
      return { success: false, message: 'Failed to delete testimonial' };
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
  .get('/admin', () => {
    const file = Bun.file('public/admin.html');
    return new Response(file.stream(), {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300', // 5 minutes for HTML
      },
    });
  })
  .get('/admin.html', () => {
    const file = Bun.file('public/admin.html');
    return new Response(file.stream(), {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300', // 5 minutes for HTML
      },
    });
  })
  .get('/login', () => {
    const file = Bun.file('public/login.html');
    return new Response(file.stream(), {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300', // 5 minutes for HTML
      },
    });
  })
  .get('/login.html', () => {
    const file = Bun.file('public/login.html');
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
