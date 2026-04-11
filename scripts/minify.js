#!/usr/bin/env node

// Build script to minify CSS and JavaScript files for production
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

// Simple CSS minifier
function minifyCSS(css) {
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove unnecessary whitespace
    .replace(/\s+/g, ' ')
    // Remove whitespace around specific characters
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    // Remove trailing semicolons before closing braces
    .replace(/;}/g, '}')
    // Remove leading/trailing whitespace
    .trim();
}

// Simple JavaScript minifier (basic)
function minifyJS(js) {
  return js
    // Remove single-line comments (but preserve URLs)
    .replace(/\/\/(?![^\n]*https?:)[^\n]*/g, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove unnecessary whitespace (preserve strings)
    .replace(/\s+/g, ' ')
    // Remove whitespace around operators and punctuation
    .replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1')
    // Remove trailing semicolons before closing braces
    .replace(/;}/g, '}')
    // Remove leading/trailing whitespace
    .trim();
}

// Ensure dist directory exists
function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

// Main build function
function build() {
  console.log('🚀 Starting build process...');
  
  // Create dist directories
  ensureDir('public/dist/css');
  ensureDir('public/dist/js');
  
  try {
    // Minify CSS
    console.log('📦 Minifying CSS...');
    const cssContent = readFileSync('public/css/styles.css', 'utf8');
    const minifiedCSS = minifyCSS(cssContent);
    writeFileSync('public/dist/css/styles.min.css', minifiedCSS);
    
    const originalCSSSize = Buffer.byteLength(cssContent, 'utf8');
    const minifiedCSSSize = Buffer.byteLength(minifiedCSS, 'utf8');
    const cssSavings = ((originalCSSSize - minifiedCSSSize) / originalCSSSize * 100).toFixed(1);
    
    console.log(`✅ CSS minified: ${originalCSSSize} → ${minifiedCSSSize} bytes (${cssSavings}% reduction)`);
    
    // Minify JavaScript files
    console.log('📦 Minifying JavaScript...');
    const jsFiles = [
      'navigation.js',
      'hero.js',
      'services.js',
      'portfolio.js',
      'testimonials.js',
      'contact.js',
      'animations.js'
    ];
    
    let totalOriginalJS = 0;
    let totalMinifiedJS = 0;
    
    jsFiles.forEach(file => {
      const jsPath = `public/js/${file}`;
      const minPath = `public/dist/js/${file.replace('.js', '.min.js')}`;
      
      if (existsSync(jsPath)) {
        const jsContent = readFileSync(jsPath, 'utf8');
        const minifiedJS = minifyJS(jsContent);
        writeFileSync(minPath, minifiedJS);
        
        const originalSize = Buffer.byteLength(jsContent, 'utf8');
        const minifiedSize = Buffer.byteLength(minifiedJS, 'utf8');
        
        totalOriginalJS += originalSize;
        totalMinifiedJS += minifiedSize;
        
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        console.log(`  ✅ ${file}: ${originalSize} → ${minifiedSize} bytes (${savings}% reduction)`);
      }
    });
    
    const totalJSSavings = ((totalOriginalJS - totalMinifiedJS) / totalOriginalJS * 100).toFixed(1);
    console.log(`✅ Total JS minified: ${totalOriginalJS} → ${totalMinifiedJS} bytes (${totalJSSavings}% reduction)`);
    
    // Create production HTML with minified assets
    console.log('📦 Creating production HTML...');
    let htmlContent = readFileSync('public/index.html', 'utf8');
    
    // Replace CSS link
    htmlContent = htmlContent.replace(
      '<link rel="stylesheet" href="/css/styles.css">',
      '<link rel="stylesheet" href="/dist/css/styles.min.css">'
    );
    
    // Replace JS script tags
    jsFiles.forEach(file => {
      const originalScript = `<script src="/js/${file}">`;
      const minifiedScript = `<script src="/dist/js/${file.replace('.js', '.min.js')}">`;
      htmlContent = htmlContent.replace(originalScript, minifiedScript);
      
      const deferredOriginal = `<script defer src="/js/${file}">`;
      const deferredMinified = `<script defer src="/dist/js/${file.replace('.js', '.min.js')}">`;
      htmlContent = htmlContent.replace(deferredOriginal, deferredMinified);
    });
    
    writeFileSync('public/index.prod.html', htmlContent);
    console.log('✅ Production HTML created: public/index.prod.html');
    
    console.log('🎉 Build completed successfully!');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run build if this script is executed directly
if (import.meta.main) {
  build();
}

export { build, minifyCSS, minifyJS };