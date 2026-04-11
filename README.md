# StillHere (仍在)

*为它留下一处可以回来看看的纪念空间。*

Live: https://stillhere-tau.vercel.app
Beta: https://stillhere-tau.vercel.app/beta
Sample: https://stillhere-tau.vercel.app/sample/shixiaoyuan

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
- **Public Entry Points**: `/`, `/beta`, and `/sample/[slug]` provide lightweight entry routes for homepage, beta access, and sample memorial previews
- **Feedback and Owner Controls**: `/feedback`, `/feedback/inbox`, `/api/spirit/export`, and the memorial edit/delete dialogs support product iteration, backup, and removal flows
- **Exploration Lines**: memorial chat, blessing actions, and decor are kept as owner-only experiments

## Phase 1 Principles

- memorial first, not digital resurrection
- private first, not public listing
- clear owner control over sharing
- reuse existing code carefully, but do not let Phase 2 ideas override Phase 1 promises

## 项目全局上下文

### 6 子项目整体结构

StillHere 是一个 **6 子项目的整体项目**,当前只正式施工其中两条:

| # | 子项目 | 当前状态 |
|---|---|---|
| 01 | 死亡宠物数字纪念 | **Phase 1 主战场**,beta 已上线 |
| 02 | 宠物数字人生成 | 并行探索,2026-04-10 决策从"像它"迁移到"认出我",叙事采集协议 v1 已就绪 |
| 03 | 持续交互 | 后续解锁,预研输入索引已建立 |
| 04 | 信任与资产层 | **Phase 1 同步底座**,默认私密 / RLS / 分享开关已落地 |
| 05 | 世界观与内容系统 | 资产储备 |
| 06 | 增长与传播 | 资产储备 |

### 本代码仓的范围

本 `stillhere/` 代码仓只是**子项目一**(死亡宠物数字纪念)的前台工程载体。它承接第一阶段的:创建 / 沉淀 / 回访 / 分享 / 信任控制主链路。

子项目二的生成脚本、子项目三的交互原型、子项目四的合规文档,都在**主场上层目录**(`stillhere-project/`)下的对应子项目目录里,不在本代码仓范围内。

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
- `FEEDBACK_REVIEWER_EMAILS`
- `FEEDBACK_REVIEWER_PRIVY_IDS`

Apply the existing Prisma migrations before local development if your database is not initialized yet:

```bash
npx prisma migrate deploy
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
│   ├── beta/            # Lightweight beta entry
│   ├── create/          # Create a memorial space
│   ├── chat/[spiritId]/ # Owner-only exploration line
│   ├── dashboard/       # Owner memorial list
│   ├── feedback/        # Public feedback entry + internal inbox
│   ├── sample/[slug]/   # Public sample memorial route
│   ├── share/[id]/      # Explicitly enabled memorial page
│   ├── spirit/[id]/     # Owner memorial space
│   └── api/             # Auth, sharing, upload, feedback, export, status, exploration routes
├── components/          # UI components
│   ├── DeleteMemorialDialog.tsx # Delete + export guardrail dialog
│   └── EditMemorialDialog.tsx   # Owner memorial editing dialog
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
- The parent workspace also contains planning, narrative, trust, and generation materials outside this code repository.

## License

Private for now. The repository remains closed during the current alpha/beta stage.
