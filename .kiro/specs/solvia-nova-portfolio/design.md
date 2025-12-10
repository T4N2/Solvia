# Design Document - Solvia Nova Portfolio Website

## Overview

Solvia Nova adalah website portofolio modern untuk software house agency yang dibangun menggunakan Bun runtime dan Elysia.js framework. Website ini menampilkan tema futuristik midnight blue dengan fokus pada performa tinggi, user experience yang engaging, dan presentasi profesional dari layanan dan portfolio agency.

Arsitektur aplikasi menggunakan pendekatan server-side rendering (SSR) dengan Elysia.js untuk routing dan API endpoints, serta frontend interaktif menggunakan vanilla JavaScript atau framework ringan untuk animasi dan interaktivitas.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │         HTML/CSS/JS (Frontend)                    │  │
│  │  - Hero Section                                   │  │
│  │  - About Us                                       │  │
│  │  - Services                                       │  │
│  │  - Portfolio                                      │  │
│  │  - Testimonials                                   │  │
│  │  - Contact Form                                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Elysia.js Server (Bun Runtime)             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Static File Serving                              │  │
│  │  - HTML Pages                                     │  │
│  │  - CSS Stylesheets                                │  │
│  │  - JavaScript Files                               │  │
│  │  - Images & Assets                                │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Endpoints                                    │  │
│  │  - POST /api/contact (Contact Form Submission)    │  │
│  │  - GET /api/portfolio (Portfolio Data)            │  │
│  │  - GET /api/testimonials (Testimonial Data)       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Storage                           │
│  - JSON files for portfolio & testimonials              │
│  - Email service integration for contact form           │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Runtime**: Bun (fast JavaScript runtime)
- **Backend Framework**: Elysia.js (lightweight, type-safe web framework)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with CSS Variables for theming
- **Animations**: CSS Animations + Intersection Observer API
- **Email**: Nodemailer or similar for contact form
- **Deployment**: Static hosting with Bun server

## Components and Interfaces

### 1. Server Components

#### Main Server (src/index.ts)
```typescript
interface ServerConfig {
  port: number;
  hostname: string;
}

interface ElysiaApp {
  listen(config: ServerConfig): void;
  get(path: string, handler: RouteHandler): ElysiaApp;
  post(path: string, handler: RouteHandler): ElysiaApp;
  static(path: string, options?: StaticOptions): ElysiaApp;
}
```

#### API Handlers (src/api/)

**Contact Handler**
```typescript
interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  serviceInterest?: string;
}

interface ContactResponse {
  success: boolean;
  message: string;
}

function handleContactSubmission(data: ContactFormData): Promise<ContactResponse>;
```

**Portfolio Handler**
```typescript
interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  technologies: string[];
  category: string;
  detailedDescription?: string;
  images?: string[];
}

function getPortfolioItems(filter?: string): Promise<PortfolioItem[]>;
```

**Testimonial Handler**
```typescript
interface Testimonial {
  id: string;
  clientName: string;
  company: string;
  text: string;
  photo?: string;
  rating?: number;
}

function getTestimonials(): Promise<Testimonial[]>;
```

### 2. Frontend Components

#### Navigation Component (public/js/navigation.js)
```typescript
interface NavigationConfig {
  links: NavigationLink[];
  stickyOffset: number;
}

interface NavigationLink {
  label: string;
  target: string;
}

class Navigation {
  init(): void;
  handleScroll(): void;
  smoothScrollTo(target: string): void;
  updateActiveLink(): void;
}
```

#### Hero Section (public/js/hero.js)
```typescript
interface HeroConfig {
  animationDuration: number;
  particleCount: number;
}

class HeroSection {
  init(): void;
  animateText(): void;
  initParticles(): void;
}
```

#### Portfolio Gallery (public/js/portfolio.js)
```typescript
interface PortfolioGalleryConfig {
  itemsPerPage: number;
  filterOptions: string[];
}

class PortfolioGallery {
  init(): void;
  loadItems(): Promise<void>;
  filterByCategory(category: string): void;
  openModal(itemId: string): void;
  closeModal(): void;
}
```

#### Testimonial Carousel (public/js/testimonials.js)
```typescript
interface CarouselConfig {
  autoPlayInterval: number;
  transitionDuration: number;
}

class TestimonialCarousel {
  init(): void;
  loadTestimonials(): Promise<void>;
  next(): void;
  previous(): void;
  goTo(index: number): void;
  startAutoPlay(): void;
  stopAutoPlay(): void;
}
```

#### Contact Form (public/js/contact.js)
```typescript
interface FormValidationRules {
  name: ValidationRule;
  email: ValidationRule;
  phone?: ValidationRule;
  message: ValidationRule;
}

interface ValidationRule {
  required: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
}

class ContactForm {
  init(): void;
  validate(): boolean;
  showError(field: string, message: string): void;
  clearErrors(): void;
  submit(): Promise<void>;
  showSuccess(): void;
}
```

## Data Models

### Portfolio Item Model
```typescript
interface PortfolioItem {
  id: string;                    // Unique identifier
  title: string;                 // Project title
  description: string;           // Short description
  thumbnail: string;             // Thumbnail image URL
  technologies: string[];        // Array of technologies used
  category: string;              // Project category (web, mobile, etc)
  detailedDescription?: string;  // Full project description
  images?: string[];             // Additional project images
  clientName?: string;           // Client name (optional)
  projectUrl?: string;           // Live project URL (optional)
  completedDate?: string;        // Completion date
}
```

### Service Package Model
```typescript
interface ServicePackage {
  id: string;                    // Unique identifier
  name: string;                  // Package name
  description: string;           // Package description
  features: string[];            // List of features
  price: string;                 // Price (can be "Custom" or specific amount)
  popular?: boolean;             // Highlight as popular package
  icon?: string;                 // Icon identifier
}
```

### Testimonial Model
```typescript
interface Testimonial {
  id: string;                    // Unique identifier
  clientName: string;            // Client name
  company: string;               // Company name
  text: string;                  // Testimonial text
  photo?: string;                // Client photo URL
  rating?: number;               // Rating (1-5)
  position?: string;             // Client position/title
}
```

### Contact Form Submission Model
```typescript
interface ContactSubmission {
  name: string;                  // Sender name
  email: string;                 // Sender email
  phone?: string;                // Sender phone (optional)
  message: string;               // Message content
  serviceInterest?: string;      // Selected service package
  timestamp: Date;               // Submission timestamp
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Service package rendering completeness
*For any* service package data, when rendered to HTML, the output should contain the package name, description, features list, and pricing information.
**Validates: Requirements 3.2**

### Property 2: Portfolio item rendering completeness
*For any* portfolio item data, when rendered to HTML, the output should contain the project thumbnail, title, description, and technologies used.
**Validates: Requirements 4.2**

### Property 3: Portfolio filtering correctness
*For any* set of portfolio items and any filter criteria (technology or category), the filtered results should only include items that match the filter criteria.
**Validates: Requirements 4.4**

### Property 4: Testimonial rendering completeness
*For any* testimonial data, when rendered to HTML, the output should contain the client name, company, and testimonial text (photo is optional).
**Validates: Requirements 5.2**

### Property 5: Testimonial carousel navigation
*For any* carousel state with multiple testimonials, calling next() or previous() should change the active testimonial index appropriately (with wrapping at boundaries).
**Validates: Requirements 5.4**

### Property 6: Form validation for required fields
*For any* contact form data with one or more missing required fields (name, email, message), the validation function should return false and identify the invalid fields.
**Validates: Requirements 6.2**

### Property 7: Form validation error display
*For any* invalid form field, when validation fails, an error message should be displayed for that specific field.
**Validates: Requirements 6.3**

### Property 8: Valid form submission success
*For any* valid contact form data (all required fields present and properly formatted), submission should succeed and return a success response.
**Validates: Requirements 6.4**

### Property 9: Contact link protocol correctness
*For any* email address or phone number, the generated link should use the correct protocol (mailto: for email, tel: for phone).
**Validates: Requirements 7.3**

### Property 10: Social media link target attribute
*For any* social media link, the anchor element should have target="_blank" attribute to open in a new tab.
**Validates: Requirements 7.4**

### Property 11: Touch target minimum size
*For any* interactive element on mobile viewport, the element should have minimum dimensions of 44x44 pixels for accessibility.
**Validates: Requirements 8.5**

### Property 12: Navigation active state tracking
*For any* scroll position on the page, the navigation menu should highlight the link corresponding to the currently visible section.
**Validates: Requirements 9.2**

### Property 13: Static asset cache headers
*For any* static asset request (CSS, JS, images), the response should include appropriate cache-control headers.
**Validates: Requirements 10.3**

### Property 14: Viewport animation triggers
*For any* page element with animation enabled, when the element enters the viewport, the animation should be triggered.
**Validates: Requirements 11.1**

### Property 15: Reduced motion accessibility
*For any* user with prefers-reduced-motion preference enabled, animations should be disabled or significantly reduced.
**Validates: Requirements 11.5**

## Error Handling

### Client-Side Error Handling

**Form Validation Errors**
- Display inline error messages below invalid fields
- Use red color (#FF4444) with sufficient contrast for error text
- Prevent form submission until all errors are resolved
- Clear errors when user corrects the input

**Network Errors**
- Display user-friendly error messages for failed API calls
- Implement retry mechanism for transient failures
- Show offline indicator when network is unavailable
- Cache form data locally to prevent data loss

**Resource Loading Errors**
- Implement fallback images for failed image loads
- Show placeholder content while data is loading
- Handle missing or malformed API responses gracefully

### Server-Side Error Handling

**API Endpoint Errors**
- Return appropriate HTTP status codes (400 for validation, 500 for server errors)
- Include descriptive error messages in JSON response
- Log errors for debugging and monitoring
- Implement rate limiting to prevent abuse

**Email Sending Errors**
- Retry failed email sends with exponential backoff
- Log failed submissions for manual follow-up
- Return user-friendly error message without exposing internal details

**Validation Errors**
- Validate all input data on server-side
- Return specific validation errors for each field
- Sanitize input to prevent XSS and injection attacks

## Testing Strategy

### Unit Testing

Unit tests will verify specific functionality and edge cases:

**Form Validation Tests**
- Test email format validation with valid and invalid emails
- Test required field validation
- Test phone number format validation (if implemented)
- Test message length constraints

**Data Rendering Tests**
- Test portfolio item rendering with complete data
- Test portfolio item rendering with missing optional fields
- Test service package rendering
- Test testimonial rendering with and without photos

**Navigation Tests**
- Test smooth scroll to section
- Test active link highlighting
- Test mobile menu toggle

**API Endpoint Tests**
- Test contact form submission with valid data
- Test contact form submission with invalid data
- Test portfolio data retrieval
- Test testimonial data retrieval

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using **fast-check** library for JavaScript/TypeScript. Each test will run a minimum of 100 iterations.

**Testing Framework**: fast-check (https://github.com/dubzzz/fast-check)

**Property Test Requirements**:
- Each property-based test MUST run at least 100 iterations
- Each test MUST be tagged with a comment referencing the correctness property from this design document
- Tag format: `// Feature: solvia-nova-portfolio, Property {number}: {property_text}`
- Each correctness property MUST be implemented by a SINGLE property-based test

**Property Tests to Implement**:

1. Service package rendering completeness (Property 1)
2. Portfolio item rendering completeness (Property 2)
3. Portfolio filtering correctness (Property 3)
4. Testimonial rendering completeness (Property 4)
5. Testimonial carousel navigation (Property 5)
6. Form validation for required fields (Property 6)
7. Form validation error display (Property 7)
8. Valid form submission success (Property 8)
9. Contact link protocol correctness (Property 9)
10. Social media link target attribute (Property 10)
11. Touch target minimum size (Property 11)
12. Navigation active state tracking (Property 12)
13. Static asset cache headers (Property 13)
14. Viewport animation triggers (Property 14)
15. Reduced motion accessibility (Property 15)

### Integration Testing

Integration tests will verify end-to-end workflows:

- Complete contact form submission flow (form fill → validation → API call → success message)
- Portfolio filtering and modal display flow
- Testimonial carousel auto-play and manual navigation
- Mobile menu interaction flow
- Smooth scroll navigation flow

### Visual Regression Testing

- Capture screenshots of key pages and components
- Compare against baseline to detect unintended visual changes
- Test responsive layouts at different breakpoints (mobile, tablet, desktop)

## Styling and Theme

### Color Palette (Midnight Blue Futuristic Theme)

**Primary Colors**
- Primary Dark: `#0A0E27` (Deep midnight blue)
- Primary: `#1A1F3A` (Midnight blue)
- Primary Light: `#2D3561` (Lighter midnight blue)
- Accent: `#00D9FF` (Cyan blue - futuristic accent)
- Accent Secondary: `#7B2FFF` (Purple - secondary accent)

**Neutral Colors**
- White: `#FFFFFF`
- Light Gray: `#E5E7EB`
- Gray: `#9CA3AF`
- Dark Gray: `#374151`

**Semantic Colors**
- Success: `#10B981`
- Error: `#EF4444`
- Warning: `#F59E0B`

### Typography

**Font Families**
- Headings: 'Inter', 'Segoe UI', sans-serif (modern, clean)
- Body: 'Inter', 'Segoe UI', sans-serif
- Code/Technical: 'Fira Code', monospace (for technical details)

**Font Sizes**
- Hero Title: 3.5rem (56px) desktop, 2.5rem (40px) mobile
- Section Title: 2.5rem (40px) desktop, 2rem (32px) mobile
- Subsection Title: 1.75rem (28px)
- Body Large: 1.25rem (20px)
- Body: 1rem (16px)
- Body Small: 0.875rem (14px)

### Spacing System

Using 8px base unit:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
- 4xl: 96px

### Animation Guidelines

**Timing Functions**
- Ease Out: `cubic-bezier(0.33, 1, 0.68, 1)` - for entrances
- Ease In Out: `cubic-bezier(0.65, 0, 0.35, 1)` - for transitions
- Spring: `cubic-bezier(0.34, 1.56, 0.64, 1)` - for playful interactions

**Duration**
- Fast: 150ms - micro-interactions
- Normal: 300ms - standard transitions
- Slow: 500ms - page transitions, complex animations

**Futuristic Effects**
- Glow effects using box-shadow with accent colors
- Gradient backgrounds with subtle animation
- Particle effects in hero section
- Smooth fade-in animations on scroll
- Hover effects with scale and glow

### Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- Large Desktop: > 1440px

## Performance Considerations

### Optimization Strategies

**Image Optimization**
- Use WebP format with JPEG fallback
- Implement lazy loading for below-fold images
- Serve responsive images using srcset
- Compress images to appropriate quality levels

**Code Splitting**
- Load JavaScript modules on-demand
- Defer non-critical JavaScript
- Inline critical CSS for above-fold content

**Caching Strategy**
- Cache static assets with long expiration (1 year)
- Use ETags for cache validation
- Implement service worker for offline support (optional)

**Bundle Optimization**
- Minify CSS and JavaScript
- Remove unused CSS
- Tree-shake JavaScript dependencies

### Performance Targets

- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

## Security Considerations

### Input Validation
- Validate all user input on both client and server
- Sanitize HTML to prevent XSS attacks
- Use parameterized queries to prevent SQL injection (if database is added)
- Implement CSRF protection for form submissions

### Content Security Policy
- Implement strict CSP headers
- Whitelist allowed sources for scripts, styles, and images
- Prevent inline script execution

### HTTPS
- Enforce HTTPS in production
- Implement HSTS headers
- Use secure cookies

### Rate Limiting
- Limit contact form submissions per IP address
- Implement exponential backoff for failed attempts
- Add CAPTCHA for additional protection (optional)

## Deployment Strategy

### Build Process
1. Install dependencies using Bun
2. Minify and bundle CSS/JavaScript
3. Optimize images
4. Generate production build

### Environment Configuration
- Development: Local Bun server with hot reload
- Staging: Test environment with production-like setup
- Production: Optimized build with caching and CDN

### Monitoring
- Log server errors and exceptions
- Track form submission success/failure rates
- Monitor page load performance
- Set up alerts for critical errors

## Future Enhancements

### Phase 2 Features
- Blog section for company updates and insights
- Case study pages with detailed project breakdowns
- Client portal for project tracking
- Multi-language support (Indonesian and English)
- Dark/light theme toggle
- Advanced portfolio filtering with search

### Technical Improvements
- Implement full-text search for portfolio
- Add GraphQL API for more flexible data queries
- Implement real-time chat widget
- Add analytics dashboard for admin
- Progressive Web App (PWA) capabilities
