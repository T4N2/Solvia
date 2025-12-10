#!/usr/bin/env bun

/**
 * Website Health Check Script
 * Checks if all required files are accessible
 */

const BASE_URL = 'http://localhost:3000';

const requiredFiles = [
  '/',
  '/css/styles.css',
  '/js/navigation.js',
  '/js/hero.js',
  '/js/services.js',
  '/js/portfolio.js',
  '/js/testimonials.js',
  '/js/contact.js',
  '/js/animations.js',
  '/data/services.json',
  '/data/portfolio.json',
  '/data/testimonials.json'
];

async function checkFile(path) {
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    const status = response.status;
    const size = response.headers.get('content-length') || 'unknown';
    
    if (status === 200) {
      console.log(`✅ ${path} - OK (${size} bytes)`);
      return true;
    } else {
      console.log(`❌ ${path} - Error ${status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${path} - Failed to fetch: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Checking Solvia Nova Portfolio Health...\n');
  console.log(`Server: ${BASE_URL}\n`);
  
  let allGood = true;
  
  for (const file of requiredFiles) {
    const isOk = await checkFile(file);
    if (!isOk) allGood = false;
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allGood) {
    console.log('🎉 All files are accessible! Website should work properly.');
    console.log(`\n👉 Open your browser and visit: ${BASE_URL}`);
  } else {
    console.log('⚠️  Some files are missing or inaccessible.');
    console.log('   Check the errors above and fix them.');
  }
  
  console.log('\n💡 Tips:');
  console.log('   - Make sure server is running: bun run dev');
  console.log('   - Check browser console (F12) for JavaScript errors');
  console.log('   - Try hard refresh: Ctrl+Shift+R');
}

main().catch(console.error);