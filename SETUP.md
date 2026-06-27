# Vyas Finserv - Setup Guide

## 1. Supabase Setup

1. Go to https://supabase.com and create a free account
2. Create a new project (name: `vyas-finserv`)
3. Go to **SQL Editor** and run the contents of `supabase_schema.sql`
4. Go to **Settings → API** and copy:
   - **Project URL** → paste into both `.env` files
   - **anon public key** → paste into `frontend/.env`
   - **service_role secret key** → paste into `backend/.env`

## 2. Configure Environment Variables

### frontend/.env
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:5000
VITE_WHATSAPP_NUMBER=917878793428
```

### backend/.env
```
PORT=5000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
FRONTEND_URL=http://localhost:5173
ADMIN_KEY=vyasfinserv@admin2024
```

## 3. Run the App

### Option A: Use start.bat (Windows)
Double-click `start.bat`

### Option B: Manual
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 4. Access

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Main website |
| http://localhost:5173/apply | Loan application form |
| http://localhost:5173/admin | CRM dashboard |
| http://localhost:5000/api/health | API health check |

## 5. Admin CRM Login
Password: `vyasfinserv@admin2024`
(Change this in backend/.env → ADMIN_KEY)

## 6. WhatsApp Auto-Message
After form submission, WhatsApp automatically opens with all applicant details pre-filled and sent to **+91 7878793428**.

## Project Structure
```
D:\dummy\
├── frontend/          React + Vite
│   └── src/
│       ├── components/  Navbar, Footer, Calculator, WhatsApp button
│       └── pages/       Home, Apply, Admin CRM, ThankYou
├── backend/           Node.js + Express API
│   └── index.js       REST API with Supabase
├── supabase_schema.sql Database schema
└── start.bat          Quick start script
```
