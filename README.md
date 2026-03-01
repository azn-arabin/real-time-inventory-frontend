# Real-Time High-Traffic Inventory System — Frontend

React frontend for the **Limited Edition Sneaker Drop** platform. Shows live stock counts, handles reservations with a 60s countdown, and syncs everything in real-time across multiple browser tabs using WebSockets.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **State:** React Context (Auth, Theme)
- **Routing:** React Router v7
- **Real-time:** socket.io-client
- **Forms:** React Hook Form
- **Notifications:** Sonner (toast library)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js v18+
- Backend server running (see [backend repo](https://github.com/azn-arabin/real-time-inventory-backend))

### 1. Clone the repo

```bash
git clone git@github.com:azn-arabin/real-time-inventory-frontend.git
cd real-time-inventory-frontend
```

### 2. Install dependancies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Point these to wherever your backend is running.

### 4. Start the dev server

```bash
npm run dev
```

Opens on `http://localhost:5173` by default.

## Features

### Dashboard

- Shows all available sneaker drops in a responsive grid (3 columns on desktop)
- Each card shows the shoe image, name, price, live stock count and a reserve button
- Stock counts update **instantly** across all open tabs/browsers when anyone reserves or purchases
- Top 3 recent buyers shown on each card
- Pagination with 9 drops per page
- Skeleton loading animation while drops are loading

### Reservation Flow

1. Click "Reserve" on any drop → stock decreases by 1 across all clients
2. A 60-second countdown timer appears on the card
3. During those 60s you can click "Complete Purchase" to buy the item
4. If the timer expires, the reservation is automatically released and stock goes back up
5. You can have active reservations on multiple drops at the same time

### Auth

- Register / Login with JWT tokens
- Tokens stored in localStorage
- Role-based: regular users can reserve & buy, admins can also create new drops
- Guest users can see the dashboard but cant reserve anything

### Other Pages

- **My Purchases** — shows your purchase history with dates

## How It Works (Real-Time)

The app connects to the backend via a single shared Socket.io connection. The `useSocket` hook listens for these events:

- **`inventory_update`** — updates the stock count on a specific drop card without reloading the whole page
- **`purchase_update`** — shows a toast ("X just copped a pair!") and refetches that drop's purchaser list
- **`reservation_update`** — handles server-side expiry, clears the users reservation state and updates stock
- **`new_drop`** — prepends new drops to the list if user is on page 1, shows a toast notification

The key thing here is we **don't refetch the entire drops list** when something changes. Socket events update the specific drop in-place using React state updates, so there's no flickering or reordering of cards. The only time we do a full refetch is when the user manually clicks Refresh or changes pages.

## Project Structure

```
src/
├── App.tsx                         # Routes and providers
├── main.tsx                        # Entry point
├── index.css                       # Global styles (tailwind)
├── components/
│   ├── common/
│   │   ├── Buttons.tsx             # Reusable button variants
│   │   ├── PageComponents.tsx      # Page layout wrappers
│   │   └── ThemeToggle.tsx         # Dark/light mode toggle
│   ├── drops/
│   │   ├── CreateDropModal.tsx     # Admin modal to create drops
│   │   ├── DropCard.tsx            # Individual drop card
│   │   ├── DropCardSkeleton.tsx    # Loading skeleton for cards
│   │   └── ReservationCountdown.tsx # 60s countdown timer
│   ├── form/
│   │   ├── FormComponents.tsx      # Form field wrappers
│   │   └── PasswordsInput.tsx      # Password input with toggle
│   ├── layout/
│   │   ├── Header.tsx              # Navbar with user dropdown
│   │   └── Footer.tsx
│   ├── routes/
│   │   └── GuestRoute.tsx          # Redirects logged-in users away from auth pages
│   └── ui/                         # shadcn/ui generated components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── skeleton.tsx
│       └── ... (other shadcn components)
├── lib/
│   ├── utils.ts                    # cn() helper
│   ├── constants/
│   │   └── utils.constants.ts      # Socket event names (shared with backend)
│   ├── context/
│   │   ├── AuthContext.tsx          # JWT auth state + login/logout/register
│   │   └── ThemeContext.tsx         # Dark mode context
│   ├── hooks/
│   │   ├── useCountdown.ts         # Countdown timer hook for reservations
│   │   └── useSocket.ts            # Socket.io event listener hook
│   └── types/
│       └── index.ts                # TypeScript interfaces
├── pages/
│   ├── DashboardPage.tsx           # Main drops grid + socket handlers
│   ├── MyPurchasesPage.tsx         # Purchase history
│   └── auth/
│       ├── LoginPage.tsx
│       └── RegisterPage.tsx
└── services/
    └── api.ts                      # Axios instance + API functions
```

## Scripts

| Command           | What it does                     |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR   |
| `npm run build`   | Type check + production build    |
| `npm run lint`    | Run ESLint                       |
| `npm run preview` | Preview production build locally |

## UI Approach

I went with **Tailwind CSS + shadcn/ui** for the component library. shadcn gives you actual source files for each component (not a npm package dependency), so you have full control over the styling and can customize whatever you need. The UI is clean and functional — I focused more on the engineering side (real-time updates, concurrency, state managment) rather then making it pixel-perfect.

Key UI feedback points:

- Reserve/Purchase buttons show loading spinners while the request is in progress
- Toast notifications for errors, success messages, and when other users make purchases
- Stock counts update live without any page reloads or layout shifts
- Skeleton loaders instead of blank screens during initial data fetch
- Countdown timer clearly visible during active reservation
