// Service Packages Module
// Handles loading, rendering, and interaction with service packages

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Renders a single service package to HTML
 * @param {Object} service - Service package data
 * @returns {string} HTML string for the service package card
 */
function renderServicePackage(service) {
  const popularBadge = service.popular 
    ? '<span class="service-badge">Popular</span>' 
    : '';
  
  const featuresHTML = service.features
    .map(feature => `<li>${escapeHtml(feature)}</li>`)
    .join('');
  
  return `
    <div class="service-card" data-service-id="${escapeHtml(service.id)}">
      ${popularBadge}
      <div class="service-icon service-icon-${escapeHtml(service.icon)}">
        ${getServiceIcon(service.icon)}
      </div>
      <h3 class="service-name">${escapeHtml(service.name)}</h3>
      <p class="service-description">${escapeHtml(service.description)}</p>
      <ul class="service-features">
        ${featuresHTML}
      </ul>
      <div class="service-price">${escapeHtml(service.price)}</div>
      <button class="service-cta" data-service-id="${escapeHtml(service.id)}" data-service-name="${escapeHtml(service.name)}">
        Get Started
      </button>
    </div>
  `;
}

/**
 * Gets the SVG icon for a service type
 * @param {string} iconType - Type of icon
 * @returns {string} SVG icon HTML
 */
function getServiceIcon(iconType) {
  const icons = {
    web: `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    mobile: `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    fullstack: `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    design: `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 19L19 12L22 15L15 22L12 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18 13L16.5 5.5L2 2L5.5 16.5L13 18L18 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="2" y1="2" x2="9.5" y2="9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="11" cy="11" r="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
  };
  
  return icons[iconType] || icons.web;
}

/**
 * Loads and renders all service packages
 */
async function loadServicePackages() {
  try {
    // Add cache busting parameter to force fresh data
    const cacheBuster = Date.now();
    const response = await fetch(`/data/services.json?v=${cacheBuster}`);
    if (!response.ok) {
      throw new Error('Failed to load services');
    }
    
    const services = await response.json();
    const servicesGrid = document.getElementById('services-grid');
    
    if (!servicesGrid) {
      console.error('Services grid element not found');
      return;
    }
    
    // Render all service packages
    servicesGrid.innerHTML = services.map(service => renderServicePackage(service)).join('');
    
    // Attach click handlers to all service CTA buttons
    attachServiceClickHandlers();
    
    // Populate service dropdown in contact form
    populateServiceDropdown(services);
    
  } catch (error) {
    console.error('Error loading service packages:', error);
    const servicesGrid = document.getElementById('services-grid');
    if (servicesGrid) {
      servicesGrid.innerHTML = '<p class="error-message">Failed to load services. Please try again later.</p>';
    }
  }
}

/**
 * Attaches click handlers to service CTA buttons
 */
function attachServiceClickHandlers() {
  const ctaButtons = document.querySelectorAll('.service-cta');
  
  ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const serviceId = e.target.dataset.serviceId;
      const serviceName = e.target.dataset.serviceName;
      
      // Navigate to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        
        // Pre-select the service in the dropdown after a short delay
        setTimeout(() => {
          const serviceSelect = document.getElementById('service');
          if (serviceSelect) {
            serviceSelect.value = serviceId;
            // Trigger change event for any listeners
            serviceSelect.dispatchEvent(new Event('change'));
          }
        }, 500);
      }
    });
  });
}

/**
 * Populates the service dropdown in the contact form
 * @param {Array} services - Array of service objects
 */
function populateServiceDropdown(services) {
  const serviceSelect = document.getElementById('service');
  
  if (!serviceSelect) {
    return;
  }
  
  // Clear existing options except the first one
  serviceSelect.innerHTML = '<option value="">Select a service</option>';
  
  // Add service options
  services.forEach(service => {
    const option = document.createElement('option');
    option.value = service.id;
    option.textContent = service.name;
    serviceSelect.appendChild(option);
  });
}

// Initialize service packages when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadServicePackages);
} else {
  loadServicePackages();
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeHtml,
    renderServicePackage,
    getServiceIcon,
    loadServicePackages,
    attachServiceClickHandlers,
    populateServiceDropdown
  };
}
