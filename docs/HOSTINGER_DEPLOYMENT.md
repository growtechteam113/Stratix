# STRATIX AI - Hostinger Frontend Deployment Guide

This guide covers deploying the Next.js frontend to Hostinger.

## Prerequisites

- Hostinger account (https://www.hostinger.com)
- Domain name configured in Hostinger
- Git repository with frontend code
- Node.js v20+ installed locally

## Step 1: Build Next.js Application

```bash
# From root directory
npm run build --workspace=@stratix/web

# Output will be in apps/web/.next
```

## Step 2: Prepare for Deployment

### Option A: Static Export (Recommended for Hostinger)

If your Next.js app doesn't require server-side rendering:

1. Update `apps/web/next.config.js`:
```javascript
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
};
module.exports = nextConfig;
```

2. Build:
```bash
npm run build --workspace=@stratix/web
```

3. Output will be in `apps/web/out/` directory

### Option B: Node.js Server (Requires Hostinger Business Plan)

Keep the default Next.js configuration and deploy as Node.js app.

## Step 3: Upload to Hostinger

### Via FTP

1. Get FTP credentials from Hostinger dashboard
2. Connect using FTP client (FileZilla, Cyberduck, etc.)
3. Upload `apps/web/out/` contents to `public_html/`

### Via Git Integration (Recommended)

1. Go to Hostinger dashboard → Hosting → Git
2. Connect your GitHub repository
3. Set build command: `npm run build --workspace=@stratix/web`
4. Set output directory: `apps/web/out`
5. Deploy

### Via Hostinger File Manager

1. Compress `apps/web/out/` directory
2. Upload ZIP to Hostinger File Manager
3. Extract in `public_html/`

## Step 4: Configure Environment Variables

### For Static Export

Create `apps/web/.env.production`:

```env
NEXT_PUBLIC_API_URL="https://api.railway.app"
NEXT_PUBLIC_APP_NAME="STRATIX AI"
```

### For Node.js Server

In Hostinger dashboard:
1. Go to Hosting → Environment Variables
2. Add:
   - `NEXT_PUBLIC_API_URL=https://api.railway.app`
   - `NODE_ENV=production`

## Step 5: Configure Domain

1. In Hostinger dashboard → Domains
2. Point domain to your hosting
3. Wait for DNS propagation (up to 24 hours)

## Step 6: SSL Certificate

1. Hostinger provides free SSL via AutoSSL
2. Enable in dashboard → SSL Certificate
3. Wait for certificate to be issued

## Step 7: Verify Deployment

```bash
# Test your domain
curl https://your-domain.com

# Check if API calls work
# Open browser console and verify API_URL is correct
```

## Step 8: Performance Optimization

### Enable Caching

In Hostinger dashboard → Caching:
- Enable browser caching
- Enable server caching
- Set cache TTL to 1 hour for static assets

### Enable Compression

In Hostinger dashboard → Advanced:
- Enable GZIP compression
- Enable Brotli compression

### CDN (Optional)

1. Enable Cloudflare CDN
2. Update nameservers to Cloudflare
3. Configure caching rules

## Troubleshooting

### Blank Page or 404 Errors

**Problem**: Static files not found

**Solution**:
- Verify files are in `public_html/`
- Check file permissions (644 for files, 755 for directories)
- Clear browser cache

### API Calls Failing

**Problem**: CORS or API URL issues

**Solution**:
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend CORS settings
- Test API endpoint directly

### Build Failing

**Problem**: Git deployment build fails

**Solution**:
- Check build logs in Hostinger dashboard
- Verify `npm run build` works locally
- Check Node.js version (should be v20+)

### Slow Performance

**Problem**: Page loads slowly

**Solution**:
- Enable caching in Hostinger
- Enable CDN
- Optimize images
- Check API response times

## Continuous Deployment

### GitHub Actions to Hostinger

Create `.github/workflows/deploy-hostinger.yml`:

```yaml
name: Deploy Frontend to Hostinger

on:
  push:
    branches: [main]
    paths:
      - 'apps/web/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm install
      - run: npm run build --workspace=@stratix/web
      
      - uses: SamKirkland/FTP-Deploy-Action@v4.3.4
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./apps/web/out/
          server-dir: ./public_html/
```

## Monitoring

### Monitor Page Performance

1. Use Hostinger's built-in analytics
2. Set up Google Analytics
3. Monitor Core Web Vitals

### Monitor API Calls

1. Check browser Network tab
2. Monitor backend logs on Railway
3. Set up error tracking (Sentry, etc.)

## Rollback

If deployment causes issues:

1. Keep previous build backed up
2. Via FTP: Upload previous `out/` directory
3. Via Git: Revert commit and redeploy
4. Clear browser cache

## Advanced: Node.js Deployment

If you need server-side rendering:

1. Upgrade to Hostinger Business Plan
2. Keep default `next.config.js`
3. Build: `npm run build --workspace=@stratix/web`
4. Deploy `apps/web/.next` and `apps/web/node_modules`
5. Set start command: `npm start --workspace=@stratix/web`

## Cost Optimization

- Use static export to reduce server load
- Enable caching to reduce bandwidth
- Use CDN for static assets
- Monitor and optimize images

## Next Steps

- Set up monitoring and alerting
- Configure email notifications
- Set up backup strategy
- Monitor analytics and performance
