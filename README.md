# CostLens AI

**The financial control layer for enterprise AI spend.**

Track, attribute, and optimize every dollar your organization spends on AI — across every tool, API, and team.

---

## What This Does

CostLens AI connects to your AI providers (OpenAI, Anthropic, AWS Bedrock, etc.), pulls in all usage and billing data, normalizes it into a single dashboard, and shows you:

- **Total AI spend** broken down by provider, team, model, and project
- **Cost attribution** — who on your team is spending what
- **Waste detection** — unused subscriptions, overpriced model usage
- **Budget alerts** — get notified before costs spike
- **Optimization recommendations** — route tasks to cheaper models automatically

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Auth | NextAuth.js |
| Deployment | Vercel (recommended) |

---

## Project Structure

```
costlens/
├── prisma/
│   └── schema.prisma          # Database schema (all tables)
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── dashboard/     # Dashboard data endpoints
│   │       ├── connectors/    # Connector management + sync
│   │       ├── costs/         # Cost record queries
│   │       ├── teams/         # Team management + attribution
│   │       └── alerts/        # Budget alert CRUD
│   ├── lib/
│   │   ├── connectors/
│   │   │   ├── base.ts        # Base connector interface
│   │   │   ├── openai.ts      # OpenAI usage API connector
│   │   │   ├── anthropic.ts   # Anthropic usage API connector
│   │   │   └── registry.ts    # Connector factory + configs
│   │   ├── services/
│   │   │   ├── cost-aggregation.ts  # Dashboard query service
│   │   │   └── sync-engine.ts       # Sync orchestration
│   │   └── pricing-db.ts     # AI model pricing database
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── package.json
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone and Install

```bash
git clone https://github.com/your-repo/costlens.git
cd costlens
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
# Edit .env.local with your database URL and secrets
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to inspect data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Connecting AI Providers

### OpenAI

1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to Settings → API Keys
3. Create an **Admin API key** (required for usage data access)
4. In CostLens, go to Settings → Connectors → Add OpenAI
5. Paste your admin key

### Anthropic

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Navigate to API Keys
3. Create or copy your API key
4. In CostLens, go to Settings → Connectors → Add Anthropic
5. Paste your key

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Full dashboard data |
| GET | `/api/costs` | Query cost records (with filters) |
| POST | `/api/costs` | Add manual cost records |
| POST | `/api/connectors/sync` | Trigger provider sync |
| GET | `/api/connectors/sync` | Check sync status |
| GET | `/api/teams` | List teams with spend |
| POST | `/api/teams` | Create team |
| PUT | `/api/teams` | Update team / map API key |
| GET | `/api/alerts` | List budget alerts |
| POST | `/api/alerts` | Create alert |
| PUT | `/api/alerts` | Update alert |
| DELETE | `/api/alerts` | Delete alert |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

### Database

Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) for managed PostgreSQL.

---

## Roadmap

- [x] Database schema
- [x] OpenAI connector
- [x] Anthropic connector
- [x] Pricing database
- [x] Sync engine
- [x] API routes (dashboard, costs, teams, alerts)
- [ ] Dashboard UI (React frontend)
- [ ] Authentication (NextAuth)
- [ ] AWS Bedrock connector
- [ ] Azure OpenAI connector
- [ ] Google Vertex connector
- [ ] Invoice parsing engine
- [ ] Shadow AI discovery
- [ ] Optimization recommendations
- [ ] Email alert notifications
- [ ] CSV export
- [ ] Stripe billing integration

---

## License

Proprietary — All rights reserved.
