#!/usr/bin/env bun

/**
 * Force Refresh Script
 * Adds cache-busting parameters to force browser refresh
 */

console.log('🔄 Force Refresh Instructions');
console.log('============================\n');

console.log('Untuk memastikan perubahan terlihat, lakukan:');
console.log('');
console.log('1. 🌐 Buka browser dan kunjungi:');
console.log('   http://localhost:3000');
console.log('');
console.log('2. 🔄 Hard Refresh (pilih salah satu):');
console.log('   • Windows/Linux: Ctrl + Shift + R');
console.log('   • Windows/Linux: Ctrl + F5');
console.log('   • Mac: Cmd + Shift + R');
console.log('');
console.log('3. 🧪 Test preview contact section:');
console.log('   Buka file: test-contact-section.html');
console.log('');
console.log('4. 🔍 Cek Developer Tools:');
console.log('   • Tekan F12');
console.log('   • Klik tab Network');
console.log('   • Refresh halaman');
console.log('   • Pastikan styles.css dimuat ulang');
console.log('');

const timestamp = new Date().toISOString();
console.log(`⏰ Timestamp: ${timestamp}`);
console.log('');

console.log('🎯 Yang Seharusnya Terlihat:');
console.log('• Spacing contact info lebih rapat');
console.log('• Social media dengan icon SVG (bukan text)');
console.log('• Hover effects dengan warna platform');
console.log('');

console.log('💡 Jika masih bermasalah:');
console.log('• Coba browser lain (Chrome, Firefox, Edge)');
console.log('• Disable cache di Developer Tools');
console.log('• Restart server: Ctrl+C lalu bun run dev');