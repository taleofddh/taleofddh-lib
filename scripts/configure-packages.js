#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');

// Function to update package.json files
function updatePackageJson(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`Skipping ${packagePath} - no package.json found`);
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add publishConfig if it doesn't exist
    if (!packageJson.publishConfig) {
      packageJson.publishConfig = {
        registry: "https://npm.pkg.github.com/"
      };
      
      // Remove private flag if it exists
      if (packageJson.private) {
        delete packageJson.private;
      }
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`Updated ${packageJsonPath}`);
    } else {
      console.log(`${packageJsonPath} already configured`);
    }
  } catch (error) {
    console.error(`Error updating ${packageJsonPath}:`, error.message);
  }
}

// Update all service packages
const servicesDir = path.join(rootDir, 'services');
const servicePackages = fs.readdirSync(servicesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules')
  .map(dirent => path.join(servicesDir, dirent.name));

console.log('Updating service packages...');
servicePackages.forEach(updatePackageJson);

// Update all utility packages
const utilitiesDir = path.join(rootDir, 'utilities');
const utilityPackages = fs.readdirSync(utilitiesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules')
  .map(dirent => path.join(utilitiesDir, dirent.name));

console.log('Updating utility packages...');
utilityPackages.forEach(updatePackageJson);

console.log('Package configuration complete!');