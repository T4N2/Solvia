// Animation functionality for scroll-triggered effects

/**
 * Initialize scroll-triggered animations using Intersection Observer
 */
function initScrollAnimations() {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // If user prefers reduced motion, make all elements visible immediately
    const fadeElements = document.querySelectorAll('.fade-in-section, .slide-in-left, .slide-in-right, .slide-in-up');
    fadeElements.forEach(element => {
      element.classList.add('is-visible');
    });
    return;
  }
  
  // Create Intersection Observer for fade-in animations
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px', // Trigger slightly before element is fully visible
    threshold: 0.1 // Trigger when 10% of element is visible
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add visible class when element enters viewport
        entry.target.classList.add('is-visible');
        // Optional: stop observing after animation triggers once
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all elements with animation classes
  const animatedElements = document.querySelectorAll('.fade-in-section, .slide-in-left, .slide-in-right, .slide-in-up');
  animatedElements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * Initialize hover effects for interactive elements
 */
function initHoverEffects() {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return; // Skip hover effects if reduced motion is preferred
  }
  
  // Add glow effect to buttons and cards
  const interactiveElements = document.querySelectorAll('.btn, .card, .service-card, .portfolio-item, .testimonial-card');
  
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.style.setProperty('--glow-opacity', '1');
    });
    
    element.addEventListener('mouseleave', function() {
      this.style.setProperty('--glow-opacity', '0');
    });
  });
}

/**
 * Initialize particle animation for hero background
 */
function initParticleAnimation() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    canvas.style.display = 'none';
    return;
  }
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  
  // Resize canvas to match container
  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  
  // Particle class
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.2;
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      // Wrap around edges
      if (this.x > canvas.width) this.x = 0;
      if (this.x < 0) this.x = canvas.width;
      if (this.y > canvas.height) this.y = 0;
      if (this.y < 0) this.y = canvas.height;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 217, 255, ${this.opacity})`;
      ctx.fill();
    }
  }
  
  // Initialize particles
  function initParticles() {
    particles = [];
    const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 15000));
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }
  
  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    // Draw connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 217, 255, ${0.1 * (1 - distance / 100)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    
    animationId = requestAnimationFrame(animate);
  }
  
  // Initialize and start animation
  resizeCanvas();
  initParticles();
  animate();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
  });
  
  // Cleanup function
  window.addEventListener('beforeunload', () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });
}

/**
 * Initialize all animations when DOM is ready
 */
function initAnimations() {
  initScrollAnimations();
  initHoverEffects();
  initParticleAnimation();
}

// Initialize animations when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  // DOM is already loaded
  initAnimations();
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initScrollAnimations,
    initHoverEffects,
    initParticleAnimation,
    initAnimations
  };
}

console.log('Animations module loaded');
