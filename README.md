# ApexCRM - Enterprise Client Relationship Management System

ApexCRM is a high-fidelity, modern, responsive Client Relationship Management dashboard designed for sales teams. The application features a glassmorphic interface with real-time database syncing, secure authentication, and interactive CRM views.

---

## ✨ Features

- **🔐 Supabase Authentication**: Real-time user signup and sign-in with full access role routing (Sales Agent, Sales Director, CRM Manager, Data Analyst).
- **📊 Real-time Dashboard**: Synchronized metrics showcasing pipeline value, conversion rates, active leads, and current tasks.
- **💼 Leads Directory**: Complete lead pipelines allowing full CRUD (Create, Read, Update, Delete) capability.
- **🗂️ Contacts Registry**: Automatically compiled customer list synced from deals marked as "WON".
- **📋 Task Kanban Board**: Interactive task manager to move, update, and prioritize activities.
- **📈 Analytics Performance Reports**: Dynamic charts displaying pipeline distribution and status conversions.
- **⚡ Activity Logger**: Real-time logging of CRM pipeline modifications.
- **🎨 Visual Settings & Profile Info**:
  - Live Profile updates (Name, Email, Access Role).
  - Secure password credentials updating.
  - Global Theme toggling (Dark Theme / Light Theme).
  - Database backup export and sandbox reset.

---

## 🛠️ Tech Stack

- **Core**: React 19 (TypeScript), Vite
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Backend & Auth**: Supabase (Database, Auth)
- **Charts**: Chart.js, React-Chartjs-2

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Rokella-Medias/CRM.git
cd CRM
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the project (this file is excluded from commits via `.gitignore` to prevent secret leaks) and insert your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-api-key
```

Use the template in `.env.example` as a reference.

### 3. Setup Supabase Database
In your Supabase project dashboard, navigate to the **SQL Editor** and run the following script to initialize the database tables and enable Row Level Security (RLS) policies:

```sql
-- Create Leads Table
CREATE TABLE public.leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    value NUMERIC NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    created_date TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create Tasks Table
CREATE TABLE public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    desc_content TEXT,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    lead_id TEXT,
    due_date TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create Activities Table
CREATE TABLE public.activities (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create Policies (Restricting users to their own data records)
CREATE POLICY "Users can manage their own leads" ON public.leads
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tasks" ON public.tasks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own activities" ON public.activities
    FOR ALL USING (auth.uid() = user_id);
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Local Development Server
```bash
npm run dev
```

The application will be running locally at `http://localhost:5173`.

### 6. Build for Production
To build a production bundle, execute:
```bash
npm run build
```
The compiled static assets will be outputted to the `dist/` directory.

---

## 🗄️ File Structure
```text
CRM/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Brand logos & icons
│   ├── components/         # Reusable modal overlays & toast notifications
│   ├── context/
│   │   ├── AuthContext.tsx # Supabase Auth context (signIn, signUp, signOut, session)
│   │   └── CrmContext.tsx  # CRM DB CRUD syncing logic
│   ├── views/              # View pages (Dashboard, Leads, Contacts, Tasks, Analytics, Settings)
│   ├── App.tsx             # Route controller & layout frame
│   ├── main.tsx            # Entry point wrapping Providers
│   └── supabaseClient.ts   # Configured Supabase client
├── .env                    # Local secrets (ignored)
├── .env.example            # Environment template
└── eslint.config.js        # Linter rules
```
