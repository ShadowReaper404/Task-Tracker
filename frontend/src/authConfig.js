// ─────────────────────────────────────────────────────────────
//  Asgardeo Auth Configuration
//
//  How to fill this in:
//  1. Go to https://asgardeo.io and sign up / log in
//  2. Create an organization (e.g. "my-task-tracker")
//  3. Go to Applications → New Application → Single Page Application
//  4. Name it "Task Tracker", set redirect URL to http://localhost:5173
//  5. Copy the Client ID into VITE_ASGARDEO_CLIENT_ID in your .env file
//  6. Copy the org name into VITE_ASGARDEO_BASE_URL
// ─────────────────────────────────────────────────────────────

const authConfig = {
  signInRedirectURL: import.meta.env.VITE_APP_URL || "http://localhost:5173",
  signOutRedirectURL: import.meta.env.VITE_APP_URL || "http://localhost:5173",
  clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID || "YOUR_CLIENT_ID_HERE",
  baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL ||
    "https://api.asgardeo.io/t/YOUR_ORG_NAME",
  scope: ["openid", "profile", "email"],
};

export default authConfig;
