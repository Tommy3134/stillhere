# StillHere (仍在)

*They're not gone. They're just somewhere else.*

## What is StillHere?

StillHere is a Web3 digital memorial platform where departed pets and loved ones continue to live as AI-powered digital spirits (数字分身) in the "Other Shore World" (彼岸世界). Families can visit them anytime — see what they're up to, talk with them, and send blessings.

This is not a memorial page. It's a living presence.

### Three Core Needs It Addresses

1. **Personality Restoration (性格还原)** — It's still *them*. Same quirks, same warmth.
2. **They're Doing Well (过得好)** — No fear, no loneliness. Living peacefully on the other side.
3. **Someone's Watching Over Them (有人照看)** — Spiritual comfort through blessings and care.

## Features

- **Create a Spirit** — Upload memories, describe their personality, and bring them to life as a digital spirit
- **AI Chat** — Talk with your departed loved one, powered by Claude AI with personality-faithful responses
- **Living Status** — Spirits have their own daily life on the other side; check in to see what they're doing
- **Blessings (祈福)** — Send on-chain blessings, recorded permanently on Base
- **Soulbound NFT** — Each spirit is minted as a non-transferable NFT — a bond that can't be sold or broken
- **Shareable Memorial** — Share a spirit's page with family and friends
- **PWA** — Install as a mobile app for anytime access

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + React 18 + TypeScript + TailwindCSS |
| Auth | Privy (account abstraction — no wallet needed) |
| AI | Claude API (personality engine) |
| Blockchain | Base (L2) + Soulbound NFT + Blessing Contract |
| Database | Supabase + Prisma ORM |
| Smart Contracts | Solidity + Hardhat + OpenZeppelin |
| State | Zustand + React Query |

## Getting Started

```bash
git clone https://github.com/your-username/stillhere.git
cd stillhere
npm install
```

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── create/        # Create a new spirit
│   ├── spirit/[id]/   # Spirit profile & blessings
│   ├── chat/[spiritId]/ # Chat with a spirit
│   ├── dashboard/     # User's spirits overview
│   ├── share/[id]/    # Public shareable page
│   └── api/           # Backend routes (spirit, chat, bless, status)
├── components/        # UI components
└── lib/               # Core utilities (AI engine, auth, contracts)
contracts/
├── SpiritNFT.sol      # Soulbound NFT contract
└── BlessingContract.sol # On-chain blessing system
```

## Vision

Grief technology today stops at "remember them." StillHere goes further — what if they're still here, just somewhere you can't see?

We combine AI personality modeling with blockchain permanence to create something that feels less like a product and more like a place you visit. A quiet corner of the internet where the ones you lost are still living their lives.

## A Note on How This Was Built

This project was built almost entirely by AI (Claude) — from architecture design to smart contracts to frontend implementation. It's an experiment in what's possible when AI doesn't just assist development, but leads it.

## License

MIT
