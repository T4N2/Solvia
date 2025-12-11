// Vercel Serverless Function for Solvia Nova Portfolio
const { readFile } = require('fs/promises');
const { join } = require('path');

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
    
    // Static file serving
    if (url === '/' || url === '/index.html') {
      const htmlPath = join(process.cwd(), 'public', 'index.html');
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