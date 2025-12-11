// Testimonials Module
// Handles loading, rendering, and carousel functionality for client testimonials

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
 * Renders a single testimonial to HTML
 * @param {Object} testimonial - Testimonial data
 * @returns {string} HTML string for the testimonial card
 */
function renderTestimonial(testimonial) {
  const photoHTML = testimonial.photo
    ? `<img src="${escapeHtml(testimonial.photo)}" alt="${escapeHtml(testimonial.clientName)}" class="testimonial-photo" loading="lazy">`
    : `<div class="testimonial-photo-placeholder">${escapeHtml(testimonial.clientName.charAt(0))}</div>`;
  
  const ratingHTML = testimonial.rating
    ? `<div class="testimonial-rating">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</div>`
    : '';
  
  const positionHTML = testimonial.position
    ? `<span class="testimonial-position">${escapeHtml(testimonial.position)}</span>`
    : '';
  
  return `
    <div class="testimonial-card" data-testimonial-id="${escapeHtml(testimonial.id)}">
      <div class="testimonial-header">
        ${photoHTML}
        <div class="testimonial-info">
          <h3 class="testimonial-name">${escapeHtml(testimonial.clientName)}</h3>
          <p class="testimonial-company">${escapeHtml(testimonial.company)}</p>
          ${positionHTML ? `<p class="testimonial-position-text">${positionHTML}</p>` : ''}
        </div>
      </div>
      <div class="testimonial-content">
        <p class="testimonial-text">${escapeHtml(testimonial.text)}</p>
        ${ratingHTML}
      </div>
    </div>
  `;
}

// Carousel state
let testimonials = [];
let currentIndex = 0;
let autoPlayInterval = null;
const AUTO_PLAY_DELAY = 5000; // 5 seconds

/**
 * Loads testimonials from JSON file
 */
async function loadTestimonials() {
  try {
    // Use API endpoint instead of direct file access
    const response = await fetch('/api/testimonials');
    if (!response.ok) {
      throw new Error('Failed to load testimonials');
    }
    
    const result = await response.json();
    testimonials = result.data || result;
    
    if (testimonials.length === 0) {
      console.warn('No testimonials found');
      return;
    }
    
    // Initialize carousel
    initializeCarousel();
    
  } catch (error) {
    console.error('Error loading testimonials:', error);
    const carouselContainer = document.getElementById('testimonial-carousel');
    if (carouselContainer) {
      carouselContainer.innerHTML = '<p class="error-message">Failed to load testimonials. Please try again later.</p>';
    }
  }
}

/**
 * Initializes the testimonial carousel
 */
function initializeCarousel() {
  const carouselContainer = document.getElementById('testimonial-carousel');
  if (!carouselContainer) {
    console.error('Testimonial carousel container not found');
    return;
  }
  
  // Create carousel structure
  carouselContainer.innerHTML = `
    <div class="testimonial-wrapper">
      <button class="carousel-nav carousel-prev" aria-label="Previous testimonial">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="testimonial-container">
        <!-- Testimonial will be rendered here -->
      </div>
      <button class="carousel-nav carousel-next" aria-label="Next testimonial">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <div class="carousel-indicators">
      <!-- Indicators will be rendered here -->
    </div>
  `;
  
  // Render indicators
  renderIndicators();
  
  // Render initial testimonial
  renderCurrentTestimonial();
  
  // Attach event handlers
  attachCarouselHandlers();
  
  // Start auto-play
  startAutoPlay();
}

/**
 * Renders the current testimonial
 */
function renderCurrentTestimonial() {
  const container = document.querySelector('.testimonial-container');
  if (!container || testimonials.length === 0) {
    return;
  }
  
  const testimonial = testimonials[currentIndex];
  container.innerHTML = renderTestimonial(testimonial);
  
  // Update indicators
  updateIndicators();
}

/**
 * Renders carousel indicators
 */
function renderIndicators() {
  const indicatorsContainer = document.querySelector('.carousel-indicators');
  if (!indicatorsContainer) {
    return;
  }
  
  indicatorsContainer.innerHTML = testimonials
    .map((_, index) => `
      <button 
        class="carousel-indicator ${index === currentIndex ? 'active' : ''}" 
        data-index="${index}"
        aria-label="Go to testimonial ${index + 1}"
      ></button>
    `)
    .join('');
  
  // Attach click handlers to indicators
  const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');
  indicators.forEach(indicator => {
    indicator.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      goToTestimonial(index);
    });
  });
}

/**
 * Updates the active state of indicators
 */
function updateIndicators() {
  const indicators = document.querySelectorAll('.carousel-indicator');
  indicators.forEach((indicator, index) => {
    if (index === currentIndex) {
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  });
}

/**
 * Navigates to the next testimonial
 */
function nextTestimonial() {
  if (testimonials.length === 0) {
    return;
  }
  
  currentIndex = (currentIndex + 1) % testimonials.length;
  renderCurrentTestimonial();
}

/**
 * Navigates to the previous testimonial
 */
function previousTestimonial() {
  if (testimonials.length === 0) {
    return;
  }
  
  currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
  renderCurrentTestimonial();
}

/**
 * Navigates to a specific testimonial by index
 * @param {number} index - Index of the testimonial to display
 */
function goToTestimonial(index) {
  if (index < 0 || index >= testimonials.length) {
    return;
  }
  
  currentIndex = index;
  renderCurrentTestimonial();
  
  // Reset auto-play when user manually navigates
  stopAutoPlay();
  startAutoPlay();
}

/**
 * Starts auto-play functionality
 */
function startAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
  }
  
  autoPlayInterval = setInterval(() => {
    nextTestimonial();
  }, AUTO_PLAY_DELAY);
}

/**
 * Stops auto-play functionality
 */
function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
}

/**
 * Attaches event handlers to carousel controls
 */
function attachCarouselHandlers() {
  const prevButton = document.querySelector('.carousel-prev');
  const nextButton = document.querySelector('.carousel-next');
  const carouselWrapper = document.querySelector('.testimonial-wrapper');
  
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      previousTestimonial();
      stopAutoPlay();
      startAutoPlay();
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      nextTestimonial();
      stopAutoPlay();
      startAutoPlay();
    });
  }
  
  // Pause auto-play on hover
  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
    carouselWrapper.addEventListener('mouseleave', startAutoPlay);
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const carouselContainer = document.getElementById('testimonial-carousel');
    if (!carouselContainer) {
      return;
    }
    
    // Only handle keyboard events if carousel is in viewport
    const rect = carouselContainer.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom >= 0;
    
    if (isInViewport) {
      if (e.key === 'ArrowLeft') {
        previousTestimonial();
        stopAutoPlay();
        startAutoPlay();
      } else if (e.key === 'ArrowRight') {
        nextTestimonial();
        stopAutoPlay();
        startAutoPlay();
      }
    }
  });
}

// Initialize testimonials when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadTestimonials);
} else {
  loadTestimonials();
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeHtml,
    renderTestimonial,
    loadTestimonials,
    nextTestimonial,
    previousTestimonial,
    goToTestimonial,
    startAutoPlay,
    stopAutoPlay,
    // Export state getters for testing
    getCurrentIndex: () => currentIndex,
    getTestimonials: () => testimonials,
    setTestimonials: (data) => { testimonials = data; },
    setCurrentIndex: (index) => { currentIndex = index; }
  };
}
