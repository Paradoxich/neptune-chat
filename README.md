# Neptune Chat

An animated hero section that plays a scripted AI-agent conversation — a user asks to deploy a project, and the "Neptune" agent responds with typing animations, status updates, command approvals, generated config files, and live deployment logs. The entire flow loops automatically, like a product demo video, but rendered in real React components.

Built with Next.js 16, React 19, and TypeScript.

## How it works

The animation is fully **script-driven**: the conversation is defined as a flat list of declarative events, and a timeline engine plays them back in order. Editing the demo means editing data, not animation code.

```
components/neptune-hero/
├── script.ts          # The conversation flow — the only file you edit to change the demo
├── constants.ts       # Message text, status labels, command & file snippets
├── animation.ts       # Timeline engine: compiles the script into timed state updates
├── types.ts           # Shared types (script events, chat items, snippets)
├── NeptuneHero.tsx    # Hero section wrapper (autoplay, loop, debug pause button)
├── ChatElements.tsx   # Renders the chat UI from animation state
└── ChatCodeBlocks.tsx # Command / file / CLI / log block components
```

Supported script events:

- **Messages** — user typing + message, instant user message, agent message with typing animation
- **Status** — temporary "Analysing project…" style shimmer labels that auto-dismiss
- **Command blocks** — a command with Run/Cancel choices, updatable to an approved state
- **File blocks** — a generated file (e.g. `neptune.json`) with Approve/Decline actions
- **CLI blocks** — command output such as JSON responses
- **Logs blocks** — multi-line deployment logs

Each event takes an optional `durationMs` to control pacing. Blocks are referenced by `id`, so a later `update*` event can animate a pending block into its approved state.

See **[SCRIPT_GUIDE.md](SCRIPT_GUIDE.md)** for a non-developer walkthrough of every event type with examples.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — the animation starts and loops automatically. A pause/play button in the top-right corner of the chat is available for debugging (toggled via the `display` style in `NeptuneHero.tsx`).

## Editing the demo

1. Open `components/neptune-hero/script.ts` and modify the `SCRIPT` array.
2. Keep text content in `components/neptune-hero/constants.ts` for easier maintenance.
3. Save — the dev server hot-reloads and replays the animation.

No changes to the animation engine or rendering components are needed to build a completely different conversation.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
