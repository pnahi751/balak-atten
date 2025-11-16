# Deployment Guide

This guide covers deploying the Student Attendance Tracker to production environments.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides seamless React deployment with automatic builds.

#### Prerequisites
- GitHub/GitLab account
- Vercel account (free tier works)
- Supabase project already set up

#### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Student Attendance Tracker"
   git branch -M main
   git remote add origin https://github.com/your-username/attendance-tracker.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: **Vite**
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Click "Deploy"

3. **Environment Variables**
   
   Vercel will handle Supabase configuration automatically if you're using Figma Make's Supabase integration.
   
   For manual setup, add these environment variables in Vercel:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Option 2: Netlify

Another excellent option for React apps.

#### Steps

1. **Push to Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Configure:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables (if needed)
   - Click "Deploy site"

### Option 3: Self-Hosted (VPS/Cloud)

For full control, deploy on your own server.

#### Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 16+
- Nginx
- PM2 (for process management)
- SSL certificate (Let's Encrypt recommended)

#### Steps

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install Nginx
   sudo apt install -y nginx
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   cd /var/www
   git clone https://github.com/your-username/attendance-tracker.git
   cd attendance-tracker
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   ```

3. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/attendance-tracker
   ```
   
   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       root /var/www/attendance-tracker/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
       
       # Cache static assets
       location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```
   
   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/attendance-tracker /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

5. **Configure PM2 for Auto-start**
   ```bash
   # If you need to run a Node server (not just static files)
   pm2 start npm --name "attendance-tracker" -- start
   pm2 save
   pm2 startup
   ```

## 🔐 Production Security Checklist

Before going live, ensure:

### Authentication
- [ ] Change default admin password
- [ ] Set up password reset functionality
- [ ] Enable 2FA if possible (future enhancement)
- [ ] Use strong passwords (min 12 characters)

### Database
- [ ] Enable Row Level Security (RLS) - Already done ✅
- [ ] Review RLS policies
- [ ] Set up database backups (Supabase auto-backups on paid plans)
- [ ] Monitor database size and usage
- [ ] Set up connection pooling if needed

### Storage
- [ ] Review storage bucket policies
- [ ] Set file size limits (5MB already set)
- [ ] Enable virus scanning (if available)
- [ ] Monitor storage usage
- [ ] Set up CDN for images (optional)

### Application
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up CORS properly
- [ ] Configure CSP headers
- [ ] Enable rate limiting
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure logging
- [ ] Set up monitoring/alerts

### Data Privacy
- [ ] Add privacy policy
- [ ] Add terms of service
- [ ] Implement GDPR/compliance measures if applicable
- [ ] Set up data retention policies
- [ ] Configure user consent mechanisms
- [ ] Enable audit logging

## 📊 Performance Optimization

### Frontend Optimization

1. **Code Splitting**
   - Already handled by Vite
   - Lazy load routes if needed

2. **Image Optimization**
   ```typescript
   // Consider adding image compression before upload
   // Use WebP format when possible
   // Implement lazy loading for images
   ```

3. **Caching Strategy**
   - Cache static assets (CSS, JS, images)
   - Use service workers (optional)
   - Implement browser caching headers

### Backend Optimization

1. **Database Indexes**
   - Already created in setup script ✅
   - Monitor slow queries

2. **Query Optimization**
   - Use select specific columns instead of `*`
   - Implement pagination (already done ✅)
   - Add database query caching if needed

3. **CDN Setup**
   - Use Cloudflare or similar for static assets
   - Enable global edge caching

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 📱 Mobile App Considerations

### Progressive Web App (PWA)

Convert to PWA for mobile installation:

1. **Add manifest.json**
   ```json
   {
     "name": "Student Attendance Tracker",
     "short_name": "Attendance",
     "description": "Track student attendance",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#4F46E5",
     "icons": [
       {
         "src": "/icon-192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "/icon-512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   ```

2. **Add Service Worker**
   ```javascript
   // service-worker.js
   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open('attendance-v1').then((cache) => {
         return cache.addAll([
           '/',
           '/index.html',
           '/assets/index.css',
           '/assets/index.js'
         ]);
       })
     );
   });
   ```

## 🔍 Monitoring & Maintenance

### Set Up Monitoring

1. **Application Performance**
   - Use Vercel Analytics (if on Vercel)
   - Or Google Analytics
   - Or Plausible Analytics (privacy-friendly)

2. **Error Tracking**
   ```bash
   npm install @sentry/react
   ```
   
   Configure Sentry:
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     environment: "production",
   });
   ```

3. **Uptime Monitoring**
   - UptimeRobot (free)
   - Pingdom
   - StatusCake

### Database Backups

1. **Automated Backups** (Supabase Pro)
   - Daily automatic backups
   - Point-in-time recovery

2. **Manual Backups**
   ```sql
   -- Export students
   COPY students TO '/tmp/students_backup.csv' CSV HEADER;
   
   -- Export attendance
   COPY attendance TO '/tmp/attendance_backup.csv' CSV HEADER;
   ```

3. **Backup Schedule**
   - Daily: Automatic Supabase backups
   - Weekly: Manual CSV exports
   - Monthly: Full database dump

## 🆘 Disaster Recovery

### Backup Strategy

1. **Database**: Daily automated backups via Supabase
2. **Storage**: Photos stored in Supabase Storage with redundancy
3. **Code**: Version controlled in Git

### Recovery Procedure

1. **Database Recovery**
   - Use Supabase dashboard to restore from backup
   - Or import from CSV exports

2. **Application Recovery**
   - Redeploy from Git
   - Restore environment variables
   - Verify database connections

## 📈 Scaling Considerations

### When to Scale

Monitor these metrics:
- Database size > 80% of plan limit
- API requests approaching rate limits
- Storage usage > 80% of plan limit
- Response times > 2 seconds

### Scaling Options

1. **Database**
   - Upgrade Supabase plan
   - Add read replicas
   - Implement caching layer

2. **Storage**
   - Upgrade storage plan
   - Implement image compression
   - Use CDN for serving images

3. **Application**
   - Horizontal scaling (multiple instances)
   - Load balancer
   - Redis caching

## 🧪 Testing Before Launch

### Pre-launch Checklist

- [ ] Test all features in production environment
- [ ] Verify admin login works
- [ ] Test student CRUD operations
- [ ] Mark attendance for multiple classes
- [ ] Generate and export reports
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Verify image uploads work
- [ ] Check CSV exports
- [ ] Test with slow network
- [ ] Verify all validations work
- [ ] Test error handling
- [ ] Check responsive design
- [ ] Verify SSL certificate
- [ ] Test logout functionality

### Load Testing

Use tools like:
- Apache Bench (ab)
- Artillery
- k6

Example test:
```bash
# Install k6
brew install k6

# Run load test
k6 run loadtest.js
```

## 🎓 Production Best Practices

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Apply patches promptly

2. **Documentation**
   - Keep README updated
   - Document custom configurations
   - Maintain changelog

3. **User Training**
   - Create user guides
   - Conduct training sessions
   - Provide support channel

4. **Legal Compliance**
   - Add privacy policy
   - Terms of service
   - Cookie consent (if using analytics)
   - Data protection compliance

## 📞 Support & Maintenance

### Support Channels
- Email: admin@yourschool.com
- Phone: +91-XXXX-XXXXXX
- In-app feedback form (future enhancement)

### Maintenance Windows
- Schedule: Sundays 2:00 AM - 4:00 AM IST
- Notify users 48 hours in advance
- Use maintenance page during updates

## ✅ Production Launch Checklist

Final checklist before going live:

- [ ] All tests passing
- [ ] Documentation complete
- [ ] Admin password changed
- [ ] SSL certificate installed
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Error tracking active
- [ ] Performance optimized
- [ ] Security review complete
- [ ] Legal pages added
- [ ] User training completed
- [ ] Support system ready
- [ ] Rollback plan prepared

---

**Ready to deploy? Follow the checklist and you're good to go! 🚀**

For questions, refer to the main README.md or contact your system administrator.
