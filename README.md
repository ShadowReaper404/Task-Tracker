# TaskFlow — WSO2 Internship Project

A cloud-native task tracker built with:

- **Asgardeo** — Identity & authentication (WSO2)
- **Choreo** — Cloud deployment platform (WSO2)  
- **Ballerina** — Backend REST API (WSO2's own language)
- **React + Vite** — Frontend SPA

---

## Project Structure

```
wso2-task-tracker/
├── backend/
│   ├── Ballerina.toml     # Ballerina package config
│   └── service.bal        # REST API (8 endpoints)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── authConfig.js  # Asgardeo config
│   │   ├── hooks/
│   │   │   ├── useApi.js  # API calls with JWT auth
│   │   │   └── useTasks.js
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── TasksPage.jsx
│   │   └── components/
│   │       └── Layout.jsx
│   ├── .env.example
│   └── package.json
└── .choreo/
    ├── backend-component.yaml
    └── frontend-component.yaml
```

---

## Step 1 — Set up Asgardeo

1. Go to [https://asgardeo.io](https://asgardeo.io) and sign up
2. Create an **Organization** (e.g. `taskflow-org`)
3. Go to **Applications → New Application → Single Page Application**
4. Name: `TaskFlow`
5. Allowed redirect URL: `http://localhost:5173`
6. Copy the **Client ID**
7. In **User Attributes**, enable `email` and `displayName`

---

## Step 2 — Configure the frontend

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_ASGARDEO_ORG_NAME=your-org-name
VITE_ASGARDEO_CLIENT_ID=your-client-id
VITE_APP_URL=http://localhost:5173
```

---

## Step 3 — Run locally

### Backend (Ballerina)
```bash
# Install Ballerina: https://ballerina.io/downloads/
cd backend
bal run
# API running at http://localhost:8090
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

---

## Step 4 — Deploy on Choreo

1. Push this repo to GitHub
2. Go to [https://console.choreo.dev](https://console.choreo.dev)
3. Create a **Project** → **Add Component**

### Deploy the API
- Type: **Service**
- Build pack: **Ballerina**
- Build context: `backend/`
- After deploy, copy the **Service URL**

### Deploy the Frontend
- Type: **Web Application**
- Build pack: **Node.js**
- Build context: `frontend/`
- Build command: `npm run build`
- Output directory: `dist`
- Add environment variables in Choreo dashboard:
  - `VITE_ASGARDEO_ORG_NAME`
  - `VITE_ASGARDEO_CLIENT_ID`
  - `VITE_API_URL` → paste the backend service URL
  - `VITE_APP_URL` → the Choreo web app URL

### Connect Asgardeo as IDP
In Choreo dashboard → your web app → **Security** → select your Asgardeo org

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/tasks` | List user's tasks |
| GET | `/api/v1/tasks/stats` | Task statistics |
| POST | `/api/v1/tasks` | Create a task |
| PUT | `/api/v1/tasks/{id}` | Update a task |
| DELETE | `/api/v1/tasks/{id}` | Delete a task |

All endpoints (except health) require a valid Asgardeo JWT.

---

## Features

- 🔐 Secure login via Asgardeo (SSO, Google, username/password)
- 📊 Dashboard with real-time stats and completion tracking
- ✅ Full CRUD — create, edit, delete tasks
- 🎯 Priority levels (High / Medium / Low)
- 📅 Due dates with overdue detection
- 🔍 Filter and search tasks
- ☁️ Deployed entirely on WSO2 Choreo

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Identity | WSO2 Asgardeo |
| Deployment | WSO2 Choreo |
| Backend | Ballerina 2201.8.x |
| Frontend | React 18 + Vite 5 |
| Auth SDK | @asgardeo/auth-react |
| Styling | CSS Modules |
