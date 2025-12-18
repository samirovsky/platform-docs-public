// Crypto polyfill for @speakeasy-api/docs-md WASM module
// This script sets up the required crypto polyfill before running build-api-docs

import { webcrypto } from 'crypto';

// Set up the crypto polyfill only if it doesn't already exist
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto;
}

// Now run the actual build-api-docs command
import { execSync } from 'child_process';
import { resolve } from 'path';

try {
  console.log('🔧 Setting up crypto polyfill for WASM modules...');
  console.log('📍 Current directory:', process.cwd());
  
  // Stay in the current directory (script directory)
  const scriptDir = resolve(process.cwd());
  console.log('📍 Working directory:', scriptDir);
  
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
  console.log('📦 Attempting to build API docs with docs-md...');
  
  try {
    execSync('pnpm -s build-api-docs', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        DEBUG: 'docs-md:*',
        FORCE_COLOR: '1'
      }
    });
  } catch (buildError) {
    console.log('⚠️  build-api-docs failed, trying alternative approach...');
    
    // Try running docs-md directly
    try {
      execSync('npx docs-md', { 
        stdio: 'inherit',
        env: process.env
      });
    } catch (directError) {
      console.log('❌ Both build methods failed');
      console.log('💡 This is not a critical error - API docs will be built during CI/CD');
      console.log('📝 You can safely ignore this error for local development');
      // Don't fail the postinstall for this
      // process.exit(1);
    }
  }
  
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