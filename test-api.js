#!/usr/bin/env bun

/**
 * Test API Endpoints
 */

console.log('🧪 Testing API Endpoints...\n');

async function testEndpoint(url, name) {
  try {
    console.log(`📡 Testing ${name}...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`❌ ${name}: HTTP ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ ${name}: OK`);
    
    if (name === 'Services API') {
      console.log(`📋 First service: "${data.data?.[0]?.name || data[0]?.name}"`);
      console.log(`🌐 Language: ${data.data?.[0]?.name?.includes('Pengembangan') || data[0]?.name?.includes('Pengembangan') ? 'Indonesian ✅' : 'English ❌'}`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

async function main() {
  const baseUrl = 'http://localhost:3000';
  
  const tests = [
    [`${baseUrl}/`, 'Main Page'],
    [`${baseUrl}/data/services.json`, 'Services Data (Direct)'],
    [`${baseUrl}/api/portfolio`, 'Portfolio API'],
    [`${baseUrl}/api/testimonials`, 'Testimonials API']
  ];
  
  for (const [url, name] of tests) {
    await testEndpoint(url, name);
    console.log('');
  }
  
  console.log('🎯 Solusi jika data masih bahasa Inggris:');
  console.log('1. Hard refresh browser: Ctrl + Shift + R');
  console.log('2. Clear browser cache');
  console.log('3. Buka Incognito/Private mode');
  console.log('4. Disable cache di Developer Tools (F12 → Network → Disable cache)');
}

main().catch(console.error);