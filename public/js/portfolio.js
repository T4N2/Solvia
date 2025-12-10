// Portfolio Module
// Handles loading, rendering, filtering, and modal display for portfolio items

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (typeof text !== 'string') {
    return '';
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Renders a single portfolio item to HTML
 * @param {Object} item - Portfolio item data
 * @returns {string} HTML string for the portfolio item card
 */
function renderPortfolioItem(item) {
  const technologiesHTML = item.technologies
    .map(tech => `<span class="portfolio-tech">${escapeHtml(tech)}</span>`)
    .join('');
  
  return `
    <div class="portfolio-item" data-portfolio-id="${escapeHtml(item.id)}" data-category="${escapeHtml(item.category)}">
      <div class="portfolio-image">
        <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.title)}" loading="lazy">
        <div class="portfolio-overlay">
          <button class="portfolio-view-btn" data-portfolio-id="${escapeHtml(item.id)}">
            View Details
          </button>
        </div>
      </div>
      <div class="portfolio-content">
        <h3 class="portfolio-title">${escapeHtml(item.title)}</h3>
        <p class="portfolio-description">${escapeHtml(item.description)}</p>
        <div class="portfolio-technologies">
          ${technologiesHTML}
        </div>
      </div>
    </div>
  `;
}

/**
 * Filters portfolio items by category or technology
 * @param {Array} items - Array of portfolio items
 * @param {string} filterValue - Filter value (category or technology)
 * @returns {Array} Filtered portfolio items
 */
function filterPortfolioItems(items, filterValue) {
  if (!filterValue || filterValue === 'all') {
    return items;
  }
  
  return items.filter(item => {
    // Check if filter matches category
    if (item.category === filterValue) {
      return true;
    }
    
    // Check if filter matches any technology
    if (item.technologies && item.technologies.some(tech => 
      tech.toLowerCase() === filterValue.toLowerCase()
    )) {
      return true;
    }
    
    return false;
  });
}

/**
 * Renders the portfolio modal with detailed project information
 * @param {Object} item - Portfolio item data
 * @returns {string} HTML string for the modal
 */
function renderPortfolioModal(item) {
  const imagesHTML = item.images && item.images.length > 0
    ? item.images.map(img => `
        <img src="${escapeHtml(img)}" alt="${escapeHtml(item.title)}" loading="lazy">
      `).join('')
    : '';
  
  const technologiesHTML = item.technologies
    .map(tech => `<span class="modal-tech">${escapeHtml(tech)}</span>`)
    .join('');
  
  const clientHTML = item.clientName 
    ? `<p><strong>Client:</strong> ${escapeHtml(item.clientName)}</p>`
    : '';
  
  const urlHTML = item.projectUrl
    ? `<p><strong>URL:</strong> <a href="${escapeHtml(item.projectUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.projectUrl)}</a></p>`
    : '';
  
  const dateHTML = item.completedDate
    ? `<p><strong>Completed:</strong> ${escapeHtml(item.completedDate)}</p>`
    : '';
  
  return `
    <div class="portfolio-modal-overlay" id="portfolio-modal">
      <div class="portfolio-modal-content">
        <button class="portfolio-modal-close" aria-label="Close modal">&times;</button>
        <h2 class="modal-title">${escapeHtml(item.title)}</h2>
        <div class="modal-images">
          ${imagesHTML}
        </div>
        <div class="modal-details">
          <p class="modal-description">${escapeHtml(item.detailedDescription || item.description)}</p>
          <div class="modal-technologies">
            <strong>Technologies:</strong>
            ${technologiesHTML}
          </div>
          ${clientHTML}
          ${urlHTML}
          ${dateHTML}
        </div>
      </div>
    </div>
  `;
}

// Store portfolio data globally for filtering
let portfolioData = [];
let currentFilter = 'all';

/**
 * Loads and renders all portfolio items
 */
async function loadPortfolioItems() {
  try {
    const response = await fetch('/data/portfolio.json');
    if (!response.ok) {
      throw new Error('Failed to load portfolio');
    }
    
    portfolioData = await response.json();
    
    // Render filter buttons
    renderFilterButtons();
    
    // Render portfolio items
    renderPortfolioGrid(portfolioData);
    
    // Attach click handlers
    attachPortfolioClickHandlers();
    
  } catch (error) {
    console.error('Error loading portfolio items:', error);
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (portfolioGrid) {
      portfolioGrid.innerHTML = '<p class="error-message">Failed to load portfolio. Please try again later.</p>';
    }
  }
}

/**
 * Renders filter buttons based on available categories and technologies
 */
function renderFilterButtons() {
  const filtersContainer = document.querySelector('.portfolio-filters');
  if (!filtersContainer) {
    return;
  }
  
  // Extract unique categories
  const categories = new Set();
  portfolioData.forEach(item => {
    if (item.category) {
      categories.add(item.category);
    }
  });
  
  // Create filter buttons
  let filtersHTML = '<button class="filter-btn active" data-filter="all">All</button>';
  
  categories.forEach(category => {
    filtersHTML += `<button class="filter-btn" data-filter="${escapeHtml(category)}">${escapeHtml(category.charAt(0).toUpperCase() + category.slice(1))}</button>`;
  });
  
  filtersContainer.innerHTML = filtersHTML;
  
  // Attach filter click handlers
  attachFilterClickHandlers();
}

/**
 * Renders the portfolio grid with given items
 * @param {Array} items - Array of portfolio items to render
 */
function renderPortfolioGrid(items) {
  const portfolioGrid = document.getElementById('portfolio-grid');
  if (!portfolioGrid) {
    console.error('Portfolio grid element not found');
    return;
  }
  
  if (items.length === 0) {
    portfolioGrid.innerHTML = '<p class="no-results">No portfolio items found.</p>';
    return;
  }
  
  portfolioGrid.innerHTML = items.map(item => renderPortfolioItem(item)).join('');
  
  // Re-attach click handlers after rendering
  attachPortfolioClickHandlers();
}

/**
 * Attaches click handlers to filter buttons
 */
function attachFilterClickHandlers() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const filterValue = e.target.dataset.filter;
      
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      
      // Filter and render
      currentFilter = filterValue;
      const filteredItems = filterPortfolioItems(portfolioData, filterValue);
      renderPortfolioGrid(filteredItems);
    });
  });
}

/**
 * Attaches click handlers to portfolio items
 */
function attachPortfolioClickHandlers() {
  const viewButtons = document.querySelectorAll('.portfolio-view-btn');
  
  viewButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const portfolioId = e.target.dataset.portfolioId;
      openPortfolioModal(portfolioId);
    });
  });
}

/**
 * Opens the portfolio modal for a specific item
 * @param {string} itemId - ID of the portfolio item
 */
function openPortfolioModal(itemId) {
  const item = portfolioData.find(p => p.id === itemId);
  
  if (!item) {
    console.error('Portfolio item not found:', itemId);
    return;
  }
  
  // Remove existing modal if any
  const existingModal = document.getElementById('portfolio-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create and append modal
  const modalHTML = renderPortfolioModal(item);
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Attach close handlers
  attachModalCloseHandlers();
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

/**
 * Closes the portfolio modal
 */
function closePortfolioModal() {
  const modal = document.getElementById('portfolio-modal');
  if (modal) {
    modal.remove();
  }
  
  // Restore body scroll
  document.body.style.overflow = '';
}

/**
 * Attaches close handlers to modal
 */
function attachModalCloseHandlers() {
  const modal = document.getElementById('portfolio-modal');
  if (!modal) {
    return;
  }
  
  // Close button
  const closeButton = modal.querySelector('.portfolio-modal-close');
  if (closeButton) {
    closeButton.addEventListener('click', closePortfolioModal);
  }
  
  // Click outside modal content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePortfolioModal();
    }
  });
  
  // Escape key
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      closePortfolioModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  });
}

// Initialize portfolio when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPortfolioItems);
} else {
  loadPortfolioItems();
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeHtml,
    renderPortfolioItem,
    filterPortfolioItems,
    renderPortfolioModal,
    loadPortfolioItems,
    openPortfolioModal,
    closePortfolioModal
  };
}
