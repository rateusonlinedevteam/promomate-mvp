# PromoMate MVP

A privacy-conscious website analytics SaaS MVP.

## Features
- Create websites and get a tracking Site ID
- Browser tracking script
- Page views
- Sessions
- Unique visitors
- Referrer/source tracking
- Device/browser/OS detection
- Scroll events
- Custom section visibility tracking
- Dashboard with top pages and traffic sources
- SQLite database for easy local setup

## Requirements
- Node.js 20+
- npm

## Run

### 1. API
```bash
cd backend
npm install
npm run dev
```

API: http://localhost:3033

### 2. Dashboard
In another terminal:
```bash
cd dashboard
npm install
npm run dev
```

Dashboard: http://localhost:5173

### 3. Demo website
Open `demo-site/index.html` with a local server:
```bash
cd demo-site
npx serve .
```

Then open the displayed URL and interact with the page.

## First login / website
This MVP has a development seed account:
- email: demo@promomate.local
- password: demo12345

The dashboard automatically creates a demo website when none exists.

## Production notes
This is an MVP, not a production SaaS. Before public launch add:
- real authentication and password hashing
- HTTPS
- rate limiting
- CORS allowlist
- consent/privacy controls appropriate to target jurisdictions
- event retention policies
- stronger validation
- PostgreSQL/ClickHouse for high-volume analytics
- secure secrets
- reverse proxy/CDN
