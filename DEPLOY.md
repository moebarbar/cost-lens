# CostLens AI — Deployment Guide
# From zero to live in under 30 minutes

## Step-by-Step Deployment

### 1. Set Up PostgreSQL Database (5 minutes)

#### Option A: Neon (Recommended — free tier available)
1. Go to https://neon.tech and create an account
2. Click "New Project" → name it "costlens"
3. Copy the connection string (looks like: postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require)
4. Save this — you'll need it as DATABASE_URL

#### Option B: Supabase
1. Go to https://supabase.com and create a project
2. Go to Settings → Database → Connection String
3. Copy the URI connection string

#### Option C: Railway
1. Go to https://railway.app
2. Click "New Project" → "Provision PostgreSQL"
3. Copy the connection URL from the database settings

### 2. Push Code to GitHub (2 minutes)

```bash
cd costlens

# Initialize git
git init
git add .
git commit -m "Initial commit: CostLens AI MVP"

# Create GitHub repo (use GitHub CLI or web)
gh repo create costlens --private --push
# OR manually create on github.com and push:
git remote add origin https://github.com/YOUR_USERNAME/costlens.git
git push -u origin main
```

### 3. Deploy to Vercel (5 minutes)

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Import your "costlens" repository
4. In "Environment Variables", add:

```
DATABASE_URL          = postgresql://... (from step 1)
NEXTAUTH_URL          = https://your-app.vercel.app (update after first deploy)
NEXTAUTH_SECRET       = (generate with: openssl rand -base64 32)
ENCRYPTION_KEY        = (generate with: openssl rand -hex 32)
CRON_SECRET           = (generate with: openssl rand -base64 32)
```

5. Click "Deploy"
6. After deploy, copy your URL and update NEXTAUTH_URL in Vercel settings

### 4. Initialize Database (2 minutes)

After deployment, push the schema to your database:

```bash
# Install dependencies locally if not done
npm install

# Set DATABASE_URL in your local .env.local
# Then push the schema
npx prisma db push

# Verify tables were created
npx prisma studio
```

Or use Vercel's build step — the vercel.json is configured to run
`prisma generate` on every build automatically.

### 5. Create Your First Account (1 minute)

1. Go to https://your-app.vercel.app/register
2. Fill in your details
3. This creates your organization with default teams
4. Sign in at /login

### 6. Connect Your First AI Provider (2 minutes)

1. Go to Connectors tab in the dashboard
2. Click "+ Add Provider"
3. Select OpenAI or Anthropic
4. Paste your API key
5. Hit "Connect" — the system validates, encrypts, and starts syncing

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| NEXTAUTH_URL | Yes | Your app URL (e.g., https://costlens.vercel.app) |
| NEXTAUTH_SECRET | Yes | Random 32+ char secret for JWT signing |
| ENCRYPTION_KEY | Yes | Random 64 char hex string for credential encryption |
| CRON_SECRET | Yes | Secret for authenticating cron job requests |

### Generate Secrets

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY
openssl rand -hex 32

# CRON_SECRET
openssl rand -base64 32
```

---

## Post-Deployment Checklist

- [ ] App loads at your Vercel URL
- [ ] Registration works (creates org + user + default teams)
- [ ] Login works and redirects to dashboard
- [ ] Can add at least one AI provider connector
- [ ] Sync runs and populates cost records
- [ ] Dashboard shows real data from your providers
- [ ] Cron job runs every 6 hours (check Vercel → Cron Jobs tab)
- [ ] Budget alerts can be created
- [ ] Teams can be viewed and API keys mapped

---

## Custom Domain (Optional)

1. In Vercel → Project Settings → Domains
2. Add your domain (e.g., app.costlens.ai)
3. Add the DNS records Vercel provides
4. Update NEXTAUTH_URL to your custom domain

---

## Monitoring & Scaling

### Vercel Analytics
Enable in Vercel → Project → Analytics for page performance data.

### Database Monitoring
- Neon: Built-in dashboard at console.neon.tech
- Supabase: Built-in dashboard at app.supabase.com

### Scaling Notes
- Vercel auto-scales serverless functions
- For high-volume syncs (100+ orgs), consider moving sync to a background worker (Inngest, Trigger.dev, or Vercel Functions with longer timeouts)
- Database: Neon auto-scales reads; for write-heavy workloads, upgrade to Neon Pro

---

## Estimated Monthly Costs

| Service | Free Tier | Growth ($50K+ ARR) |
|---------|-----------|---------------------|
| Vercel | Free (hobby) | $20/mo (Pro) |
| Neon PostgreSQL | Free (0.5GB) | $19/mo (Launch) |
| Domain | — | $12/year |
| Total | $0/mo | ~$40/mo |

You can literally run this product for $0/month until you have paying customers.
