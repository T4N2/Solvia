// Navigation functionality for Solvia Nova Portfolio
class Navigation {
  constructor() {
    this.nav = document.getElementById('navigation');
    this.navLinks = document.querySelectorAll('.nav-links a');
    this.hamburger = document.querySelector('.hamburger');
    this.mobileMenu = document.querySelector('.nav-links');
    this.mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    this.backToTopButton = document.getElementById('back-to-top');
    this.sections = document.querySelectorAll('section[id]');
    
    this.init();
  }

  init() {
    this.setupSmoothScroll();
    this.setupActiveStateTracking();
    this.setupMobileMenu();
    this.setupBackToTop();
    this.setupStickyNavigation();
  }

  // Smooth scroll to sections on link click
  setupSmoothScroll() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          const navHeight = this.nav.offsetHeight;
          const targetPosition = targetSection.offsetTop - navHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          this.closeMobileMenu();
        }
      });
    });
  }

  // Add active link highlighting based on scroll position
  setupActiveStateTracking() {
    const observerOptions = {
      root: null,
      rootMargin: `-${this.nav.offsetHeight}px 0px -50% 0px`,
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.updateActiveLink(entry.target.id);
        }
      });
    }, observerOptions);

    this.sections.forEach(section => {
      observer.observe(section);
    });
  }

  // Update active link highlighting
  updateActiveLink(activeId) {
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${activeId}`) {
        link.classList.add('active');
      }
    });
  }

  // Setup mobile menu functionality
  setupMobileMenu() {
    if (this.hamburger) {
      this.hamburger.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Close mobile menu when clicking outside or on overlay
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target) && this.mobileMenu.classList.contains('active')) {
        this.closeMobileMenu();
      }
    });

    // Close mobile menu when clicking on overlay
    if (this.mobileMenuOverlay) {
      this.mobileMenuOverlay.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileMenu.classList.contains('active')) {
        this.closeMobileMenu();
      }
    });

    // Handle keyboard navigation for mobile menu links
    this.navLinks.forEach((link, index) => {
      link.addEventListener('keydown', (e) => {
        if (this.mobileMenu.classList.contains('active')) {
          if (e.key === 'Tab') {
            // Allow normal tab navigation
            return;
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (index + 1) % this.navLinks.length;
            this.navLinks[nextIndex].focus();
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (index - 1 + this.navLinks.length) % this.navLinks.length;
            this.navLinks[prevIndex].focus();
          }
        }
      });
    });
  }

  toggleMobileMenu() {
    this.mobileMenu.classList.toggle('active');
    this.hamburger.classList.toggle('active');
    this.mobileMenuOverlay.classList.toggle('active');
    
    // Update accessibility attributes
    const isOpen = this.mobileMenu.classList.contains('active');
    this.hamburger.setAttribute('aria-expanded', isOpen.toString());
    
    // Prevent body scroll when menu is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus first navigation link when menu opens
      setTimeout(() => {
        if (this.navLinks.length > 0) {
          this.navLinks[0].focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = '';
      // Return focus to hamburger button when menu closes
      this.hamburger.focus();
    }
  }

  closeMobileMenu() {
    this.mobileMenu.classList.remove('active');
    this.hamburger.classList.remove('active');
    this.mobileMenuOverlay.classList.remove('active');
    this.hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Setup back to top button
  setupBackToTop() {
    if (this.backToTopButton) {
      // Show/hide button based on scroll position
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          this.backToTopButton.classList.add('visible');
        } else {
          this.backToTopButton.classList.remove('visible');
        }
      });

      // Scroll to top on click
      this.backToTopButton.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  // Setup sticky navigation with backdrop blur effect
  setupStickyNavigation() {
    let lastScrollY = window.pageYOffset;
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.pageYOffset;
      
      // Add/remove backdrop blur based on scroll position
      if (currentScrollY > 50) {
        this.nav.style.backgroundColor = 'rgba(10, 14, 39, 0.9)';
        this.nav.style.backdropFilter = 'blur(15px)';
      } else {
        this.nav.style.backgroundColor = 'rgba(10, 14, 39, 0.8)';
        this.nav.style.backdropFilter = 'blur(10px)';
      }
      
      lastScrollY = currentScrollY;
    });
  }

  // Get currently active section (for testing)
  getCurrentActiveSection() {
    const scrollPosition = window.pageYOffset + this.nav.offsetHeight + 50;
    
    // Always return the first section if at the top
    if (window.pageYOffset < 100) {
      return this.sections[0]?.id || null;
    }
    
    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = this.sections[i];
      if (section.offsetTop <= scrollPosition) {
        return section.id;
      }
    }
    
    return this.sections[0]?.id || null;
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.navigation = new Navigation();
});

console.log('Navigation module loaded');
