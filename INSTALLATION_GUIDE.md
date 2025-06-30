# Installation Guide for SWEAT24 Admin Panel

## Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher

## Installation Methods

### Method 1: Standard Installation (Recommended)
```bash
npm install
```

This will use the `.npmrc` configuration which handles peer dependencies automatically.

### Method 2: Clean Installation
If you encounter any issues, use the clean install script:
```bash
npm run clean:install
```

This will:
1. Remove `node_modules` and `package-lock.json`
2. Run a fresh `npm install`

### Method 3: Manual Installation with Flags
If the above methods don't work, you can install with specific flags:
```bash
npm install --legacy-peer-deps
```

### Method 4: Using Yarn (Alternative)
```bash
yarn install
```

### Method 5: Force Resolution (Last Resort)
```bash
npm install --force
```

## Troubleshooting

### Common Issues and Solutions

1. **Peer Dependency Conflicts**
   - The project includes `.npmrc` with `legacy-peer-deps=true` to handle this automatically
   - If issues persist, delete `node_modules` and `package-lock.json`, then reinstall

2. **Network Timeout Errors**
   - The `.npmrc` file sets a 60-second timeout and 3 retries
   - For slower connections, you can increase the timeout:
     ```bash
     npm config set fetch-timeout 120000
     ```

3. **Permission Errors (macOS/Linux)**
   ```bash
   sudo npm install --unsafe-perm
   ```

4. **Windows Specific Issues**
   - Run command prompt as Administrator
   - Or use:
     ```bash
     npm install --no-optional
     ```

5. **Cache Issues**
   ```bash
   npm cache clean --force
   npm install
   ```

## Verification
After installation, verify everything is working:
```bash
npm run dev
```

The development server should start at `http://localhost:5173`

## CI/CD Installation
For automated environments, use:
```bash
npm ci --legacy-peer-deps
```

This uses `package-lock.json` for deterministic installs.

## Docker Installation
If using Docker, add to your Dockerfile:
```dockerfile
COPY .npmrc .
COPY package*.json ./
RUN npm ci --legacy-peer-deps
```

## Notes
- The project uses React 18.3.1
- Some older testing libraries may show peer dependency warnings, but they work correctly
- The `.npmrc` file is committed to the repository to ensure consistent behavior across all environments