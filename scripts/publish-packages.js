#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');

// Function to publish a package
function publishPackage(packagePath, packageName) {
    console.log(`\n📦 Publishing ${packageName}...`);

    // Store current directory to restore later
    const originalDir = process.cwd();

    try {
        // Check if package.json exists
        const packageJsonPath = path.join(packagePath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            console.error(`❌ No package.json found in ${packagePath}`);
            return false;
        }

        // Change to package directory and publish
        process.chdir(packagePath);
        execSync('npm publish', { stdio: 'inherit' });
        console.log(`✅ Successfully published ${packageName}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to publish ${packageName}:`, error.message);
        return false;
    } finally {
        // Always restore original directory
        process.chdir(originalDir);
    }
}

// Get command line arguments
const args = process.argv.slice(2);
const publishType = args[0] || 'all';

console.log(`🚀 Starting package publishing (type: ${publishType})`);

// Track publishing results
let publishResults = {
    successful: [],
    failed: []
};

if (publishType === 'all' || publishType === 'services') {
    console.log('\n📁 Publishing service packages...');

    // Publish individual service packages
    const servicesDir = path.join(rootDir, 'services');
    const servicePackages = fs.readdirSync(servicesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules')
        .map(dirent => ({ name: dirent.name, path: path.join(servicesDir, dirent.name) }));

    servicePackages.forEach(pkg => {
        const success = publishPackage(pkg.path, `@taleofddh/${pkg.name}`);
        if (success) {
            publishResults.successful.push(`@taleofddh/${pkg.name}`);
        } else {
            publishResults.failed.push(`@taleofddh/${pkg.name}`);
        }
    });

    // Publish services aggregate
    const servicesSuccess = publishPackage(path.join(rootDir, 'services'), '@taleofddh/services');
    if (servicesSuccess) {
        publishResults.successful.push('@taleofddh/services');
    } else {
        publishResults.failed.push('@taleofddh/services');
    }
}

if (publishType === 'all' || publishType === 'utilities') {
    console.log('\n📁 Publishing utility packages...');

    // Publish individual utility packages
    const utilitiesDir = path.join(rootDir, 'utilities');
    const utilityPackages = fs.readdirSync(utilitiesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules')
        .map(dirent => ({ name: dirent.name, path: path.join(utilitiesDir, dirent.name) }));

    utilityPackages.forEach(pkg => {
        const success = publishPackage(pkg.path, `@taleofddh/${pkg.name}`);
        if (success) {
            publishResults.successful.push(`@taleofddh/${pkg.name}`);
        } else {
            publishResults.failed.push(`@taleofddh/${pkg.name}`);
        }
    });

    // Publish utilities aggregate
    const utilitiesSuccess = publishPackage(path.join(rootDir, 'utilities'), '@taleofddh/utilities');
    if (utilitiesSuccess) {
        publishResults.successful.push('@taleofddh/utilities');
    } else {
        publishResults.failed.push('@taleofddh/utilities');
    }
}

if (publishType === 'all') {
    console.log('\n📁 Publishing main package...');
    const mainSuccess = publishPackage(rootDir, '@taleofddh/libraries');
    if (mainSuccess) {
        publishResults.successful.push('@taleofddh/libraries');
    } else {
        publishResults.failed.push('@taleofddh/libraries');
    }
}

// Display results summary
console.log('\n🎉 Publishing process completed!');
console.log('\n📊 Results Summary:');
console.log(`✅ Successfully published: ${publishResults.successful.length} packages`);
if (publishResults.successful.length > 0) {
    publishResults.successful.forEach(pkg => console.log(`   - ${pkg}`));
}

if (publishResults.failed.length > 0) {
    console.log(`❌ Failed to publish: ${publishResults.failed.length} packages`);
    publishResults.failed.forEach(pkg => console.log(`   - ${pkg}`));
}

console.log('\nUsage:');
console.log('  node scripts/publish-packages.js [all|services|utilities]');
console.log('  - all: Publish all packages (default)');
console.log('  - services: Publish only service packages');
console.log('  - utilities: Publish only utility packages');

// Exit with error code if any packages failed
if (publishResults.failed.length > 0) {
    process.exit(1);
}