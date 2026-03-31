# Hostinger Deployment Guide

This guide provides step-by-step instructions for deploying STRATIX AI frontend (Next.js) to Hostinger.

## Prerequisites

- Hostinger account with Node.js hosting ([Sign up](https://www.hostinger.com))
- Git repository with STRATIX AI code
- SSH access to your Hostinger server
- Domain name (optional, but recommended)

## Step 1: Set Up Hostinger Node.js Hosting

### Create a New Application

1. Log in to Hostinger dashboard
2. Go to **Hosting** → **Node.js Applications**
3. Click **Create Application**
4. Configure:
   - **Application Name**: `stratix-ai-frontend`
   - **Node.js Version**: `22.13.0`
   - **Domain**: Your domain or Hostinger subdomain
   - **Port**: `3000`

### Enable SSH Access

1. Go to **Account Settings** → **SSH Keys**
2. Add your public SSH key
3. Note your SSH credentials

## Step 2: Prepare Frontend for Deployment

### Build the Frontend

```bash
cd apps/web
npm run build
```

This creates a `.next` directory with the optimized production build.

### Create .env.production

Create `apps/web/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_NAME=STRATIX AI
```

Replace `https://api.your-domain.com` with your Railway API URL.

## Step 3: Deploy to Hostinger

### Option A: Using Git (Recommended)

#### 1. Connect Git Repository

```bash
# SSH into Hostinger server
ssh user@your-hostinger-server.com

# Navigate to application directory
cd /home/your-username/applications/stratix-ai-frontend

# Initialize git (if not already done)
git init
git remote add origin https://github.com/your-org/stratix-ai.git

# Pull latest code
git pull origin main
```

#### 2. Install Dependencies and Build

```bash
# Navigate to frontend directory
cd apps/web

# Install dependencies
npm install --legacy-peer-deps

# Build for production
npm run build

# Start application
npm start
```

#### 3. Configure PM2 (Process Manager)

Hostinger uses PM2 to manage Node.js applications. Create `ecosystem.config.js` in the root:

```javascript
module.exports = {
  apps: [
    {
      name: 'stratix-frontend',
      script: 'apps/web/node_modules/.bin/next',
      args: 'start',
      cwd: '/home/your-username/applications/stratix-ai-frontend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'https://api.your-domain.com',
      },
    },
  ],
};
```

#### 4. Start Application with PM2

```bash
# Install PM2 globally (if not already installed)
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Enable PM2 startup on reboot
pm2 startup
```

### Option B: Using FTP Upload

#### 1. Build Locally

```bash
cd apps/web
npm run build
```

#### 2. Upload to Hostinger

Using an FTP client (e.g., FileZilla):

1. Connect to your Hostinger FTP server
2. Navigate to `/public_html` or `/applications/stratix-ai-frontend`
3. Upload the following directories:
   - `.next/`
   - `public/`
   - `node_modules/` (or install on server)
   - `package.json`
   - `package-lock.json`
   - `next.config.js`

#### 3. Install Dependencies on Server

```bash
ssh user@your-hostinger-server.com
cd /home/your-username/applications/stratix-ai-frontend
npm install --legacy-peer-deps --production
npm start
```

## Step 4: Configure Domain & SSL

### Point Domain to Hostinger

1. Update your domain's DNS records:
   - **A Record**: Points to Hostinger server IP
   - **CNAME Record** (optional): For subdomains

2. Hostinger will automatically provision an SSL certificate (Let's Encrypt)

### Verify SSL Certificate

```bash
# Check certificate status
curl -I https://your-domain.com
```

## Step 5: Configure Reverse Proxy (Nginx)

Hostinger typically uses Nginx as a reverse proxy. Configure it to forward requests to your Next.js application:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL certificates (auto-provisioned by Hostinger)
    ssl_certificate /etc/ssl/certs/your-domain.com.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.com.key;
    
    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Step 6: Set Up Environment Variables

In Hostinger dashboard:

1. Go to **Node.js Applications** → **stratix-ai-frontend**
2. Click **Environment Variables**
3. Add:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.your-domain.com
   NEXT_PUBLIC_APP_NAME=STRATIX AI
   ```

## Step 7: Verify Deployment

### Check Application Status

```bash
# SSH into server
ssh user@your-hostinger-server.com

# Check PM2 status
pm2 status

# View logs
pm2 logs stratix-frontend
```

### Test Frontend

```bash
curl https://your-domain.com
```

Should return HTML content of the Next.js application.

### Test API Connection

1. Open https://your-domain.com in a browser
2. Open browser console (F12)
3. Check for any API connection errors
4. Try signing up or signing in

## Step 8: Set Up Continuous Deployment

### Using GitHub Actions

Create `.github/workflows/deploy-hostinger.yml`:

```yaml
name: Deploy Frontend to Hostinger

on:
  push:
    branches:
      - main
    paths:
      - 'apps/web/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Frontend
        run: |
          cd apps/web
          npm install --legacy-peer-deps
          npm run build
      
      - name: Deploy to Hostinger
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.HOSTINGER_HOST }}
          username: ${{ secrets.HOSTINGER_USERNAME }}
          key: ${{ secrets.HOSTINGER_SSH_KEY }}
          source: "apps/web/.next,apps/web/public,apps/web/package.json"
          target: "/home/your-username/applications/stratix-ai-frontend"
      
      - name: Restart Application
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOSTINGER_HOST }}
          username: ${{ secrets.HOSTINGER_USERNAME }}
          key: ${{ secrets.HOSTINGER_SSH_KEY }}
          script: |
            cd /home/your-username/applications/stratix-ai-frontend
            pm2 restart stratix-frontend
```

### Add GitHub Secrets

In your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add:
   - `HOSTINGER_HOST`: Your Hostinger server IP
   - `HOSTINGER_USERNAME`: Your SSH username
   - `HOSTINGER_SSH_KEY`: Your SSH private key

## Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs stratix-frontend

# Restart application
pm2 restart stratix-frontend
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### API Connection Errors

1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check CORS settings on Railway API
3. Ensure Railway API is accessible from Hostinger

### SSL Certificate Issues

```bash
# Check certificate validity
openssl s_client -connect your-domain.com:443

# Renew certificate (if using Let's Encrypt)
certbot renew
```

### Memory Issues

If application crashes due to memory:

1. Upgrade Hostinger plan
2. Optimize Next.js build:
   ```bash
   npm run build -- --experimental-app-only
   ```

## Performance Optimization

### Enable Caching

Add to `next.config.js`:

```javascript
module.exports = {
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};
```

### Compress Assets

```bash
# Enable gzip compression in Nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### Monitor Performance

Use Hostinger's built-in monitoring or integrate with:
- Sentry (error tracking)
- New Relic (performance monitoring)
- Datadog (infrastructure monitoring)

## Rollback

To rollback to a previous version:

```bash
# SSH into server
ssh user@your-hostinger-server.com

# Navigate to application
cd /home/your-username/applications/stratix-ai-frontend

# Checkout previous commit
git checkout <commit-hash>

# Rebuild
npm install --legacy-peer-deps
npm run build

# Restart
pm2 restart stratix-frontend
```

## Support

For Hostinger support, visit [Hostinger Help Center](https://support.hostinger.com).

For STRATIX AI support, contact support@stratix.ai.
