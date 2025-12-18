// Crypto polyfill for @speakeasy-api/docs-md WASM module
// This script sets up the required crypto polyfill before running build-api-docs

import { webcrypto } from 'crypto';

// Set up the crypto polyfill
globalThis.crypto = webcrypto;

// Now run the actual build-api-docs command
import { execSync } from 'child_process';
import { resolve } from 'path';

try {
  console.log('🔧 Setting up crypto polyfill for WASM modules...');
  console.log('📍 Current directory:', process.cwd());
  
  // Change to the project root directory
  const projectRoot = resolve(process.cwd(), '..');
  console.log('📍 Changing to project root:', projectRoot);
  process.chdir(projectRoot);
  console.log('📍 New directory:', process.cwd());
  
  console.log('🚀 Running build-api-docs...');
  console.log('📦 Checking if docs-md is available...');
  
  // Check if docs-md is available
  try {
    execSync('npx docs-md --version', { stdio: 'pipe' });
    console.log('✅ docs-md is available');
  } catch (versionError) {
    console.log('⚠️  docs-md not found in PATH, trying alternative...');
  }
  
  // Run build-api-docs with better error handling
  execSync('pnpm -s build-api-docs', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      DEBUG: 'docs-md:*'
    }
  });
  
  console.log('✅ API docs built successfully!');
} catch (error) {
  console.error('❌ Error building API docs:', error.message);
  console.error('📋 Stack trace:', error.stack);
  
  if (error.stdout) {
    console.error('📝 STDOUT:', error.stdout.toString());
  }
  
  if (error.stderr) {
    console.error('📝 STDERR:', error.stderr.toString());
  }
  
  console.log('\n💡 Troubleshooting tips:');
  console.log('1. Ensure docs-md is installed: pnpm install');
  console.log('2. Check crypto polyfill is working: node -e "console.log(typeof globalThis.crypto)"');
  console.log('3. Try running manually: pnpm -s build-api-docs');
  console.log('4. Check Makefile for alternative build: make build');
  
  process.exit(1);
}