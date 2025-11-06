#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');

// ANSI color codes for better output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Check if we're running from within the development repository
function isInDevelopmentRepo() {
    const currentDir = process.cwd();
    const packageJsonPath = path.join(currentDir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            return packageJson.name === '@taleofddh/libraries';
        } catch (error) {
            return false;
        }
    }
    return false;
}

// Check if running in production environment
function isProductionEnvironment() {
    return process.env.NODE_ENV === 'production' || process.env.npm_config_production === 'true';
}

// Get install command based on environment
function getInstallCommand() {
    if (isProductionEnvironment()) {
        console.log(`${colors.yellow}🏭 Production environment detected - skipping devDependencies${colors.reset}`);
        return 'npm install --production';
    } else {
        console.log(`${colors.cyan}🔧 Development environment detected - including devDependencies${colors.reset}`);
        return 'npm install';
    }
}

// Function to execute command with error handling
function executeCommand(command, directory = rootDir, description = '') {
    console.log(`${colors.blue}📦 ${description || `Running: ${command}`}${colors.reset}`);
    
    const originalDir = process.cwd();
    
    try {
        process.chdir(directory);
        execSync(command, { stdio: 'inherit' });
        console.log(`${colors.green}✅ Success: ${description || command}${colors.reset}`);
        return true;
    } catch (error) {
        console.error(`${colors.red}❌ Failed: ${description || command}${colors.reset}`);
        console.error(`${colors.red}   Error: ${error.message}${colors.reset}`);
        return false;
    } finally {
        process.chdir(originalDir);
    }
}

// Function to install package (for production use)
function installPackage(packageName, isDevDependency = false) {
    const devFlag = isDevDependency ? '--save-dev' : '';
    const command = `npm install ${packageName} ${devFlag}`.trim();
    
    console.log(`${colors.blue}📦 Installing ${packageName}...${colors.reset}`);
    
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`${colors.green}✅ Successfully installed ${packageName}${colors.reset}`);
        return true;
    } catch (error) {
        console.error(`${colors.red}❌ Failed to install ${packageName}: ${error.message}${colors.reset}`);
        return false;
    }
}

// Function to configure npm registry
function configureRegistry() {
    console.log(`${colors.yellow}🔧 Configuring npm registry for @taleofddh packages...${colors.reset}`);
    
    try {
        execSync('npm config set @taleofddh:registry https://npm.pkg.github.com/', { stdio: 'inherit' });
        console.log(`${colors.green}✅ Registry configured successfully${colors.reset}`);
        return true;
    } catch (error) {
        console.error(`${colors.red}❌ Failed to configure registry: ${error.message}${colors.reset}`);
        console.log(`${colors.yellow}💡 You may need to manually add this to your ~/.npmrc:${colors.reset}`);
        console.log(`${colors.cyan}@taleofddh:registry=https://npm.pkg.github.com/${colors.reset}`);
        return false;
    }
}

// Function to check if directory exists
function checkDirectory(dirPath, name) {
    if (fs.existsSync(dirPath)) {
        console.log(`${colors.green}✅ Found ${name} directory${colors.reset}`);
        return true;
    } else {
        console.log(`${colors.red}❌ Missing ${name} directory${colors.reset}`);
        return false;
    }
}

// Get available packages from the monorepo
function getAvailablePackages() {
    const packages = {
        services: [],
        utilities: [],
        aggregates: ['@taleofddh/services', '@taleofddh/utilities'],
        main: '@taleofddh/libraries'
    };

    // Get service packages
    const servicesDir = path.join(rootDir, 'services');
    if (fs.existsSync(servicesDir)) {
        packages.services = fs.readdirSync(servicesDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules')
            .map(dirent => `@taleofddh/${dirent.name}`);
    }

    // Get utility packages
    const utilitiesDir = path.join(rootDir, 'utilities');
    if (fs.existsSync(utilitiesDir)) {
        packages.utilities = fs.readdirSync(utilitiesDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules')
            .map(dirent => `@taleofddh/${dirent.name}`);
    }

    return packages;
}

// Display available packages
function displayAvailablePackages() {
    const packages = getAvailablePackages();
    
    console.log(`${colors.bright}${colors.magenta}📋 Available Packages:${colors.reset}\n`);
    
    console.log(`${colors.bright}${colors.blue}🏢 Main Package:${colors.reset}`);
    console.log(`  ${packages.main}`);
    
    console.log(`\n${colors.bright}${colors.blue}📦 Aggregate Packages:${colors.reset}`);
    packages.aggregates.forEach(pkg => console.log(`  ${pkg}`));
    
    console.log(`\n${colors.bright}${colors.blue}🔧 Service Packages (${packages.services.length}):${colors.reset}`);
    packages.services.forEach(pkg => console.log(`  ${pkg}`));
    
    console.log(`\n${colors.bright}${colors.blue}🛠️  Utility Packages (${packages.utilities.length}):${colors.reset}`);
    packages.utilities.forEach(pkg => console.log(`  ${pkg}`));
}

// Services-only setup function
function setupServicesOnly() {
    console.log(`${colors.bright}${colors.magenta}🚀 Tale of DDH Libraries - Services Setup${colors.reset}\n`);
    
    let setupResults = { successful: [], failed: [] };
    
    const servicesDir = path.join(rootDir, 'services');
    
    console.log(`${colors.cyan}🔧 Starting services environment setup...${colors.reset}\n`);
    
    // 1. Install services aggregate dependencies
    console.log(`${colors.bright}1. Installing services aggregate dependencies...${colors.reset}`);
    const servicesSuccess = executeCommand(getInstallCommand(), servicesDir, 'Installing services aggregate dependencies');
    if (servicesSuccess) {
        setupResults.successful.push('Services aggregate dependencies');
    } else {
        setupResults.failed.push('Services aggregate dependencies');
    }
    
    // 2. Install individual service packages
    console.log(`\n${colors.bright}2. Installing individual service packages...${colors.reset}`);
    const servicePackages = fs.readdirSync(servicesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules')
        .map(dirent => ({ name: dirent.name, path: path.join(servicesDir, dirent.name) }));
    
    let serviceInstallCount = 0;
    for (const pkg of servicePackages) {
        if (fs.existsSync(path.join(pkg.path, 'package.json'))) {
            const success = executeCommand(getInstallCommand(), pkg.path, `Installing ${pkg.name} service dependencies`);
            if (success) {
                serviceInstallCount++;
            } else {
                setupResults.failed.push(`Service: ${pkg.name}`);
            }
        }
    }
    
    if (serviceInstallCount > 0) {
        setupResults.successful.push(`${serviceInstallCount} individual service packages`);
    }
    
    // Display results
    console.log(`\n${colors.bright}${colors.green}🎉 Services setup completed!${colors.reset}`);
    console.log(`\n${colors.bright}📊 Setup Results:${colors.reset}`);
    
    if (setupResults.successful.length > 0) {
        console.log(`${colors.green}✅ Successfully completed: ${setupResults.successful.length} tasks${colors.reset}`);
        setupResults.successful.forEach(task => console.log(`   ${colors.green}- ${task}${colors.reset}`));
    }
    
    if (setupResults.failed.length > 0) {
        console.log(`${colors.red}❌ Failed tasks: ${setupResults.failed.length}${colors.reset}`);
        setupResults.failed.forEach(task => console.log(`   ${colors.red}- ${task}${colors.reset}`));
        process.exit(1);
    }
}

// Utilities-only setup function
function setupUtilitiesOnly() {
    console.log(`${colors.bright}${colors.magenta}🚀 Tale of DDH Libraries - Utilities Setup${colors.reset}\n`);
    
    let setupResults = { successful: [], failed: [] };
    
    const utilitiesDir = path.join(rootDir, 'utilities');
    
    console.log(`${colors.cyan}🔧 Starting utilities environment setup...${colors.reset}\n`);
    
    // 1. Install utilities aggregate dependencies
    console.log(`${colors.bright}1. Installing utilities aggregate dependencies...${colors.reset}`);
    const utilitiesSuccess = executeCommand(getInstallCommand(), utilitiesDir, 'Installing utilities aggregate dependencies');
    if (utilitiesSuccess) {
        setupResults.successful.push('Utilities aggregate dependencies');
    } else {
        setupResults.failed.push('Utilities aggregate dependencies');
    }
    
    // 2. Install individual utility packages
    console.log(`\n${colors.bright}2. Installing individual utility packages...${colors.reset}`);
    const utilityPackages = fs.readdirSync(utilitiesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules')
        .map(dirent => ({ name: dirent.name, path: path.join(utilitiesDir, dirent.name) }));
    
    let utilityInstallCount = 0;
    for (const pkg of utilityPackages) {
        if (fs.existsSync(path.join(pkg.path, 'package.json'))) {
            const success = executeCommand(getInstallCommand(), pkg.path, `Installing ${pkg.name} utility dependencies`);
            if (success) {
                utilityInstallCount++;
            } else {
                setupResults.failed.push(`Utility: ${pkg.name}`);
            }
        }
    }
    
    if (utilityInstallCount > 0) {
        setupResults.successful.push(`${utilityInstallCount} individual utility packages`);
    }
    
    // Display results
    console.log(`\n${colors.bright}${colors.green}🎉 Utilities setup completed!${colors.reset}`);
    console.log(`\n${colors.bright}📊 Setup Results:${colors.reset}`);
    
    if (setupResults.successful.length > 0) {
        console.log(`${colors.green}✅ Successfully completed: ${setupResults.successful.length} tasks${colors.reset}`);
        setupResults.successful.forEach(task => console.log(`   ${colors.green}- ${task}${colors.reset}`));
    }
    
    if (setupResults.failed.length > 0) {
        console.log(`${colors.red}❌ Failed tasks: ${setupResults.failed.length}${colors.reset}`);
        setupResults.failed.forEach(task => console.log(`   ${colors.red}- ${task}${colors.reset}`));
        process.exit(1);
    }
}

// Development setup function
function setupDevelopmentEnvironment() {
    console.log(`${colors.bright}${colors.magenta}🚀 Tale of DDH Libraries - Development Setup${colors.reset}\n`);
    
    let setupResults = { successful: [], failed: [] };
    
    // Check if we're in the right directory
    const packageJsonPath = path.join(rootDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        console.error(`${colors.red}❌ No package.json found. Are you in the right directory?${colors.reset}`);
        process.exit(1);
    }
    
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.name !== '@taleofddh/libraries') {
            console.error(`${colors.red}❌ This doesn't appear to be the Tale of DDH Libraries repository.${colors.reset}`);
            process.exit(1);
        }
    } catch (error) {
        console.error(`${colors.red}❌ Error reading package.json: ${error.message}${colors.reset}`);
        process.exit(1);
    }
    
    console.log(`${colors.green}✅ Confirmed: Tale of DDH Libraries repository${colors.reset}\n`);
    
    // Check directory structure
    const servicesDir = path.join(rootDir, 'services');
    const utilitiesDir = path.join(rootDir, 'utilities');
    
    const hasServices = checkDirectory(servicesDir, 'services');
    const hasUtilities = checkDirectory(utilitiesDir, 'utilities');
    
    if (!hasServices || !hasUtilities) {
        console.error(`${colors.red}❌ Missing required directories. Repository structure may be incomplete.${colors.reset}`);
        process.exit(1);
    }
    
    console.log(`${colors.cyan}\n🔧 Starting development environment setup...${colors.reset}\n`);
    
    // 1. Install root dependencies
    console.log(`${colors.bright}1. Installing root dependencies...${colors.reset}`);
    const rootSuccess = executeCommand(getInstallCommand(), rootDir, 'Installing root dependencies');
    if (rootSuccess) {
        setupResults.successful.push('Root dependencies');
    } else {
        setupResults.failed.push('Root dependencies');
    }
    
    // 2. Install services dependencies
    console.log(`\n${colors.bright}2. Installing services aggregate dependencies...${colors.reset}`);
    const servicesSuccess = executeCommand(getInstallCommand(), servicesDir, 'Installing services aggregate dependencies');
    if (servicesSuccess) {
        setupResults.successful.push('Services aggregate dependencies');
    } else {
        setupResults.failed.push('Services aggregate dependencies');
    }
    
    // 3. Install utilities dependencies
    console.log(`\n${colors.bright}3. Installing utilities aggregate dependencies...${colors.reset}`);
    const utilitiesSuccess = executeCommand(getInstallCommand(), utilitiesDir, 'Installing utilities aggregate dependencies');
    if (utilitiesSuccess) {
        setupResults.successful.push('Utilities aggregate dependencies');
    } else {
        setupResults.failed.push('Utilities aggregate dependencies');
    }
    
    // 4. Install individual service packages
    console.log(`\n${colors.bright}4. Installing individual service packages...${colors.reset}`);
    const servicePackages = fs.readdirSync(servicesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules')
        .map(dirent => ({ name: dirent.name, path: path.join(servicesDir, dirent.name) }));
    
    let serviceInstallCount = 0;
    for (const pkg of servicePackages) {
        if (fs.existsSync(path.join(pkg.path, 'package.json'))) {
            const success = executeCommand(getInstallCommand(), pkg.path, `Installing ${pkg.name} service dependencies`);
            if (success) {
                serviceInstallCount++;
            } else {
                setupResults.failed.push(`Service: ${pkg.name}`);
            }
        }
    }
    
    if (serviceInstallCount > 0) {
        setupResults.successful.push(`${serviceInstallCount} individual service packages`);
    }
    
    // 5. Install individual utility packages
    console.log(`\n${colors.bright}5. Installing individual utility packages...${colors.reset}`);
    const utilityPackages = fs.readdirSync(utilitiesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules')
        .map(dirent => ({ name: dirent.name, path: path.join(utilitiesDir, dirent.name) }));
    
    let utilityInstallCount = 0;
    for (const pkg of utilityPackages) {
        if (fs.existsSync(path.join(pkg.path, 'package.json'))) {
            const success = executeCommand(getInstallCommand(), pkg.path, `Installing ${pkg.name} utility dependencies`);
            if (success) {
                utilityInstallCount++;
            } else {
                setupResults.failed.push(`Utility: ${pkg.name}`);
            }
        }
    }
    
    if (utilityInstallCount > 0) {
        setupResults.successful.push(`${utilityInstallCount} individual utility packages`);
    }
    
    // 6. Configure packages for GitHub registry
    console.log(`\n${colors.bright}6. Configuring packages for GitHub registry...${colors.reset}`);
    const configSuccess = executeCommand('node scripts/configure-packages.js', rootDir, 'Configuring packages');
    if (configSuccess) {
        setupResults.successful.push('Package configuration');
    } else {
        setupResults.failed.push('Package configuration');
    }
    
    // Display results
    console.log(`\n${colors.bright}${colors.green}🎉 Development setup completed!${colors.reset}`);
    console.log(`\n${colors.bright}📊 Setup Results:${colors.reset}`);
    
    if (setupResults.successful.length > 0) {
        console.log(`${colors.green}✅ Successfully completed: ${setupResults.successful.length} tasks${colors.reset}`);
        setupResults.successful.forEach(task => console.log(`   ${colors.green}- ${task}${colors.reset}`));
    }
    
    if (setupResults.failed.length > 0) {
        console.log(`${colors.red}❌ Failed tasks: ${setupResults.failed.length}${colors.reset}`);
        setupResults.failed.forEach(task => console.log(`   ${colors.red}- ${task}${colors.reset}`));
    }
    
    // Show next steps
    console.log(`\n${colors.bright}${colors.cyan}📋 Next Steps:${colors.reset}`);
    console.log(`${colors.yellow}1.${colors.reset} Make your changes to the code`);
    console.log(`${colors.yellow}2.${colors.reset} Test your changes locally`);
    console.log(`${colors.yellow}3.${colors.reset} Update versions: ${colors.cyan}npm run version:patch${colors.reset}`);
    console.log(`${colors.yellow}4.${colors.reset} Publish packages: ${colors.cyan}npm run publish:all${colors.reset}`);
    console.log(`${colors.yellow}5.${colors.reset} Or push to production branch for automatic publishing`);
    
    console.log(`\n${colors.bright}${colors.cyan}🛠️  Available Scripts:${colors.reset}`);
    console.log(`${colors.cyan}npm run configure-packages${colors.reset}  - Configure all packages for GitHub registry`);
    console.log(`${colors.cyan}npm run publish:all${colors.reset}         - Publish all packages manually`);
    console.log(`${colors.cyan}npm run publish:services${colors.reset}    - Publish only services`);
    console.log(`${colors.cyan}npm run publish:utilities${colors.reset}   - Publish only utilities`);
    console.log(`${colors.cyan}npm run version:patch${colors.reset}       - Bump patch version for all packages`);
    
    // Exit with error code if any tasks failed
    if (setupResults.failed.length > 0) {
        process.exit(1);
    }
}

// Production installation function
function installPackages(installType, specificPackage = null, isDev = false) {
    const packages = getAvailablePackages();
    let installResults = { successful: [], failed: [] };
    
    // Configure registry first
    configureRegistry();
    
    console.log(`\n${colors.bright}${colors.green}🚀 Starting package installation (type: ${installType})${colors.reset}\n`);
    
    switch (installType) {
        case 'all':
            // Install main package (includes everything)
            const mainSuccess = installPackage(packages.main, isDev);
            if (mainSuccess) {
                installResults.successful.push(packages.main);
            } else {
                installResults.failed.push(packages.main);
            }
            break;
            
        case 'aggregates':
            // Install aggregate packages
            packages.aggregates.forEach(pkg => {
                const success = installPackage(pkg, isDev);
                if (success) {
                    installResults.successful.push(pkg);
                } else {
                    installResults.failed.push(pkg);
                }
            });
            break;
            
        case 'services':
            // Install services aggregate
            const servicesSuccess = installPackage('@taleofddh/services', isDev);
            if (servicesSuccess) {
                installResults.successful.push('@taleofddh/services');
            } else {
                installResults.failed.push('@taleofddh/services');
            }
            break;
            
        case 'utilities':
            // Install utilities aggregate
            const utilitiesSuccess = installPackage('@taleofddh/utilities', isDev);
            if (utilitiesSuccess) {
                installResults.successful.push('@taleofddh/utilities');
            } else {
                installResults.failed.push('@taleofddh/utilities');
            }
            break;
            
        case 'individual-services':
            // Install all individual service packages
            packages.services.forEach(pkg => {
                const success = installPackage(pkg, isDev);
                if (success) {
                    installResults.successful.push(pkg);
                } else {
                    installResults.failed.push(pkg);
                }
            });
            break;
            
        case 'individual-utilities':
            // Install all individual utility packages
            packages.utilities.forEach(pkg => {
                const success = installPackage(pkg, isDev);
                if (success) {
                    installResults.successful.push(pkg);
                } else {
                    installResults.failed.push(pkg);
                }
            });
            break;
            
        case 'individual':
            // Install specific package
            if (specificPackage) {
                const success = installPackage(specificPackage, isDev);
                if (success) {
                    installResults.successful.push(specificPackage);
                } else {
                    installResults.failed.push(specificPackage);
                }
            } else {
                console.error(`${colors.red}❌ Package name required for individual installation${colors.reset}`);
                return;
            }
            break;
            
        case 'list':
            displayAvailablePackages();
            return;
            
        default:
            console.error(`${colors.red}❌ Unknown installation type: ${installType}${colors.reset}`);
            showUsage();
            return;
    }
    
    // Display results summary
    console.log(`\n${colors.bright}${colors.green}🎉 Installation process completed!${colors.reset}`);
    console.log(`\n${colors.bright}📊 Results Summary:${colors.reset}`);
    console.log(`${colors.green}✅ Successfully installed: ${installResults.successful.length} packages${colors.reset}`);
    
    if (installResults.successful.length > 0) {
        installResults.successful.forEach(pkg => console.log(`   ${colors.green}- ${pkg}${colors.reset}`));
    }
    
    if (installResults.failed.length > 0) {
        console.log(`${colors.red}❌ Failed to install: ${installResults.failed.length} packages${colors.reset}`);
        installResults.failed.forEach(pkg => console.log(`   ${colors.red}- ${pkg}${colors.reset}`));
    }
    
    // Exit with error code if any packages failed
    if (installResults.failed.length > 0) {
        process.exit(1);
    }
}

// Main function for development workflow
function main(mode, ...args) {
    if (mode === 'list') {
        displayAvailablePackages();
        return;
    }
    
    if (mode === 'services') {
        setupServicesOnly();
        return;
    }
    
    if (mode === 'utilities') {
        setupUtilitiesOnly();
        return;
    }
    
    if (mode && !['install', 'services', 'utilities'].includes(mode)) {
        console.error(`${colors.red}❌ Unknown command: ${mode}${colors.reset}`);
        showUsage();
        process.exit(1);
    }
    
    // Default action: install complete development environment
    setupDevelopmentEnvironment();
}

// Show usage information
function showUsage() {
    console.log(`${colors.bright}${colors.cyan}📖 Tale of DDH Development Setup${colors.reset}`);
    console.log(`\nDevelopment environment setup for the Tale of DDH Libraries repository.\n`);
    
    console.log(`${colors.bright}Usage:${colors.reset}`);
    console.log(`  node scripts/install-packages.js <command>\n`);
    
    console.log(`${colors.bright}Commands:${colors.reset}`);
    console.log(`  ${colors.yellow}(no args)${colors.reset}              Complete development environment setup (default)`);
    console.log(`  ${colors.yellow}services${colors.reset}               Install only services packages`);
    console.log(`  ${colors.yellow}utilities${colors.reset}              Install only utilities packages`);
    console.log(`  ${colors.yellow}list${colors.reset}                   List all available packages\n`);
    
    console.log(`${colors.bright}Examples:${colors.reset}`);
    console.log(`  ${colors.cyan}node scripts/install-packages.js${colors.reset}          # Install complete environment`);
    console.log(`  ${colors.cyan}node scripts/install-packages.js services${colors.reset}  # Install only services`);
    console.log(`  ${colors.cyan}node scripts/install-packages.js utilities${colors.reset} # Install only utilities`);
    console.log(`  ${colors.cyan}node scripts/install-packages.js list${colors.reset}      # List available packages`);
    console.log(`\n${colors.bright}npm Scripts:${colors.reset}`);
    console.log(`  ${colors.cyan}npm run install:all${colors.reset}       # Install complete environment`);
    console.log(`  ${colors.cyan}npm run install:services${colors.reset}  # Install only services`);
    console.log(`  ${colors.cyan}npm run install:utilities${colors.reset} # Install only utilities`);
    console.log(`  ${colors.cyan}npm run list${colors.reset}              # List available packages`);
}

// Parse command line arguments
const args = process.argv.slice(2);

const [mode, ...restArgs] = args;

// Execute the main function
main(mode, ...restArgs);