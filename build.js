/**
 * Build script for Look-see Chrome Extension.
 * Copies only extension files to dist/, excluding tests, dev configs, and build tooling.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');

// Files and directories to exclude from the packaged extension
const EXCLUDE = new Set([
  'node_modules',
  'tests',
  'dist',
  '.git',
  '.gitignore',
  'package.json',
  'package-lock.json',
  'build.js',
  'jest.config.js',
  'README.md'
]);

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function build() {
  console.log('Building Look-see extension...');
  cleanDir(DIST_DIR);

  const entries = fs.readdirSync(__dirname);
  let fileCount = 0;

  for (const entry of entries) {
    if (EXCLUDE.has(entry)) continue;

    const srcPath = path.join(__dirname, entry);
    const destPath = path.join(DIST_DIR, entry);
    copyRecursive(srcPath, destPath);
    fileCount++;
  }

  console.log(`Build complete. ${fileCount} top-level entries copied to dist/`);
}

build();
