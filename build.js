#!/usr/bin/env node
import { mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

console.log('📦 Building Newsly AI for Vercel...');

// Create output directory structure
const outputDir = '.vercel/output';
const staticDir = join(outputDir, 'static');

try {
  mkdirSync(staticDir, { recursive: true });
  console.log('✅ Created output directories');

  // Copy HTML files
  ['index.html', 'dashboard.html', 'settings.html'].forEach(file => {
    copyFileSync(file, join(staticDir, file));
    console.log(`✅ Copied ${file}`);
  });

  // Copy public directory
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

  copyDir('public', join(staticDir, 'public'));
  console.log('✅ Copied public/ directory');

  // Create config.json for Vercel Build Output API
  const config = {
    version: 3
  };

  const configPath = join(outputDir, 'config.json');
  const { writeFileSync } = await import('fs');
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Created config.json');

  console.log('🎉 Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
