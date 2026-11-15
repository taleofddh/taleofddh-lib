# Tale of DDH Libraries

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D24.0.0-brightgreen.svg)](https://nodejs.org/)
[![npm Version](https://img.shields.io/badge/npm-%3E%3D11.0.0-blue.svg)](https://www.npmjs.com/)
[![Version](https://img.shields.io/badge/version-5.1.0-blue.svg)](https://github.com/taleofddh/taleofddh-lib)

A comprehensive collection of shared libraries providing common services, utilities, and tools for AWS Lambda applications and Node.js projects.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [Utilities](#utilities)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Publishing](#publishing)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Tale of DDH Libraries is a monorepo containing modular packages designed to accelerate development of serverless applications and Node.js services. Each package is independently versioned and can be used standalone or as part of the complete suite.

### Key Features

- **Modular Architecture**: Each service and utility is a separate package
- **AWS Lambda Optimized**: Built specifically for serverless environments
- **TypeScript Support**: Full type definitions and modern ES modules
- **Comprehensive Testing**: Built-in testing utilities and patterns
- **Production Ready**: Battle-tested in production environments

## 🏗️ Architecture

The library is organized into two main categories:

```
taleofddh-lib/
├── services/          # AWS service wrappers and integrations
└── utilities/         # Common utilities and helpers
```

### Services Package (`@taleofddh/services`)

Provides high-level wrappers for AWS services and third-party integrations, designed for Lambda functions.

### Utilities Package (`@taleofddh/utilities`)

Contains common utilities, helpers, and middleware for application development.

## 🔧 Services

The services package includes the following modules:

| Service | Description | Version |
|---------|-------------|---------|
| **channel** | Communication channel management | 5.1.0 |
| **crypto** | Cryptographic operations and utilities | 5.1.0 |
| **database** | Database connection and query utilities | 5.1.0 |
| **distribution** | Content distribution and delivery services | 5.1.0 |
| **drive** | Google Drive integration | 5.1.0 |
| **email** | Email service integration and utilities | 5.1.0 |
| **gmail** | Gmail API wrapper | 5.1.0 |
| **identity** | Identity and authentication services | 5.1.0 |
| **message** | Message processing and handling | 5.1.0 |
| **notification** | Push notification services | 5.1.0 |
| **secret** | AWS Secrets Manager integration | 5.1.0 |
| **storage** | AWS S3 and storage utilities | 5.1.0 |
| **tickettailor** | TicketTailor API integration | 5.1.0 |
| **turnstile** | Cloudflare Turnstile captcha token verification | 5.1.0 |
| **whatsapp** | WhatsApp Business API wrapper | 5.1.0 |
| **workbook** | Excel/spreadsheet processing | 5.1.0 |

## 🛠️ Utilities

The utilities package provides the following modules:

| Utility | Description | Key Functions | Version |
|---------|-------------|---------------|---------|
| **array** | Array manipulation utilities | `distinctValues`, `groupBy`, `sortBy`, `chunk` | 5.1.0 |
| **auth** | Cognito group-based authorization helper | `getCaller`, `requireGroup`, `ROLES` | 5.1.0 |
| **constants** | Application constants and enums | `HTTP_STATUS`, `ERROR_CODES`, `AWS_CONFIG` | 5.1.0 |
| **date** | Date formatting and manipulation | `formatForDisplay`, `addDays`, `daysDifference` | 5.1.0 |
| **error** | Error handling and classification | `classifyError`, `asyncHandler`, custom error classes | 5.1.0 |
| **logger** | Structured logging utilities | Configurable logging with levels | 5.1.0 |
| **middleware** | Express/Lambda middleware | `corsMiddleware`, `validationMiddleware`, `authMiddleware` | 5.1.0 |
| **response** | HTTP response helpers | `createResponse`, `createErrorResponse`, CORS headers | 5.1.0 |
| **text** | Text processing utilities | String manipulation and formatting | 5.1.0 |
| **validation** | Input validation helpers | `validateEmail`, `validateUUID`, `sanitizeInput` | 5.1.0 |

## 📦 Installation

### Configure npm for GitHub Registry

First, configure npm to use the GitHub package registry for @taleofddh packages:

```bash
# Add to your ~/.npmrc file
echo "@taleofddh:registry=https://npm.pkg.github.com/" >> ~/.npmrc
```

You'll also need to authenticate with GitHub. See [GitHub Packages documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) for authentication details.

### Install the complete suite:

```bash
npm install @taleofddh/libraries
```

### Install individual packages:

```bash
# Services
npm install @taleofddh/services

# Utilities
npm install @taleofddh/utilities

# Individual packages
npm install @taleofddh/response @taleofddh/validation
```

### Using the Unified Package Manager

We provide a unified package manager that handles both development and production scenarios:

#### Development Environment Setup

```bash
# Install complete development environment
npm run install:all

# List available packages
npm run list
```

#### Direct Script Usage

```bash
# Development setup
node scripts/install-packages.js          # Complete environment
node scripts/install-packages.js services # Only services
node scripts/install-packages.js utilities # Only utilities

# List packages
node scripts/install-packages.js list
```



## 🚀 Usage

### Using the Aggregate Packages

```javascript
// Import all services
import * as services from '@taleofddh/services';
const { gmail, storage, notification } = services;

// Import all utilities
import * as utilities from '@taleofddh/utilities';
const { createResponse, validateEmail, Logger } = utilities;
```

### Using Individual Utilities

```javascript
// Response utilities
import { createResponse, createErrorResponse } from '@taleofddh/utilities';

export const handler = async (event) => {
  try {
    const result = await processRequest(event);
    return createResponse(200, result);
  } catch (error) {
    return createErrorResponse(error);
  }
};
```

### Validation Example

```javascript
import { validateEmail, validateRequired } from '@taleofddh/utilities';

const validateUserInput = (data) => {
  const errors = [];
  
  if (!validateRequired(data.name)) {
    errors.push('Name is required');
  }
  
  if (!validateEmail(data.email)) {
    errors.push('Valid email is required');
  }
  
  return errors;
};
```

### Middleware Usage

```javascript
import { corsMiddleware, validationMiddleware } from '@taleofddh/utilities';

export const handler = corsMiddleware(
  validationMiddleware(
    async (event) => {
      // Your handler logic
      return createResponse(200, { message: 'Success' });
    }
  )
);
```

### Authorization (Cognito groups)

`@taleofddh/auth` provides one shared way to check the caller's business role
from the Cognito claims that the API Gateway user pool authorizer has already
verified. Identity and roles are read only from
`event.requestContext.authorizer.claims` — never from the request body or
headers.

```javascript
import { requireGroup, ROLES } from '@taleofddh/auth';
import { createResponse } from '@taleofddh/response';
import { classifyError } from '@taleofddh/error';

export const handler = async (event) => {
  try {
    // Throws ForbiddenError (403) unless the caller is a blog-manager or admin;
    // throws UnauthorizedError (401) when authorizer claims are missing.
    const caller = requireGroup(event, ROLES.BLOG_MANAGER);

    return createResponse(200, { message: 'Blog created', user: caller.email });
  } catch (error) {
    // classifyError maps UnauthorizedError -> 401 and ForbiddenError -> 403
    return createResponse(error.statusCode || 500, classifyError(error));
  }
};
```

`requireGroup(event, ...groups)` passes when the caller is in any of the given
`groups` or holds the `admin` role (which implies every manager role). Use
`getCaller(event)` directly when you only need the caller's identity and groups
without enforcing a specific role.

```javascript
import { getCaller, ROLES } from '@taleofddh/auth';

const { sub, email, groups } = getCaller(event);
const isAdmin = groups.includes(ROLES.ADMIN);
```

## 📚 API Reference

### Response Utilities

```javascript
// Success responses
createResponse(statusCode, data, headers?)
createCreatedResponse(data, headers?)
createNoContentResponse(headers?)

// Error responses
createErrorResponse(error, headers?)
createValidationErrorResponse(errors, headers?)
createNotFoundResponse(message?, headers?)
createUnauthorizedResponse(message?, headers?)
```

### Validation Functions

```javascript
// Basic validation
validateRequired(value)
validateEmail(email)
validateUUID(uuid)
validatePhone(phone)

// Advanced validation
validateStringLength(str, min, max)
validateNumber(value, min?, max?)
validateEnum(value, allowedValues)
validateArray(arr, itemValidator?)
```

### Error Handling

```javascript
// Custom error classes
NotFoundError(message)
ConflictError(message)
UnauthorizedError(message)
ValidationError(message, details?)

// Error utilities
classifyError(error)
asyncHandler(fn) // Wraps async functions for error handling
```

### Authorization (Cognito groups)

```javascript
import { getCaller, requireGroup, ROLES } from '@taleofddh/auth';

// Roles (Cognito user pool groups)
ROLES.ADMIN           // 'admin' — full access, implies every manager role
ROLES.GALLERY_MANAGER // 'gallery-manager'
ROLES.BLOG_MANAGER    // 'blog-manager'

// Read the verified caller's identity and roles from authorizer claims
getCaller(event) // -> { sub, email, groups }
                  // throws UnauthorizedError (401) when claims are missing

// Enforce a business role (admin always passes)
requireGroup(event, ROLES.BLOG_MANAGER)        // -> caller
requireGroup(event, ROLES.BLOG_MANAGER, ROLES.GALLERY_MANAGER)
// throws UnauthorizedError (401) when claims are missing
// throws ForbiddenError (403) when the caller holds none of the required roles
```

The `cognito:groups` claim is parsed safely whether it is missing, an array
(`['admin', 'blog-manager']`), a comma-separated string (`'admin,blog-manager'`),
or a bracketed space-separated string (`'[admin blog-manager]'`). The thrown
`UnauthorizedError` and `ForbiddenError` carry the `name` and `statusCode` that
`@taleofddh/error`'s `classifyError` maps to 401 and 403.

## 🔧 Development

### Prerequisites

- Node.js >= 24.0.0
- npm >= 11.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/taleofddh/taleofddh-lib.git

# Complete development environment setup (recommended)
cd taleofddh-lib
npm run install:all
```

### Development Workflow

#### Initial Setup
```bash
# Install complete development environment
npm run install:all
```

#### Development Commands
```bash
# Install dependencies
npm run install:all       # Install complete development environment
npm run install:services  # Install only services packages
npm run install:utilities # Install only utilities packages

# List available packages
npm run list

# Update version (no git operations)
npm run version:patch     # 1.0.0 → 1.2.3 (bug fixes)
npm run version:minor     # 1.0.0 → 1.3.0 (new features)
npm run version:major     # 1.0.0 → 2.0.0 (breaking changes)

# Configure packages for GitHub registry
npm run configure

# Publish packages
npm run publish:all       # Publish all packages
npm run publish:services  # Publish only services
npm run publish:utilities # Publish only utilities
```

#### Version Type Guide
- **Patch** (`1.0.0 → 1.2.3`): Bug fixes, small improvements, no breaking changes
- **Minor** (`1.0.0 → 1.3.0`): New features, enhancements, backward compatible
- **Major** (`1.0.0 → 2.0.0`): Breaking changes, API changes, major updates

#### Testing
```bash
# Run tests (when available)
npm test

# Run tests for specific package
cd services && npm test
cd utilities && npm test
```

### Project Structure

```
taleofddh-lib/
├── services/
│   ├── channel/
│   ├── crypto/
│   ├── database/
│   ├── distribution/
│   ├── drive/
│   ├── email/
│   ├── gmail/
│   ├── identity/
│   ├── message/
│   ├── notification/
│   ├── secret/
│   ├── storage/
│   ├── tickettailor/
│   ├── turnstile/
│   ├── whatsapp/
│   ├── workbook/
│   └── index.js
├── utilities/
│   ├── array/
│   ├── constants/
│   ├── date/
│   ├── error/
│   ├── logger/
│   ├── middleware/
│   ├── response/
│   ├── text/
│   ├── validation/
│   └── index.js
├── scripts/
│   ├── configure-packages.js
│   ├── install-packages.js
│   ├── publish-packages.js
│   └── version-manager.js
├── package.json
└── README.md
```

### Testing

```bash
# Run tests (when available)
npm test

# Run tests for specific package
cd services && npm test
cd utilities && npm test
```

## 📦 Publishing

This repository uses automated publishing to GitHub Packages with intelligent change detection and individual package publishing.

### How Production Packages Are Created

1. **Development**: Work on code using `npm run install:all`
2. **Version Update**: Use `npm run version:patch` to update all package versions
3. **Publishing**: 
   - **Automatic**: Push to `production` branch triggers GitHub Actions
   - **Manual**: Use `npm run publish:all` to publish immediately
4. **Clean Packages**: Published packages are clean, tagged versions without dev dependencies
5. **Registry**: Packages are published to GitHub npm package registry

### Published Package Characteristics

- **Published Versions**: Clean packages available from `https://npm.pkg.github.com/`
- **Tagged Releases**: Specific versions (e.g., v1.0.0) not development code
- **Production Dependencies**: Only runtime dependencies, no dev dependencies
- **Proper Versioning**: Semantic versioning with dependency resolution
- **Authentication Required**: Requires GitHub authentication to access registry

### Prerequisites for Publishing

1. **GitHub Personal Access Token**: You need a GitHub PAT with `write:packages` permission
2. **npm Configuration**: Your `~/.npmrc` should be configured with:
   ```bash
   @taleofddh:registry=https://npm.pkg.github.com/
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
   ```

### Package Structure

The repository contains three types of packages:

1. **Main Package**: `@taleofddh/libraries` - The root package
2. **Aggregate Packages**: 
   - `@taleofddh/services` - Aggregates all service packages
   - `@taleofddh/utilities` - Aggregates all utility packages
3. **Individual Packages**: Each service and utility is a separate package (22+ packages)

### Automatic Publishing (GitHub Actions)

#### Triggers

The GitHub Actions workflow automatically publishes packages when:

1. **Push to production branch** with changes in:
   - `services/**`
   - `utilities/**`
   - `.github/workflows/publish-packages.yml`

2. **Manual workflow dispatch** with options:
   - `all`: Publish all packages
   - `services`: Publish only service packages
   - `utilities`: Publish only utility packages
   - `individual`: Publish specific package (specify package name)

#### Workflow Features

- **Change Detection**: Only publishes packages that have changed
- **Individual Package Publishing**: Publishes each changed package separately
- **Aggregate Publishing**: Publishes aggregate packages when their components change
- **Main Package Publishing**: Publishes main package when aggregates are updated

### Manual Publishing

#### Using npm Scripts

```bash
# Configure all packages for GitHub registry
npm run configure

# Publish all packages
npm run publish:all

# Publish only services
npm run publish:services

# Publish only utilities
npm run publish:utilities
```

#### Using the Publishing Script Directly

```bash
# Publish all packages
node scripts/publish-packages.js all

# Publish only services
node scripts/publish-packages.js services

# Publish only utilities
node scripts/publish-packages.js utilities
```

#### Publishing Individual Packages

```bash
# Navigate to specific package and publish
cd services/gmail
npm publish

# Or utilities
cd utilities/response
npm publish
```

### Version Management

#### Automated Versioning

Use the provided npm scripts to update versions across all packages:

```bash
# Patch version (1.0.0 -> 1.2.3)
npm run version:patch

# Minor version (1.0.0 -> 1.3.0)
npm run version:minor

# Major version (1.0.0 -> 2.0.0)
npm run version:major
```

#### Manual Versioning

Update versions in individual package.json files as needed.

### Package Configuration

All packages are configured with:

```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/"
  }
}
```

This ensures packages are published to the GitHub registry.

### Troubleshooting

#### Authentication Issues

1. Verify your GitHub token has `write:packages` permission
2. Check your `~/.npmrc` configuration
3. Ensure you're authenticated with GitHub

#### Publishing Failures

1. Check package versions (can't republish same version)
2. Verify package.json syntax
3. Ensure all dependencies are available
4. Check GitHub Actions logs for detailed error messages

#### Registry Issues

If packages aren't appearing in GitHub Packages:

1. Verify the package name matches the repository owner
2. Check that `publishConfig.registry` is set correctly
3. Ensure the repository has packages enabled

### Best Practices

1. **Version Consistency**: Keep related packages in sync
2. **Change Detection**: Let GitHub Actions handle automatic publishing
3. **Testing**: Test packages locally before publishing
4. **Documentation**: Update README.md when adding new packages
5. **Dependencies**: Ensure all dependencies are properly declared

### Monitoring

Monitor package publishing through:

1. **GitHub Actions**: Check workflow runs in the Actions tab
2. **GitHub Packages**: View published packages in the repository's Packages tab
3. **npm logs**: Check local npm publish output for errors

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed
- Ensure all packages maintain compatibility
- Use semantic versioning for releases

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/taleofddh/taleofddh-lib)
- [Issues](https://github.com/taleofddh/taleofddh-lib/issues)
- [GitHub Packages](https://github.com/taleofddh/taleofddh-lib/packages)

## 👨‍💻 Author

**Devadyuti Das**

---

Built with ❤️ for the serverless community


