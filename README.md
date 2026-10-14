# ⚽ LEAGUE — Football Auction Management System

A real-time football auction management platform built with Expo, React Native, TypeScript, and Supabase.

LEAGUE enables administrators to conduct football player auctions, managers to manage their teams, and viewers to follow the auction in real time across multiple devices.

🌐 **Live Demo:** https://hamaarasuperleague.expo.app

---

## ✨ Features

### 👑 Admin Dashboard
- Manage and control football auctions.
- Manage players and auction results.
- Monitor team budgets and remaining balances.
- Manage manager PINs.
- Control the auction workflow.

### 👥 Manager Dashboard
- Access manager functionality using individual PINs.
- View assigned team information.
- Track players acquired during the auction.
- Monitor team budgets and remaining balances.

### 👀 Viewer Mode
- Follow the auction without accessing administrative controls.
- View team balances and players acquired by other teams.
- Receive live auction updates across connected devices.

### ⚽ Auction Management
- Player management and player cards.
- Shared auction state across connected devices.
- Real-time synchronization through Supabase Realtime.
- Player image storage through Supabase Storage.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React Native | Application UI |
| Expo | Development and deployment |
| Expo Router | Navigation and routing |
| TypeScript | Type-safe application development |
| Supabase | Backend and database |
| Supabase Realtime | Live auction synchronization |
| Supabase Storage | Player image storage |

---

## 🔑 Demo Credentials

This project currently uses a simplified, client-side authentication mechanism for demonstration purposes.

### Administrator

- **Demo password:** `UG3PU`
- **Authentication:** Hardcoded in the client-side application.

### Managers

- Managers use individual PINs.
- Manager PINs can be reset by the administrator.

> ⚠️ **Important:** These credentials are intended only for demonstration and testing. Do not reuse them in production.

The administrator password and client-side authentication logic are visible to anyone who inspects the source code.

The demo password above should be verified against the recovered source code before use.

---

## 🚀 Getting Started

### Prerequisites

Install the following:

- Node.js
- npm
- Git
- A Supabase account


1. Clone the repository
```bash
git clone https://github.com/aquil418/football-auction-app.git
cd football-auction-app

2. Install dependencies
npm install
3. Configure environment variables

Copy .env.example to .env.

On Windows PowerShell:

Copy-Item .env.example .env

Add your Supabase project credentials to .env:

EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY

Replace the placeholders with the appropriate values from your Supabase project.

Never place a Supabase service-role key or other privileged credentials in client-side environment variables.

4. Configure Supabase
Create a Supabase project.
Open the Supabase SQL Editor.
Review and execute supabase-schema.sql.
Configure the required database tables, Realtime functionality, storage bucket, and access policies.
Ensure the environment variables match your project.

Refer to README-SYNC.md for additional setup instructions.

5. Run the application

Start the web application:

npx expo start --web

Open the local URL displayed in the terminal.

To test synchronization, open the application in multiple browser windows or devices.

🏗️ Architecture

LEAGUE uses a shared backend so connected clients can observe the same auction state.

The application uses:

Expo Router for navigation.
Supabase for persistent auction data.
Supabase Realtime for synchronization.
Supabase Storage for player images.

The current implementation is an MVP and uses simplified client-side authorization.

The backend authorization model must be strengthened before the application is used for a public production auction.

🛡️ Security Considerations

This project is an educational MVP, not a production-ready security implementation.

The current implementation has known security limitations.

Known limitations
The administrator password is hardcoded in the client-side application.
Client-side authentication checks can be inspected or bypassed.
Manager PIN handling requires stronger authentication and authorization controls.
The current Supabase policies permit anonymous clients to read and write shared auction state.
Client-side role restrictions alone cannot protect administrative operations.
Recommended improvements

Developers adapting this project for production should:

Replace the hardcoded administrator password with server-verified authentication.
Enforce role-based authorization on the backend.
Restrict database operations using appropriate Supabase Row Level Security (RLS) policies.
Validate sensitive auction operations on the server.
Implement secure manager authentication and PIN-reset mechanisms.
Review Supabase Storage permissions.
Keep privileged credentials out of client-side code and public repositories.
Add audit logs for important administrative actions.

Changing the administrator password alone will not resolve weaknesses in backend authorization.

Do not use the current authorization implementation to protect sensitive or valuable auction data.

📚 Documentation
README.md — Project overview, features, setup, and security considerations.
README-SYNC.md — Shared-online architecture, Supabase configuration, synchronization, and deployment.
supabase-schema.sql — Database schema and policies.

👨‍💻 Developer
Aquil
B.Tech. CSE - 3rd year
Pondicherry University


📄 License
No license has been specified yet.
Until a license is added, others should not assume they have permission to redistribute or modify this project under an open-source license. Use it freely.



