# 🚀 Solvia Nova Portfolio

Modern portfolio website for software house agency built with Bun and Elysia.js featuring a futuristic midnight blue theme.

![Solvia Nova Portfolio](https://img.shields.io/badge/Status-Ready-brightgreen)
![Bun](https://img.shields.io/badge/Runtime-Bun-black)
![Elysia.js](https://img.shields.io/badge/Framework-Elysia.js-blue)

## ✨ Features

- 🎨 **Modern Design** - Futuristic midnight blue theme with smooth animations
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- ⚡ **High Performance** - Built with Bun runtime for optimal speed
- 🎭 **Smooth Animations** - CSS animations with Intersection Observer API
- 📧 **Working Contact Form** - Integrated email functionality with validation
- 🔧 **Easy Customization** - JSON-based content management
- 🎯 **SEO Optimized** - Proper meta tags and semantic HTML
- ♿ **Accessible** - WCAG 2.1 AA compliant with keyboard navigation

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Backend**: [Elysia.js](https://elysiajs.com/) - Lightweight web framework
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with CSS Variables and Grid/Flexbox
- **Email**: Nodemailer for contact form functionality
- **Testing**: Bun test with property-based testing (fast-check)

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) installed on your system

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/solvia-nova-portfolio.git
   cd solvia-nova-portfolio
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Start development server**:
   ```bash
   bun run dev
   ```

4. **Open your browser**:
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
solvia-nova-portfolio/
├── 📁 src/
│   ├── index.ts              # Main server file
│   └── 📁 api/              # API endpoints
│       ├── contact.ts        # Contact form handler
│       └── *.test.ts        # API tests
├── 📁 public/
│   ├── index.html           # Main HTML file
│   ├── 📁 css/             # Stylesheets
│   │   └── styles.css       # Main stylesheet
│   └── 📁 js/              # JavaScript modules
│       ├── navigation.js    # Navigation functionality
│       ├── hero.js         # Hero section animations
│       ├── services.js     # Services section
│       ├── portfolio.js    # Portfolio gallery
│       ├── testimonials.js # Testimonial carousel
│       ├── contact.js      # Contact form
│       └── animations.js   # Animation utilities
├── 📁 data/
│   ├── services.json        # Service packages data
│   ├── portfolio.json       # Portfolio projects data
│   └── testimonials.json    # Client testimonials data
├── 📁 scripts/
│   ├── minify.js           # Build optimization
│   └── optimize-images.js  # Image optimization
└── package.json             # Project configuration
```

## 🎨 Customization Guide

### 🏢 Company Information

**Edit `public/index.html`**:
```html
<!-- Company name in navigation -->
<div class="nav-brand">Your Company Name</div>

<!-- Hero section -->
<h1 class="hero-title">Your Company Name</h1>
<p class="hero-tagline">Your Company Tagline</p>

<!-- Contact information -->
<p><strong>Email:</strong> <a href="mailto:your@email.com">your@email.com</a></p>
<p><strong>Phone:</strong> <a href="tel:+1234567890">+1 234-567-890</a></p>
<p><strong>Address:</strong> Your City, Your Country</p>
```

### 💼 Services

**Edit `data/services.json`**:
```json
{
  "id": "your-service",
  "name": "Service Name",
  "description": "Service description...",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "price": "Starting from $X,XXX",
  "popular": true,
  "icon": "service-icon"
}
```

### 🎯 Portfolio Projects

**Edit `data/portfolio.json`**:
```json
{
  "id": "project-id",
  "title": "Project Title",
  "description": "Project description...",
  "thumbnail": "/images/portfolio/project-thumb.jpg",
  "technologies": ["React", "Node.js", "MongoDB"],
  "category": "web",
  "clientName": "Client Name",
  "projectUrl": "https://project-url.com",
  "completedDate": "2024-01"
}
```

### 💬 Client Testimonials

**Edit `data/testimonials.json`**:
```json
{
  "id": "testimonial-1",
  "clientName": "Client Name",
  "company": "Company Name",
  "text": "Testimonial text...",
  "photo": "/images/testimonials/client.jpg",
  "rating": 5,
  "position": "CEO"
}
```

### 🎨 Theme Colors

**Edit `public/css/styles.css`**:
```css
:root {
  /* Primary Colors */
  --color-primary-dark: #0A0E27;
  --color-primary: #1A1F3A;
  --color-primary-light: #2D3561;
  --color-accent: #00D9FF;
  --color-accent-secondary: #7B2FFF;
  
  /* Customize these colors to match your brand */
}
```

## 📧 Contact Form Setup

The contact form requires email configuration:

1. **Update email settings** in `src/api/contact.ts`
2. **Configure SMTP** credentials for your email provider
3. **Test the form** to ensure emails are sent correctly

## 🧪 Testing

Run the test suite:
```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test src/api/contact.test.ts
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Deploy automatically with zero configuration

### Netlify
1. Connect repository to [Netlify](https://netlify.com)
2. Build command: `bun run build`
3. Publish directory: `public`

### Manual Deployment
1. Run `bun run build` to optimize files
2. Upload the `public` folder to your hosting provider
3. Configure server to serve static files

## 📊 Performance

- ⚡ **First Contentful Paint**: < 1.5s
- 🎯 **Largest Contentful Paint**: < 2.5s
- 🔄 **Time to Interactive**: < 3.5s
- 📱 **Mobile Performance**: 90+ Lighthouse score
- 🖥️ **Desktop Performance**: 95+ Lighthouse score

## 🔧 Development Scripts

```bash
# Development server with hot reload
bun run dev

# Production server
bun run start

# Build optimized files
bun run build

# Optimize images
bun run optimize:images

# Run tests
bun test

# Production build with optimizations
bun run build:prod
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bun Team** - For the amazing JavaScript runtime
- **Elysia.js Team** - For the lightweight web framework
- **Inter Font** - For the beautiful typography
- **Community** - For inspiration and feedback

## 📞 Support

If you have any questions or need help:

- 📧 **Email**: [your-email@domain.com](mailto:your-email@domain.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/solvia-nova-portfolio/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/solvia-nova-portfolio/discussions)

---

<div align="center">

**⭐ Star this repository if it helped you! ⭐**

Made with ❤️ by [Your Name](https://github.com/YOUR_USERNAME)

</div>