# MARS — Fines & Fees Management

A React single-page demo for reviewing customer fines and fees. The interface uses JavaScript (`.js`) and JSX (`.jsx`) with Vite and Tailwind CSS v4. It does not require Figma Make or any Figma plugin.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. For a production build and local preview:

```bash
npm run build
npm run preview
```

## Demo sign-in accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@mars.demo` | `Admin123!` |
| Super User | `reviewer@mars.demo` | `Review123!` |
| Viewer | `viewer@mars.demo` | `Viewer123!` |

## Important demo limitations

- The app uses synthetic in-memory data. Fine records, registration requests, approvals, and review history are not persisted to a server and reset when the page/runtime is restarted.
- Authentication is for demonstration only. Passwords are held in client-side memory; there is no server-side authentication, password hashing, or durable account store. Do not use real credentials or production data.
- Excel export is generated in the browser.

## Project structure

- `src/App.jsx` — application state and top-level workflows
- `src/pages/` — dashboard, fines details, login, and registration pages
- `src/components/` — layout, chart, UI, and review/export components
- `src/services/` — demo authentication, fine records, and permissions
- `src/utils/fines.js` — filtering, formatting, and aggregation helpers
- `vite.config.js` — standard Vite configuration with React and Tailwind CSS plugins
