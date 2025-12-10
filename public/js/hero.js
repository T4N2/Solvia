/**
 * Hero Section Module
 * Handles particle animation and CTA button functionality
 */

class HeroSection {
  constructor() {
    this.canvas = document.getElementById('particles');
    this.ctx = null;
    this.particles = [];
    this.particleCount = 50;
    this.animationId = null;
    this.ctaButton = document.querySelector('.cta-button');
    
    this.init();
  }
  
  init() {
    if (!this.canvas) {
      console.warn('Particles canvas not found');
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    this.createParticles();
    this.animate();
    this.setupCTAButton();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.createParticles();
    });
  }
  
  resizeCanvas() {
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      this.canvas.width = heroSection.offsetWidth;
      this.canvas.height = heroSection.offsetHeight;
    }
  }
  
  createParticles() {
    this.particles = [];
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.particleCount = 10; // Reduce particle count for reduced motion
    }
    
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }
  
  animate() {
    if (!this.ctx) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(0, 217, 255, ${particle.opacity})`;
      this.ctx.fill();
      
      // Draw connections between nearby particles
      this.particles.forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(otherParticle.x, otherParticle.y);
          this.ctx.strokeStyle = `rgba(0, 217, 255, ${0.1 * (1 - distance / 100)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      });
    });
    
    // Continue animation
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  setupCTAButton() {
    if (!this.ctaButton) {
      console.warn('CTA button not found');
      return;
    }
    
    this.ctaButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.scrollToContact();
    });
  }
  
  scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Initialize hero section when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new HeroSection();
  });
} else {
  new HeroSection();
}
