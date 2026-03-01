# Loop

**Know your grade. Find your help.**

Real-time degree classification projection with peer skill matching for university students. Track your grades, simulate what-if scenarios, and connect with peers who can help you improve.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma (SQLite / Turso)
- Tailwind CSS v4
- Recharts
- Leaflet

## Getting Started

```bash
npm install
npx prisma db push
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

Copy `.env.example` if available, or create a `.env` file:

```
DATABASE_URL="file:./dev.db"
```

For production with Turso:

```
TURSO_DATABASE_URL="libsql://..."
TURSO_AUTH_TOKEN="..."
```

## License

MIT
