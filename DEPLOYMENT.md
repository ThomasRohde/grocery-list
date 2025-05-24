# Deployment Guide

This guide covers deploying the Grocery List PWA to various platforms.

## GitHub Pages (Recommended)

### Automatic Deployment

The repository is configured with GitHub Actions for automatic deployment:

1. **Push to main branch** - Automatically triggers deployment
2. **Manual trigger** - Use GitHub Actions tab to trigger deployment
3. **Local deployment** - Use `npm run deploy` command

### Setup Steps

1. **Repository Settings**:
   - Go to Settings > Pages
   - Source: GitHub Actions
   - Custom domain (optional): Set your domain

2. **GitHub Actions Workflow**:
   ```yaml
   # .github/workflows/deploy.yml (already configured)
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
     workflow_dispatch:
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'npm'
         - run: npm ci
         - run: npm run build
         - uses: actions/deploy-pages@v3
   ```

3. **Base URL Configuration**:
   ```typescript
   // vite.config.ts
   export default defineConfig({
     base: '/grocery-list/', // Repository name
     // ... other config
   });
   ```

### Live URL
- **Production**: https://ThomasRohde.github.io/grocery-list
- **Preview**: Available after each deployment

## Alternative Deployment Options

### Netlify

1. **Connect Repository**:
   - Go to Netlify Dashboard
   - "New site from Git"
   - Connect GitHub repository

2. **Build Settings**:
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables**:
   ```
   NODE_VERSION=18
   ```

### Vercel

1. **Import Project**:
   - Go to Vercel Dashboard
   - "Import Project"
   - Connect GitHub repository

2. **Build Configuration**:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

### Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**:
   ```bash
   firebase init hosting
   ```

3. **Configure firebase.json**:
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

### Docker Deployment

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and Run**:
   ```bash
   docker build -t grocery-list-pwa .
   docker run -p 8080:80 grocery-list-pwa
   ```

## PWA Deployment Checklist

### Before Deployment

- [ ] **Build succeeds locally**: `npm run build`
- [ ] **PWA features work**: Test offline functionality
- [ ] **Service Worker registered**: Check dev tools
- [ ] **Manifest valid**: Use Chrome DevTools > Application
- [ ] **Icons generated**: Check `public/icons/` folder
- [ ] **Base URL configured**: For subdirectory deployments

### After Deployment

- [ ] **PWA installable**: Install prompt appears
- [ ] **Offline functionality**: Disconnect network and test
- [ ] **Service Worker active**: Check in DevTools
- [ ] **Manifest loads**: No console errors
- [ ] **Icons display**: Check app icon and splash screen
- [ ] **QR codes work**: Test sharing functionality

### Lighthouse Audit

Run Lighthouse audit to verify PWA compliance:

```bash
# Local audit (after build)
npm run preview
npm run audit

# Production audit
lighthouse https://your-domain.com --view
```

**Target Scores**:
- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- PWA: 100
- SEO: 90+

## Domain Configuration

### Custom Domain (GitHub Pages)

1. **Add CNAME file**:
   ```
   your-domain.com
   ```

2. **DNS Configuration**:
   ```
   Type: CNAME
   Name: www
   Value: thomasrohde.github.io
   ```

3. **Repository Settings**:
   - Settings > Pages
   - Custom domain: your-domain.com
   - Enforce HTTPS: ✅

### SSL Certificate

GitHub Pages automatically provides SSL certificates for:
- `*.github.io` domains
- Custom domains (after DNS verification)

## Environment Variables

### Build-time Variables

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
```

### Runtime Configuration

```typescript
// src/config.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  version: import.meta.env.VITE_APP_VERSION || 'dev',
  environment: import.meta.env.MODE,
};
```

## Monitoring and Analytics

### Error Tracking

```typescript
// src/utils/monitoring.ts
export const initMonitoring = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('error', (event) => {
      console.error('Service Worker error:', event);
      // Send to monitoring service
    });
  }
};
```

### Usage Analytics

```typescript
// src/utils/analytics.ts
export const trackEvent = (event: string, data?: any) => {
  if (import.meta.env.PROD) {
    // Send to analytics service
    console.log('Analytics:', event, data);
  }
};
```

## Troubleshooting

### Common Issues

1. **Service Worker not updating**:
   - Clear browser cache
   - Check `skipWaiting` configuration
   - Verify service worker registration

2. **PWA not installable**:
   - Verify manifest.json is valid
   - Check HTTPS requirement
   - Ensure service worker is registered

3. **Icons not displaying**:
   - Verify icon paths in manifest
   - Check icon file sizes and formats
   - Clear browser cache

4. **Offline functionality broken**:
   - Check service worker caching strategy
   - Verify IndexedDB storage
   - Test with DevTools offline mode

### Debug Commands

```bash
# Check build output
npm run build && ls -la dist/

# Verify service worker
npx workbox-cli --help

# Test PWA features
npm run preview
# Open DevTools > Application > Service Workers
```

## Security Considerations

### Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: blob:;">
```

### Service Worker Security

- Always use HTTPS in production
- Validate all cached resources
- Implement proper error handling
- Regular security updates

## Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/

# Check lighthouse scores
npm run audit
```

### Optimization Tips

1. **Code Splitting**: Use dynamic imports
2. **Asset Optimization**: Compress images and icons
3. **Caching Strategy**: Configure Workbox properly
4. **Tree Shaking**: Remove unused dependencies
5. **Preloading**: Preload critical resources

## Support

For deployment issues:
- Check GitHub Actions logs
- Review browser DevTools console
- Test with different browsers
- Validate PWA features with Chrome DevTools
