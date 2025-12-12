// Vercel Serverless Function for Solvia Nova Portfolio
const { readFile, writeFile } = require('fs/promises');
const { join } = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Admin configuration for Vercel
const ADMIN_CONFIG = {
  username: 'admin',
  passwordHash: '$2a$10$8K1p/a0dclxviR.LXY6LReIFwjJVr/HYlqDEL.7n8O.Tn8VJkqj1.',
  jwtSecret: 'solvia-nova-jwt-secret-key-2024-very-secure',
  jwtExpiry: '24h',
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000,
};

// In-memory store for failed login attempts
const loginAttempts = new Map();

// Auth helper functions
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, ADMIN_CONFIG.jwtSecret);
    return { username: decoded.username, isAdmin: decoded.isAdmin };
  } catch (error) {
    return null;
  }
}

function generateToken(username) {
  const payload = { username, isAdmin: true, iat: Math.floor(Date.now() / 1000) };
  const token = jwt.sign(payload, ADMIN_CONFIG.jwtSecret, { expiresIn: ADMIN_CONFIG.jwtExpiry });
  const expires = Date.now() + (24 * 60 * 60 * 1000);
  return { token, expires };
}

function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}

function requireAuth(authHeader) {
  const token = extractToken(authHeader);
  if (!token) return { success: false, error: 'No token provided' };
  
  const user = verifyToken(token);
  if (!user) return { success: false, error: 'Invalid or expired token' };
  if (!user.isAdmin) return { success: false, error: 'Admin access required' };
  
  return { success: true, user };
}

async function verifyAdminCredentials(username, password) {
  if (username !== ADMIN_CONFIG.username) return false;
  return await bcrypt.compare(password, ADMIN_CONFIG.passwordHash);
}

function isLockedOut(ip) {
  const attempts = loginAttempts.get(ip);
  if (!attempts) return false;
  
  const now = Date.now();
  if (attempts.count >= ADMIN_CONFIG.maxLoginAttempts) {
    if (now - attempts.lastAttempt < ADMIN_CONFIG.lockoutDuration) {
      return true;
    } else {
      loginAttempts.delete(ip);
      return false;
    }
  }
  return false;
}

function recordFailedAttempt(ip) {
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  attempts.count++;
  attempts.lastAttempt = Date.now();
  loginAttempts.set(ip, attempts);
}

function clearFailedAttempts(ip) {
  loginAttempts.delete(ip);
}

module.exports = async function handler(req, res) {
  const { method, url } = req;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // API Routes
    if (url.startsWith('/api/services')) {
      if (method !== 'GET') {
        res.status(405).json({ success: false, message: 'Method not allowed' });
        return;
      }
      
      const servicesPath = join(process.cwd(), 'data', 'services.json');
      const servicesData = JSON.parse(await readFile(servicesPath, 'utf8'));
      
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).json({
        success: true,
        data: servicesData
      });
      return;
    }
    
    if (url.startsWith('/api/portfolio')) {
      if (method !== 'GET') {
        res.status(405).json({ success: false, message: 'Method not allowed' });
        return;
      }
      
      const portfolioPath = join(process.cwd(), 'data', 'portfolio.json');
      const portfolioData = JSON.parse(await readFile(portfolioPath, 'utf8'));
      
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).json({
        success: true,
        data: portfolioData
      });
      return;
    }
    
    if (url.startsWith('/api/testimonials')) {
      if (method !== 'GET') {
        res.status(405).json({ success: false, message: 'Method not allowed' });
        return;
      }
      
      const testimonialsPath = join(process.cwd(), 'data', 'testimonials.json');
      const testimonialsData = JSON.parse(await readFile(testimonialsPath, 'utf8'));
      
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).json({
        success: true,
        data: testimonialsData
      });
      return;
    }
    
    if (url.startsWith('/api/contact')) {
      if (method !== 'POST') {
        res.status(405).json({ success: false, message: 'Method not allowed' });
        return;
      }
      
      // Parse request body
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const { name, email, phone, message, serviceInterest } = data;
          
          // Basic validation
          if (!name || !email || !message) {
            res.status(400).json({
              success: false,
              message: 'Name, email, and message are required'
            });
            return;
          }
          
          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            res.status(400).json({
              success: false,
              message: 'Please provide a valid email address'
            });
            return;
          }
          
          // For demo purposes, just return success
          // In production, you would integrate with email service
          console.log('📧 Contact form submission:', { name, email, phone, message, serviceInterest });
          
          res.status(200).json({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.'
          });
        } catch (error) {
          res.status(400).json({
            success: false,
            message: 'Invalid JSON data'
          });
        }
      });
      return;
    }
    
    // Admin login endpoint
    if (url === '/api/admin/login') {
      if (method !== 'POST') {
        res.status(405).json({ success: false, message: 'Method not allowed' });
        return;
      }
      
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        try {
          const { username, password } = JSON.parse(body);
          const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
          
          if (isLockedOut(ip)) {
            res.status(429).json({
              success: false,
              message: 'Too many failed login attempts. Please try again later.'
            });
            return;
          }
          
          const isValid = await verifyAdminCredentials(username, password);
          
          if (!isValid) {
            recordFailedAttempt(ip);
            res.status(401).json({
              success: false,
              message: 'Invalid username or password'
            });
            return;
          }
          
          clearFailedAttempts(ip);
          const { token, expires } = generateToken(username);
          
          res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            expires
          });
        } catch (error) {
          res.status(400).json({
            success: false,
            message: 'Invalid JSON data'
          });
        }
      });
      return;
    }
    
    // Admin API Routes
    if (url.startsWith('/api/admin/')) {
      return handleAdminAPI(req, res, url, method);
    }
    
    // Static file serving
    if (url === '/' || url === '/index.html') {
      const htmlPath = join(process.cwd(), 'public', 'index.html');
      const htmlContent = await readFile(htmlPath, 'utf8');
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).send(htmlContent);
      return;
    }
    
    // Admin page
    if (url === '/admin' || url === '/admin.html') {
      const htmlPath = join(process.cwd(), 'public', 'admin.html');
      const htmlContent = await readFile(htmlPath, 'utf8');
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).send(htmlContent);
      return;
    }
    
    // Login page
    if (url === '/login' || url === '/login.html') {
      const htmlPath = join(process.cwd(), 'public', 'login.html');
      const htmlContent = await readFile(htmlPath, 'utf8');
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200).send(htmlContent);
      return;
    }
    
    // Handle static assets
    if (url.startsWith('/css/') || url.startsWith('/js/') || url.startsWith('/data/')) {
      const filePath = join(process.cwd(), 'public', url);
      
      try {
        const fileContent = await readFile(filePath, 'utf8');
        
        let contentType = 'text/plain';
        if (url.endsWith('.css')) contentType = 'text/css';
        else if (url.endsWith('.js')) contentType = 'application/javascript';
        else if (url.endsWith('.json')) contentType = 'application/json';
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.status(200).send(fileContent);
        return;
      } catch (error) {
        // File not found, continue to 404
      }
    }
    
    // 404 for all other routes
    res.status(404).json({
      success: false,
      message: 'Not found'
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * Handle Admin API requests
 */
async function handleAdminAPI(req, res, url, method) {
  try {
    // Check authentication for all admin API calls
    const authResult = requireAuth(req.headers.authorization);
    if (!authResult.success) {
      res.status(401).json({ success: false, message: authResult.error });
      return;
    }
    
    // Parse request body for POST/PUT/DELETE requests
    let body = '';
    if (method !== 'GET') {
      await new Promise((resolve) => {
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', resolve);
      });
    }
    
    const data = body ? JSON.parse(body) : null;
    
    // Services admin endpoints
    if (url.startsWith('/api/admin/services')) {
      if (method === 'POST') {
        await saveService(data);
        res.status(200).json({ success: true, message: 'Service saved successfully' });
        return;
      }
      
      if (method === 'DELETE') {
        const id = url.split('/').pop();
        await deleteService(id);
        res.status(200).json({ success: true, message: 'Service deleted successfully' });
        return;
      }
    }
    
    // Portfolio admin endpoints
    if (url.startsWith('/api/admin/portfolio')) {
      if (method === 'POST') {
        await savePortfolio(data);
        res.status(200).json({ success: true, message: 'Portfolio saved successfully' });
        return;
      }
      
      if (method === 'DELETE') {
        const id = url.split('/').pop();
        await deletePortfolio(id);
        res.status(200).json({ success: true, message: 'Portfolio deleted successfully' });
        return;
      }
    }
    
    // Testimonials admin endpoints
    if (url.startsWith('/api/admin/testimonials')) {
      if (method === 'POST') {
        await saveTestimonial(data);
        res.status(200).json({ success: true, message: 'Testimonial saved successfully' });
        return;
      }
      
      if (method === 'DELETE') {
        const id = url.split('/').pop();
        await deleteTestimonial(id);
        res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
        return;
      }
    }
    
    res.status(404).json({ success: false, message: 'Admin endpoint not found' });
    
  } catch (error) {
    console.error('Admin API error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/**
 * Save service data
 */
async function saveService(serviceData) {
  const servicesPath = join(process.cwd(), 'data', 'services.json');
  const services = JSON.parse(await readFile(servicesPath, 'utf8'));
  
  const existingIndex = services.findIndex(s => s.id === serviceData.id);
  
  if (existingIndex >= 0) {
    // Update existing service
    services[existingIndex] = serviceData;
  } else {
    // Add new service
    services.push(serviceData);
  }
  
  await writeFile(servicesPath, JSON.stringify(services, null, 2), 'utf8');
}

/**
 * Delete service data
 */
async function deleteService(serviceId) {
  const servicesPath = join(process.cwd(), 'data', 'services.json');
  const services = JSON.parse(await readFile(servicesPath, 'utf8'));
  
  const filteredServices = services.filter(s => s.id !== serviceId);
  
  await writeFile(servicesPath, JSON.stringify(filteredServices, null, 2), 'utf8');
}

/**
 * Save portfolio data
 */
async function savePortfolio(portfolioData) {
  const portfolioPath = join(process.cwd(), 'data', 'portfolio.json');
  const portfolio = JSON.parse(await readFile(portfolioPath, 'utf8'));
  
  const existingIndex = portfolio.findIndex(p => p.id === portfolioData.id);
  
  if (existingIndex >= 0) {
    // Update existing portfolio
    portfolio[existingIndex] = portfolioData;
  } else {
    // Add new portfolio
    portfolio.push(portfolioData);
  }
  
  await writeFile(portfolioPath, JSON.stringify(portfolio, null, 2), 'utf8');
}

/**
 * Delete portfolio data
 */
async function deletePortfolio(portfolioId) {
  const portfolioPath = join(process.cwd(), 'data', 'portfolio.json');
  const portfolio = JSON.parse(await readFile(portfolioPath, 'utf8'));
  
  const filteredPortfolio = portfolio.filter(p => p.id !== portfolioId);
  
  await writeFile(portfolioPath, JSON.stringify(filteredPortfolio, null, 2), 'utf8');
}

/**
 * Save testimonial data
 */
async function saveTestimonial(testimonialData) {
  const testimonialsPath = join(process.cwd(), 'data', 'testimonials.json');
  const testimonials = JSON.parse(await readFile(testimonialsPath, 'utf8'));
  
  const existingIndex = testimonials.findIndex(t => t.id === testimonialData.id);
  
  if (existingIndex >= 0) {
    // Update existing testimonial
    testimonials[existingIndex] = testimonialData;
  } else {
    // Add new testimonial
    testimonials.push(testimonialData);
  }
  
  await writeFile(testimonialsPath, JSON.stringify(testimonials, null, 2), 'utf8');
}

/**
 * Delete testimonial data
 */
async function deleteTestimonial(testimonialId) {
  const testimonialsPath = join(process.cwd(), 'data', 'testimonials.json');
  const testimonials = JSON.parse(await readFile(testimonialsPath, 'utf8'));
  
  const filteredTestimonials = testimonials.filter(t => t.id !== testimonialId);
  
  await writeFile(testimonialsPath, JSON.stringify(filteredTestimonials, null, 2), 'utf8');
}