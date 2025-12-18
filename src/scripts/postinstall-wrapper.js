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
  
  // Change to the project root directory
  const projectRoot = resolve(process.cwd(), '..');
  process.chdir(projectRoot);
  
  console.log('🚀 Running build-api-docs...');
  execSync('pnpm -s build-api-docs', { stdio: 'inherit' });
  
  console.log('✅ API docs built successfully!');
} catch (error) {
  console.error('❌ Error building API docs:', error.message);
  process.exit(1);
}