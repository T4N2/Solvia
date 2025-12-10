#!/usr/bin/env bun

/**
 * Create Share Package Script
 * Membuat ZIP file yang bersih untuk dibagikan
 */

import { $ } from "bun";
import { existsSync } from "fs";

console.log('📦 Creating Solvia Nova Share Package...\n');

// Files dan folders yang akan di-exclude
const excludeItems = [
  'node_modules',
  '.git',
  'bun.lockb',
  '*.log',
  '.DS_Store',
  'Thumbs.db',
  '.vscode',
  '.idea',
  'dist',
  '*.tmp',
  '*.temp'
];

const packageName = `solvia-nova-portfolio-${new Date().toISOString().split('T')[0]}.zip`;

console.log('🔍 Checking required files...');

// Check essential files
const essentialFiles = [
  'package.json',
  'src/index.ts',
  'public/index.html',
  'public/css/styles.css',
  'data/services.json',
  'data/portfolio.json',
  'data/testimonials.json'
];

let allFilesExist = true;
essentialFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n⚠️  Some essential files are missing!');
  process.exit(1);
}

console.log('\n📋 Package will include:');
console.log('• Source code (src/)');
console.log('• Public files (public/)');
console.log('• Data files (data/)');
console.log('• Configuration files');
console.log('• Documentation');

console.log('\n🚫 Package will exclude:');
excludeItems.forEach(item => console.log(`• ${item}`));

console.log(`\n📦 Creating: ${packageName}`);
console.log('⏳ This may take a moment...\n');

// Create the package
try {
  // Use PowerShell Compress-Archive on Windows
  await $`powershell -Command "Compress-Archive -Path * -DestinationPath ${packageName} -Exclude ${excludeItems.join(',')}"`;
  
  console.log('✅ Package created successfully!');
  console.log(`📁 File: ${packageName}`);
  
  // Get file size
  const stats = await Bun.file(packageName).size;
  const sizeMB = (stats / (1024 * 1024)).toFixed(2);
  console.log(`📊 Size: ${sizeMB} MB`);
  
} catch (error) {
  console.log('❌ Failed to create package with PowerShell, trying alternative method...');
  
  // Alternative: Create a simple copy instruction
  console.log('\n📋 Manual Package Instructions:');
  console.log('1. Create a new folder: solvia-nova-portfolio');
  console.log('2. Copy these folders/files:');
  console.log('   • src/');
  console.log('   • public/');
  console.log('   • data/');
  console.log('   • package.json');
  console.log('   • README.md (if exists)');
  console.log('3. DO NOT copy: node_modules, .git, bun.lockb');
  console.log('4. ZIP the folder');
}

console.log('\n🎯 Instructions for your friend:');
console.log('1. Extract the ZIP file');
console.log('2. Open terminal in the extracted folder');
console.log('3. Run: bun install');
console.log('4. Run: bun run dev');
console.log('5. Open: http://localhost:3000');

console.log('\n💡 Alternative sharing methods:');
console.log('• GitHub repository (recommended)');
console.log('• Google Drive / Dropbox');
console.log('• WeTransfer for large files');
console.log('• Email (if under 25MB)');