#!/usr/bin/env node
import { mkdirSync, copyFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('📦 Building Newsly AI for Vercel...');

// Create output directory structure
const outputDir = join(__dirname, '.vercel', 'output');
const staticDir = join(outputDir, 'static');

try {
  mkdirSync(staticDir, { recursive: true });
  console.log('✅ Created output directories');

  // Copy HTML files
  ['index.html', 'dashboard.html', 'settings.html'].forEach(file => {
    const src = join(__dirname, file);
    const dest = join(staticDir, file);
    copyFileSync(src, dest);
    console.log(`✅ Copied ${file}`);
  });

  // Copy public directory recursively
  const copyDir = (src, dest) => {
    mkdirSync(dest, { recursive: true });
    const entries = readdirSync(src);

    entries.forEach(entry => {
      const srcPath = join(src, entry);
      const destPath = join(dest, entry);

      if (statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    });
  };

  const publicSrc = join(__dirname, 'public');
  const publicDest = join(staticDir, 'public');
  copyDir(publicSrc, publicDest);
  console.log('✅ Copied public/ directory');

  // Create config.json for Vercel Build Output API v3
  const config = {
    version: 3
  };

  const configPath = join(outputDir, 'config.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Created config.json');

  console.log('🎉 Build completed successfully!');
  console.log(`📁 Output: ${outputDir}`);
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
