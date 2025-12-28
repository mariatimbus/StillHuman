# Deploy Still Human to Vercel

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com with your GitHub)

## Step 1: Push to GitHub

1. Create a new repository on GitHub (github.com/new)
   - Name it "StillHuman" or your preferred name
   - **Do NOT initialize** with README, .gitignore, or license
   - Click "Create repository"

2. Connect your local repo to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/StillHuman.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New..." → "Project"
3. Import your StillHuman repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `.next` (should be auto-detected)

5. **Environment Variables** - Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ADMIN_PASSWORD=your_admin_password
   ```

6. Click "Deploy"
7. Wait 2-3 minutes for the build to complete
8. Your app will be live at `https://your-project-name.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

## Step 3: Set Up Environment Variables

After deploying, go to your project settings on Vercel:
1. Click your project name
2. Go to "Settings" → "Environment Variables"
3. Add all variables from your `.env.local` file

## Step 4: Redeploy (if needed)

After adding environment variables:
1. Go to "Deployments"
2. Click the "..." menu on the latest deployment
3. Click "Redeploy"

## Automatic Deployments

Every time you push to GitHub, Vercel will:
- Automatically build and deploy your changes
- Create a preview URL for each commit
- Deploy to production when you merge to main

## Custom Domain (Optional)

1. Go to your project on Vercel
2. Click "Settings" → "Domains"  
3. Add your custom domain and follow the DNS instructions

---

**Your Still Human app is now live!** 🎉
