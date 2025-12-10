// Performance optimization utilities
// Handles lazy loading, intersection observers, and performance monitoring

/**
 * Intersection Observer for lazy loading and animations
 */
class LazyLoader {
  constructor() {
    this.imageObserver = null;
    this.animationObserver = null;
    this.init();
  }

  init() {
    // Initialize image lazy loading observer
    if ('IntersectionObserver' in window) {
      this.setupImageObserver();
      this.setupAnimationObserver();
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
  }

  setupImageObserver() {
    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Handle regular img elements
          if (img.tagName === 'IMG' && img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            this.imageObserver.unobserve(img);
          }
          
          // Handle picture elements
          if (img.tagName === 'PICTURE') {
            const sources = img.querySelectorAll('source[data-srcset]');
            const imgElement = img.querySelector('img[data-src]');
            
            sources.forEach(source => {
              source.srcset = source.dataset.srcset;
              source.removeAttribute('data-srcset');
            });
            
            if (imgElement) {
              imgElement.src = imgElement.dataset.src;
              imgElement.removeAttribute('data-src');
            }
            
            this.imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.01
    });

    // Observe all lazy images
    this.observeImages();
  }

  setupAnimationObserver() {
    this.animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          this.animationObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px', // Trigger 50px before element is fully visible
      threshold: 0.1
    });

    // Observe all animation elements
    this.observeAnimations();
  }

  observeImages() {
    // Observe images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src], picture');
    lazyImages.forEach(img => {
      this.imageObserver.observe(img);
    });
  }

  observeAnimations() {
    // Observe elements with animation classes
    const animationElements = document.querySelectorAll(
      '.fade-in-section, .slide-in-left, .slide-in-right, .slide-in-up'
    );
    animationElements.forEach(element => {
      this.animationObserver.observe(element);
    });
  }

  loadAllImages() {
    // Fallback: load all images immediately
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });

    const lazySources = document.querySelectorAll('source[data-srcset]');
    lazySources.forEach(source => {
      source.srcset = source.dataset.srcset;
      source.removeAttribute('data-srcset');
    });
  }

  // Method to add new images to observation (for dynamically loaded content)
  observeNewImages(container) {
    if (!this.imageObserver) return;
    
    const newImages = container.querySelectorAll('img[data-src], picture');
    newImages.forEach(img => {
      this.imageObserver.observe(img);
    });
  }

  // Method to add new animation elements to observation
  observeNewAnimations(container) {
    if (!this.animationObserver) return;
    
    const newElements = container.querySelectorAll(
      '.fade-in-section, .slide-in-left, .slide-in-right, .slide-in-up'
    );
    newElements.forEach(element => {
      this.animationObserver.observe(element);
    });
  }
}

/**
 * Performance monitoring utilities
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    // Monitor Core Web Vitals if supported
    if ('PerformanceObserver' in window) {
      this.observeWebVitals();
    }

    // Monitor resource loading
    this.monitorResources();
  }

  observeWebVitals() {
    try {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      new PerformanceObserver((entryList) => {
        let clsValue = 0;
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
        console.log('CLS:', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });

    } catch (error) {
      console.warn('Performance monitoring not fully supported:', error);
    }
  }

  monitorResources() {
    window.addEventListener('load', () => {
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        this.metrics.loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
        
        console.log('DOM Content Loaded:', this.metrics.domContentLoaded);
        console.log('Load Complete:', this.metrics.loadComplete);
      }

      // Get resource timing
      const resources = performance.getEntriesByType('resource');
      const slowResources = resources.filter(resource => resource.duration > 1000);
      
      if (slowResources.length > 0) {
        console.warn('Slow loading resources:', slowResources);
      }
    });
  }

  getMetrics() {
    return this.metrics;
  }
}

/**
 * Critical resource preloader
 */
class ResourcePreloader {
  constructor() {
    this.preloadedResources = new Set();
  }

  preloadImage(src) {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  preloadCSS(href) {
    if (this.preloadedResources.has(href)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => {
        this.preloadedResources.add(href);
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  preloadScript(src) {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      link.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }
}

// Initialize performance optimizations
let lazyLoader, performanceMonitor, resourcePreloader;

function initPerformanceOptimizations() {
  lazyLoader = new LazyLoader();
  performanceMonitor = new PerformanceMonitor();
  resourcePreloader = new ResourcePreloader();

  // Preload critical resources
  resourcePreloader.preloadCSS('/dist/css/styles.min.css');
  
  console.log('🚀 Performance optimizations initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPerformanceOptimizations);
} else {
  initPerformanceOptimizations();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.PerformanceUtils = {
    LazyLoader,
    PerformanceMonitor,
    ResourcePreloader,
    lazyLoader: () => lazyLoader,
    performanceMonitor: () => performanceMonitor,
    resourcePreloader: () => resourcePreloader
  };
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LazyLoader,
    PerformanceMonitor,
    ResourcePreloader
  };
}