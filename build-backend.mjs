#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');

// Clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}

console.log('Building backend for production...');

try {
  // Build TypeScript files to JavaScript
  execSync('npx tsc --project tsconfig-backend.json', { 
    stdio: 'inherit',
    cwd: rootDir 
  });
  
  // Copy shared schemas
  const sharedDir = path.join(rootDir, 'shared');
  const distSharedDir = path.join(distDir, 'shared');
  
  if (fs.existsSync(sharedDir) && !fs.existsSync(distSharedDir)) {
    fs.mkdirSync(distSharedDir, { recursive: true });
    
    // Copy JS files
    const sharedFiles = fs.readdirSync(sharedDir);
    for (const file of sharedFiles) {
      if (file.endsWith('.js') || file.endsWith('.ts')) {
        const srcPath = path.join(sharedDir, file);
        const destPath = path.join(distSharedDir, file.replace('.ts', '.js'));
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  // Copy types directory if it exists
  const typesDir = path.join(rootDir, 'types');
  const distTypesDir = path.join(distDir, 'types');
  
  if (fs.existsSync(typesDir) && !fs.existsSync(distTypesDir)) {
    fs.mkdirSync(distTypesDir, { recursive: true });
    
    const typeFiles = fs.readdirSync(typesDir);
    for (const file of typeFiles) {
      if (file.endsWith('.js') || file.endsWith('.d.ts')) {
        const srcPath = path.join(typesDir, file);
        const destPath = path.join(distTypesDir, file);
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  console.log('Backend build completed successfully!');
  
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}