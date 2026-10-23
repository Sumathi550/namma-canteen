# 🚀 Namma Canteen - Run & Cloudflare Deployment Guide

## 1. Local-la Run Panradhu Eppadi (Local Development)

### Method 1: 1-Click Launch (Super Easy)
Folder-la irukira [start-all.bat](file:///c:/Users/HP/OneDrive/Desktop/canteen%20mang/start-all.bat) file-ah double click pannunga!
Ithu automatic-ah 3 separate windows open panni run pannum:
- **Backend API**: `http://localhost:5000` (Health: `http://localhost:5000/api/health`)
- **Student Ordering App**: `http://localhost:5173`
- **Staff & Kitchen KDS**: `http://localhost:5174`

### Method 2: Terminal വഴി Run Panradhu
VS Code / PowerShell terminal open panni:
```bash
npm run dev
```
(Ithu Backend, Student Frontend, and Staff Portal moonayum concurrently start pannum).

---

## 2. Cloudflare-la Deploy Panradhu Eppadi

### Architecture Purinjukonga:
- **Frontend & Staff Portal (React + Vite)**: **Cloudflare Pages**-la deploy aagum (Fast CDN, Free SSL, Unlimited Bandwidth).
- **Backend API (Node.js + Express + MongoDB)**: Cloudflare Pages purely frontend host. Backend-ah **Render.com** (Free) allathu **Railway**-la deploy panna vendum.

---

### Step 1: Backend Deploy Panradhu (Render.com - 100% Free)

1. [Render.com](https://render.com)-la login pannunga.
2. **New +** -> **Web Service** click pannunga.
3. Unga GitHub repo-va select pannunga.
4. Settings:
   - **Root Directory**: `smart-canteen/backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. **Environment Variables** add pannunga:
   - `MONGO_URI`: `mongodb://sumathiaz550_db_user:canteen123456@ac-psrt83a-shard-00-00.3trp25y.mongodb.net:27017,...` (backend/.env-la ulladhu)
   - `PORT`: `5000`
   - `JWT_SECRET`: `5d19ea05311d5b54a22471d264e6c0b17d00f304e49f93c2f8ded57fdc3e3cd6`
6. Click **Deploy Web Service**. Ungalukku backend URL kidaikum (e.g., `https://canteen-backend.onrender.com`).

---

### Step 2: Frontends-ah Cloudflare Pages-la Deploy Panradhu

#### Option A: Terminal / Wrangler CLI valiya Direct Deploy (Fastest)

1. **Cloudflare-ku Login pannunga**:
   ```bash
   npx wrangler login
   ```
   (Browser open aagi Cloudflare login approve panna sollum).

2. **Frontend Build & Deploy**:
   ```bash
   npm run build:all
   npm run deploy:canteen
   ```
   Prompt vantha:
   - *Create a new project?* -> `Yes`
   - *Project name*: `namma-canteen-student`
   - *Production branch*: `main`

3. **Staff Portal Deploy**:
   ```bash
   npm run deploy:staff
   ```
   Prompt vantha:
   - *Create a new project?* -> `Yes`
   - *Project name*: `namma-canteen-staff`
   - *Production branch*: `main`

---

#### Option B: Cloudflare Web Dashboard (GitHub Integration)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. **Student Portal Settings**:
   - **Project Name**: `namma-canteen-student`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `smart-canteen/frontend`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL`: `<Unga_Backend_URL>/api` (e.g., `https://canteen-backend.onrender.com/api`)
3. **Staff Portal Settings**:
   - Same steps, ana **Root Directory**: `smart-canteen/staff-portal`
   - **Project Name**: `namma-canteen-staff`
   - **Environment Variables**:
     - `VITE_API_URL`: `<Unga_Backend_URL>/api`

> **Note**: Both frontends have `_redirects` pre-configured, so page refresh on React Router won't throw 404!
