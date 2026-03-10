# CostLens AI — Railway Deployment Guide
# Deploy the full app + database in one platform

## Step 1: Create a New Project in Railway

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Connect your GitHub and select the costlens repo

## Step 2: Add PostgreSQL

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway auto-generates the DATABASE_URL
4. Click on the PostgreSQL service → "Variables" tab
5. Copy the DATABASE_URL (you'll need it in Step 3)

## Step 3: Set Environment Variables

Click on your app service (not the database) → "Variables" tab → Add these:

```
DATABASE_URL        = ${{Postgres.DATABASE_URL}}   ← Use Railway's variable reference
NEXTAUTH_URL        = https://your-app.up.railway.app  ← Update after first deploy
NEXTAUTH_SECRET     = (generate: openssl rand -base64 32)
ENCRYPTION_KEY      = (generate: openssl rand -hex 32)
CRON_SECRET         = (generate: openssl rand -base64 32)
PORT                = 3000
```

**Pro tip:** For DATABASE_URL, use Railway's built-in variable reference
`${{Postgres.DATABASE_URL}}` — it auto-connects your app to the database.

## Step 4: Configure Build Settings

In your app service → "Settings" tab:

- **Build Command:** `npx prisma generate && npx prisma db push && npm run build`
- **Start Command:** `npm start`
- **Watch Paths:** Leave empty (deploy on every push)

The build command does 3 things:
1. Generates the Prisma client
2. Pushes the database schema (creates all tables)
3. Builds the Next.js app

## Step 5: Deploy

Railway auto-deploys when you push to GitHub.
First deploy takes ~2-3 minutes.

After deploy:
1. Click "Settings" → find your public URL (e.g., costlens-production.up.railway.app)
2. Go back to "Variables" and update NEXTAUTH_URL to match this URL
3. Railway will auto-redeploy with the updated URL

## Step 6: Add a Custom Domain (Optional)

1. In your app service → "Settings" → "Networking"
2. Click "Generate Domain" for a free Railway subdomain
3. OR click "Custom Domain" and add your own (e.g., app.costlens.ai)
4. Add the CNAME record Railway gives you to your DNS provider
5. Update NEXTAUTH_URL to your custom domain

## Step 7: Set Up Cron Jobs

Railway doesn't have built-in cron like Vercel, but you have two options:

### Option A: Railway Cron Service (Recommended)
1. In your project, click "+ New" → "Cron Job"
2. Set schedule: `0 */6 * * *` (every 6 hours)
3. Set command: `curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.up.railway.app/api/cron/sync`

### Option B: Use cron-job.org (Free)
1. Go to https://cron-job.org
2. Create a free account
3. Add a new cron job:
   - URL: https://your-app.up.railway.app/api/cron/sync
   - Schedule: Every 6 hours
   - Header: Authorization: Bearer YOUR_CRON_SECRET
   - Method: GET

---

## Railway-Specific Configuration

### Procfile (Already handled by Railway)
Railway detects Next.js automatically. If you need to override:

```
web: npm start
```

### Health Check
Railway can monitor your app. Add a health endpoint:
The app already has one at: GET /api/auth/me (returns 401 if not logged in, which confirms the server is running)

### Logs
- Click on your service → "Logs" tab
- See real-time build and runtime logs
- Filter by "Build" or "Deploy" for specific phases

### Scaling
- Railway auto-scales based on usage
- Free plan: $5/month credit (enough for MVP)
- Pro plan: $20/month (recommended once you have customers)
- Add more RAM/CPU in Settings → Resources if needed

---

## Estimated Monthly Costs on Railway

| Stage | PostgreSQL | App Hosting | Total |
|-------|-----------|-------------|-------|
| MVP (free tier) | ~$1-2 | ~$2-3 | ~$3-5/mo |
| Early customers (10-50) | ~$5-10 | ~$5-10 | ~$10-20/mo |
| Growth (50-200) | ~$20-40 | ~$15-25 | ~$35-65/mo |

Railway's usage-based pricing means you only pay for what you use.
The $5 free credit covers most MVP usage.

---

## Quick Deploy Checklist

- [ ] GitHub repo connected to Railway
- [ ] PostgreSQL service added in same project
- [ ] DATABASE_URL references the Postgres service
- [ ] NEXTAUTH_SECRET, ENCRYPTION_KEY, CRON_SECRET set
- [ ] First deploy succeeds (check build logs)
- [ ] NEXTAUTH_URL updated to your Railway URL
- [ ] Can register at /register
- [ ] Can login at /login
- [ ] Dashboard loads
- [ ] Cron job configured for automated syncing
- [ ] Custom domain added (optional)
