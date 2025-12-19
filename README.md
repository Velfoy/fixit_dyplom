## FixIt – Automotive Service Management

Role-based workshop management platform built with Next.js 16, Prisma, and NextAuth. It covers the full service lifecycle: intake, tasking, parts, invoicing, payments, and customer communication across multiple branches.

### Demo

Each thumbnail opens the role demo on YouTube.

- Warehouse
  [![Warehouse demo](https://img.youtube.com/vi/BeaRlvya7OA/0.jpg)](https://youtu.be/BeaRlvya7OA)

- Mechanic
  [![Mechanic demo](https://img.youtube.com/vi/xkfuUDAbLDA/0.jpg)](https://youtu.be/xkfuUDAbLDA)

- Client
  [![Client demo](https://img.youtube.com/vi/Brmvh5GDzDM/0.jpg)](https://youtu.be/Brmvh5GDzDM)

- Admin
  [![Admin demo](https://img.youtube.com/vi/7qiWTHk5Ht4/0.jpg)](https://youtu.be/7qiWTHk5Ht4)

### Highlights

- Role-aware dashboards and routing (ADMIN, MECHANIC, WAREHOUSE, RECEPTIONIST, CLIENT)
- Branch management with employees, vehicles, and customers tied to locations
- Service orders with tasks, comments, attachments, progress tracking, and status history
- Inventory and parts usage with warehouse deduction flags and minimum stock thresholds
- Invoicing and Stripe-backed payments, including status tracking and receipts
- Notifications, activity logs, and review capture for closed work

### Tech Stack

- Next.js App Router (TypeScript)
- Prisma ORM with PostgreSQL
- NextAuth for authentication/authorization
- Stripe for payments
- Radix UI, Tailwind CSS, and custom component library

### Project Layout

- app/(first_page) and app/(unpublic)/[role] – public entry, auth flows, and role-scoped dashboards
- app/api – REST-style API routes for auth, branches, cars, customers, dashboard data, mechanics, orders, settings, users, warehouse, and Stripe payment intents
- prisma/schema.prisma – relational model for users, branches, vehicles, service orders, tasks, parts, invoices, payments, and notifications
- src/lib – auth/session helpers, Prisma client, utilities, and route access checks
- src/components – layouts, UI primitives, tables, forms, and feature views
- public/uploads – user-generated assets (e.g., task comment attachments)

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Stripe account and API keys

### Environment

Create a `.env` file with at least:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-strong-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### Scripts

- `npm run dev` – start Next.js in development
- `npm run build` – production build
- `npm run start` – run the built app
- `npm run lint` – ESLint (Next.js rules)

### Deployment Notes

- Ensure `DATABASE_URL`, `NEXTAUTH_SECRET`, and Stripe secrets are set in the hosting environment.
- Run `prisma migrate deploy` on deploy to sync the database schema.

### Conventions

- Use role-based routes under `app/(unpublic)/[role]` to keep access isolated.
- Keep uploads within `public/uploads` and store metadata through the `document` model.
