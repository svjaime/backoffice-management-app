# Backoffice Management App

A full-stack system built with **Next.js on Vercel (frontend)** and **Hono on Cloudflare Workers (backend)**.

## Live URLs

- **Frontend:** [https://bma-project-fe.vercel.app/](https://bma-project-fe.vercel.app/)
- **Backend API:** [https://backend.jaime-verde.workers.dev/](https://backend.jaime-verde.workers.dev/)
- **API Docs:** [https://backend.jaime-verde.workers.dev/docs](https://backend.jaime-verde.workers.dev/docs)

---

## Local Setup Instructions

### 1. Clone the Repository

### 2. Install Dependencies

```bash
cd backend
npm install

cd frontend
npm install
```

### 3. Setup Environment Variables

```bash
# Backend: Create .dev.vars and add JWT_SECRET
echo 'JWT_SECRET=your_secret_here' > backend/.dev.vars

# Frontend: Create .env.local and add the API base URL
echo 'NEXT_PUBLIC_API_BASE_URL=http://localhost:8787' > frontend/.env.local
```

### 3. Initialize the Database

```bash
cd backend
npx wrangler d1 migrations apply spinanda-db --local
```

This will set up the database with test users:

- User: `user@test.com` / password: `test`
- Admin: `admin@test.com` / password: `test`

> Note: These are also available in the live environment

### 4. Start the App

```bash
# Start backend
cd backend
npm run dev  # Runs on http://localhost:8787

# Start frontend
cd frontend
npm run dev  # Runs on http://localhost:3000
```
