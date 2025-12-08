# ✅ Convex Production Setup Checklist

## Current Status: Ready for Production

Your Convex is configured to work in production just like Prisma does. Here's what's already set up:

### ✅ What's Already Configured:

1. **Production Convex Deployment**: `prod:academic-fly-239`
2. **Convex URL**: `https://academic-fly-239.convex.cloud`
3. **Global Singleton Pattern**: `lib/convex.ts` (similar to Prisma's `lib/db.ts`)
4. **Provider Setup**: `ConvexClientProvider` wraps your app
5. **Vercel Config**: `vercel.json` has environment variable
6. **Fallback URL**: Built-in fallback for build time

---

## 🚀 To Enable Convex in Production (Vercel):

### Step 1: Ensure Environment Variables in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these for **Production, Preview, and Development**:

```bash
NEXT_PUBLIC_CONVEX_URL=https://academic-fly-239.convex.cloud
CONVEX_DEPLOYMENT=prod:academic-fly-239
```

### Step 2: Verify Convex Functions are Deployed

Run locally to ensure your Convex functions are deployed to production:

```bash
npx convex deploy
```

This deploys all your Convex functions (`problems.ts`, `submissions.ts`, `userProgress.ts`, `seedLargeDataset.ts`) to production.

### Step 3: Deploy to Vercel

```bash
git add .
git commit -m "Production-ready with Convex real-time data"
git push origin main
```

Vercel will automatically deploy.

---

## 🔄 How Convex Works in Production (Similar to Prisma):

### Prisma (Database):
```typescript
// lib/db.ts
export const prisma = globalForPrisma.prisma || new PrismaClient();
```
- Connects to PostgreSQL (Neon)
- Reads/writes data via SQL queries
- Server-side only

### Convex (Real-time Database):
```typescript
// lib/convex.ts
export const convexClient = globalForConvex.convex || new ConvexReactClient(getConvexUrl());
```
- Connects to Convex Cloud (`academic-fly-239.convex.cloud`)
- Real-time subscriptions via WebSocket
- Works on both client and server
- Auto-updates when data changes

---

## 📊 What Works in Production:

### Real-time Features:
✅ **Brainstack Problems** - All 500+ problems stored in Convex
✅ **Live Updates** - When you submit code, leaderboard updates instantly
✅ **User Progress** - Tracks solved problems in real-time
✅ **Submissions** - All submissions saved to Convex
✅ **Stats** - Real-time problem statistics (acceptance rate, attempts)

### How Data Flows:

1. **User submits code** → Frontend calls Convex mutation
2. **Convex processes** → Updates database in real-time
3. **All connected clients** → Automatically receive updates via WebSocket
4. **No polling needed** → Convex pushes updates instantly

---

## 🧪 Test Real-time Updates:

After deployment, test real-time functionality:

1. **Open Brainstack** (`/dashboard/playground/brainstack`)
2. **Open in 2 browser tabs**
3. **Submit a solution in Tab 1**
4. **Watch Tab 2 update automatically** (stats, progress, submissions)

This is the power of Convex - real-time reactivity like Firebase, but with type-safety and better developer experience.

---

## 🔍 Verify Convex is Working:

### Check Convex Dashboard:
1. Go to [https://dashboard.convex.dev](https://dashboard.convex.dev)
2. Select project: `codebreakers-codespace`
3. Click on `academic-fly-239` deployment
4. Check **Data** tab - you should see:
   - `problems` table (500+ rows after seeding)
   - `submissions` table
   - `userProgress` table

### Check Vercel Logs:
After deployment, check Vercel logs for Convex connection:
- Should see WebSocket connections to `academic-fly-239.convex.cloud`
- No "No address provided" errors

---

## 🆚 Convex vs Prisma in Production:

| Feature | Prisma | Convex |
|---------|--------|--------|
| **Connection** | PostgreSQL (Neon) | Convex Cloud |
| **Query Type** | SQL | TypeScript Functions |
| **Real-time** | ❌ (need polling) | ✅ (WebSocket) |
| **Type Safety** | ✅ | ✅ |
| **Caching** | Manual | Automatic |
| **Offline** | ❌ | ✅ (with sync) |
| **Scalability** | Manual | Automatic |

Both work together in your app:
- **Prisma** → User auth, profiles, projects (traditional CRUD)
- **Convex** → Brainstack problems, submissions, real-time features

---

## 🐛 Troubleshooting:

### "No address provided to ConvexReactClient"
**Fix**: Ensure `NEXT_PUBLIC_CONVEX_URL` is set in Vercel environment variables.

### "401 Unauthorized" during build
**Fix**: Already handled - `prebuild` now skips on Vercel.

### Questions not showing in dashboard
**Fix**: After deployment, visit `/dashboard/playground/brainstack/seed` and click "Seed Problems".

### Real-time not working
**Fix**: Check Convex deployment is `prod:academic-fly-239`, not `dev:`.

---

## ✨ Next Steps:

1. ✅ Add `NEXT_PUBLIC_CONVEX_URL` to Vercel
2. ✅ Run `npx convex deploy` locally
3. ✅ Push to GitHub
4. ✅ Deploy to Vercel
5. ✅ Seed problems in production
6. ✅ Test real-time updates

Your Convex will work in production exactly like Prisma - seamlessly and automatically! 🚀
