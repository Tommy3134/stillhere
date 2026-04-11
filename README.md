# StillHere (仍在)

*为它留下一处可以回来看看的纪念空间。*

## What is StillHere?

StillHere is currently a memorial-first product for departed pets.
The Phase 1 goal is deliberately narrow:

- create a private memorial space
- preserve photos, stories, habits, and important dates
- give families a calm place to revisit
- let owners decide if and when to share with family

The project still contains exploratory chat, blessing, decor, and Web3 work, but those are not the current main promise.

## Current Product Scope

- **Create a Memorial Space**: start with a name, photos, habits, story, and key dates
- **Private by Default**: owners must log in; memorial spaces are not public unless sharing is explicitly enabled
- **Return Visits**: recent memorial records and photos stay in one place
- **Controlled Sharing**: owners can open or close a memorial page for family and friends
- **Exploration Lines**: memorial chat, blessing actions, and decor are kept as owner-only experiments

## Phase 1 Principles

- memorial first, not digital resurrection
- private first, not public listing
- clear owner control over sharing
- reuse existing code carefully, but do not let Phase 2 ideas override Phase 1 promises

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + React 18 + TypeScript + TailwindCSS |
| Auth | Privy (account abstraction — no wallet needed) |
| AI | Claude API |
| Blockchain | Base contracts kept as research line |
| Database | Supabase + Prisma ORM |
| Smart Contracts | Solidity + Hardhat + OpenZeppelin |
| State | Zustand + React Query |

## Getting Started

```bash
git clone https://github.com/your-username/stillhere.git
cd stillhere
npm install
```

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Minimum app runtime variables:

- `NEXT_PUBLIC_PRIVY_APP_ID`
- `PRIVY_APP_SECRET`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional but recommended:

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_BASE_URL`
- `CRON_SECRET`

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── create/          # Create a memorial space
│   ├── spirit/[id]/     # Owner memorial space
│   ├── chat/[spiritId]/ # Owner-only exploration line
│   ├── dashboard/       # Owner memorial list
│   ├── share/[id]/      # Explicitly enabled memorial page
│   └── api/             # Auth, sharing, upload, status, exploration routes
├── components/          # UI components
└── lib/                 # Auth, storage, AI, contract helpers
contracts/
├── SpiritNFT.sol        # Research line contract
└── BlessingContract.sol # Research line contract
```

## Scheduled Status Generation

`/api/status/generate` is intended for a daily cron run.
Set `CRON_SECRET` in your environment so scheduled calls are authenticated.

## Notes

- The repo still contains research code for chat, blessings, decor, and Web3 minting.
- Those lines are intentionally secondary to the current memorial-space roadmap.

## License

MIT
