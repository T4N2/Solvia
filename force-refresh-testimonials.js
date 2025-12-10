// Force Refresh Testimonials - Clear Cache and Reload Data
// Run this in browser console to force refresh testimonial data

console.log('🔄 Force refreshing testimonials data...');

// Clear all relevant caches
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
    console.log('✅ Service Worker caches cleared');
  });
}

// Clear localStorage and sessionStorage
localStorage.clear();
sessionStorage.clear();
console.log('✅ Local storage cleared');

// Force reload testimonials with cache busting
async function forceReloadTestimonials() {
  try {
    // Add multiple cache busting parameters
    const cacheBuster = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    
    const response = await fetch(`/data/testimonials.json?v=${cacheBuster}&r=${randomId}&nocache=true`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Fresh testimonials data loaded:', data);
    
    // Force re-render testimonials
    if (typeof loadTestimonials === 'function') {
      await loadTestimonials();
      console.log('✅ Testimonials re-rendered');
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Error loading fresh testimonials:', error);
    throw error;
  }
}

// Execute the refresh
forceReloadTestimonials()
  .then(() => {
    console.log('🎉 Testimonials force refresh completed!');
    console.log('💡 If photos still look old, try:');
    console.log('   1. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)');
    console.log('   2. Open DevTools > Application > Storage > Clear storage');
    console.log('   3. Disable cache in DevTools Network tab');
  })
  .catch((error) => {
    console.error('💥 Force refresh failed:', error);
    console.log('🔧 Manual steps:');
    console.log('   1. Press Ctrl+Shift+Delete to open Clear browsing data');
    console.log('   2. Select "Cached images and files"');
    console.log('   3. Click "Clear data"');
    console.log('   4. Refresh the page');
  });

// Also try to reload the entire page after a short delay
setTimeout(() => {
  console.log('🔄 Performing hard page reload...');
  window.location.reload(true);
}, 2000);