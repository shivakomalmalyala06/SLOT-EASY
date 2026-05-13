# SLOT EASY - Deployment Guide

## ✅ GitHub Deployment - COMPLETED ✓

Your project has been successfully pushed to GitHub:
- Repository: https://github.com/shivakomalmalyala06/SLOT-EASY
- Branch: master
- Files: 13 tracked files (node_modules excluded)

## 🚀 Vercel Deployment Guide

### Step 1: Prepare Vercel Configuration

✓ Already created `vercel.json` configuration file

### Step 2: Update package.json for Vercel

Make sure your package.json has the correct start script and includes the `@vercel/node` dependency.

### Step 3: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```
(Opens browser for authentication)

3. **Deploy:**
```bash
vercel
```
- Select "Y" to use current directory
- Select "Y" to use project settings
- Select "N" to override settings

#### Option B: Using GitHub Integration (Easiest)

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select "Import Git Repository"
4. Paste your GitHub URL: https://github.com/shivakomalmalyala06/SLOT-EASY
5. Click "Continue"
6. Configure Project:
   - Framework: Other
   - Build Command: Leave empty (no build needed for static files)
   - Output Directory: Leave empty
7. Add Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `GEMINI_API_KEY`
8. Click "Deploy"

### Step 4: Environment Variables in Vercel

After deploying, add your environment variables:

1. Go to your project in Vercel dashboard
2. Settings → Environment Variables
3. Add each variable:
   - `SUPABASE_URL` = your_supabase_url
   - `SUPABASE_ANON_KEY` = your_supabase_anon_key
   - `RESEND_API_KEY` = your_resend_api_key
   - `GEMINI_API_KEY` = your_gemini_api_key
4. Redeploy after adding variables

### Step 5: Configure Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your domain
3. Update DNS records with Vercel's nameservers

## 🔧 Project Structure Analysis for Vercel

### Current Structure:
```
slot-easy-frontend/
├── server.js              ✓ Backend API
├── *.html files           ✓ Static pages
├── styles.css             ✓ Styling
├── script.js              ✓ Frontend JavaScript
├── package.json           ✓ Dependencies
└── supabase/              ✓ Serverless functions
```

### Vercel Compatibility:
✅ Node.js Backend Support
✅ Static File Serving
✅ Serverless Functions
✅ Environment Variables
✅ Custom Domains
✅ SSL Certificates (Free)

## ⚙️ Alternative: Recommend Project Restructuring

For better Vercel deployment, consider:

1. **Move HTML files to public/ folder:**
```
public/
├── index.html
├── booking.html
├── confirmation.html
├── dashboard.html
├── login.html
├── styles.css
└── script.js
```

2. **Keep server.js at root level**

3. **Update vercel.json routing**

## 🔗 API Endpoints After Deployment

Once deployed to Vercel, your APIs will be available at:
- `https://your-vercel-domain.vercel.app/send-email`
- `https://your-vercel-domain.vercel.app/chat`
- `https://your-vercel-domain.vercel.app/`

## ⚠️ Important Notes

1. **Vercel Free Plan Limitations:**
   - Serverless functions timeout: 10 seconds
   - Cold start delays
   - Limited bandwidth

2. **Environment Variables:**
   - Must be set in Vercel dashboard
   - Not stored in code for security

3. **Supabase Connection:**
   - Ensure CORS is configured
   - Database must be accessible from Vercel

4. **Email Delivery:**
   - Resend API requires valid API key
   - Test with small volume first

## 🚀 Deployment Checklist

- [ ] GitHub repository created and synced
- [ ] vercel.json configured
- [ ] Environment variables prepared
- [ ] Vercel CLI installed (optional)
- [ ] Vercel account created at https://vercel.com
- [ ] Project connected to Vercel
- [ ] Environment variables added in Vercel dashboard
- [ ] Deployment successful
- [ ] Test all endpoints
- [ ] Custom domain configured (optional)

## 📊 Monitoring

After deployment:
1. Check Vercel Analytics for traffic
2. Monitor function execution time
3. Track error logs in Vercel dashboard
4. Set up alerts for deployment failures

## 🆘 Troubleshooting

### Issue: "Cannot find module"
**Solution:** Ensure all dependencies are in package.json

### Issue: Environment variables undefined
**Solution:** Add them in Vercel dashboard Settings → Environment Variables

### Issue: CORS errors
**Solution:** Update server.js CORS configuration with Vercel domain

### Issue: Long response time
**Solution:** Optimize server.js code or use Vercel Pro plan

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- GitHub Help: https://docs.github.com
- Supabase Docs: https://supabase.com/docs

---

**Next Step:** Choose Option A or B above to deploy to Vercel!
