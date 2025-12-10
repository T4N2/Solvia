# Solvia Nova Portfolio Website

Modern futuristic portfolio website for Solvia Nova software house agency.

## Tech Stack

- **Runtime**: Bun
- **Backend Framework**: Elysia.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript

## Prerequisites

Before running this project, you need to install Bun:

### Installing Bun

**Windows (PowerShell):**
```powershell
powershell -c "irm bun.sh/install.ps1|iex"
```

**macOS/Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

For more installation options, visit: https://bun.sh/docs/installation

## Setup

1. Install dependencies:
```bash
bun install
```

2. Run the development server:
```bash
bun run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
solvia-nova-portfolio/
├── src/
│   └── index.ts          # Main Elysia.js server
├── public/
│   ├── index.html        # Main HTML file
│   ├── css/
│   │   └── styles.css    # Main stylesheet
│   ├── js/
│   │   ├── navigation.js
│   │   ├── hero.js
│   │   ├── portfolio.js
│   │   ├── testimonials.js
│   │   ├── contact.js
│   │   └── animations.js
│   └── images/           # Image assets
├── data/                 # JSON data files
└── package.json
```

## Development

The project uses Bun's fast runtime and Elysia.js for optimal performance. Static files are served from the `public/` directory.

## Requirements

This project implements requirements 10.1 and 10.2 from the specification:
- Uses Bun as the JavaScript runtime
- Uses Elysia.js framework for the backend
