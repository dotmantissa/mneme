# MNEME

Persistent episodic memory layer for AI agents.

MNEME provides:
- Per-agent memory stores
- Semantic retrieval (vector search)
- Optional 0G storage blob anchoring
- Signature + on-chain attestation support
- Dashboard UI for agents, memory browsing, chain inspection, and search
- SDK for external agent/runtime integration

## What You Can Do

With MNEME, you can:
1. Create an agent identity
2. Write memories (`episodic`, `semantic`, `procedural`, `outcome`)
3. Retrieve memories by semantic similarity
4. Inspect parent-child causal chains
5. Attest memories cryptographically and verify on-chain state

## Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma + PostgreSQL (Neon)
- pgvector (`vector(1536)`)
- OpenAI embeddings (`text-embedding-3-small`)
- 0G RPC + Indexer integration
- Ethers v6

## Project Structure (Usage-Relevant)

- `app/dashboard` - UI (Agents, Memories, Search)
- `app/api/agents` - agent creation/list
- `app/api/memories` - memory write/list
- `app/api/memories/[id]/chain` - causal chain tree
- `app/api/search` - semantic search
- `app/api/memories/[id]/attest` - signature + contract attestation APIs
- `lib/sdk` - `MnemeClient` SDK for external apps/agents
- `lib/signing` - attestation logic + contract ABI helper
- `contracts` - `MnemeAttestation.sol` and Hardhat deployment scripts

## Environment Variables

Root app (`.env.local`):

- `DATABASE_URL`
- `DIRECT_URL`
- `OPENAI_API_KEY`
- `ZG_PRIVATE_KEY`
- `ZG_RPC_URL`
- `ZG_RPC_FALLBACK_URLS` (optional, comma-separated)
- `ZG_INDEXER_URL`
- `ATTESTATION_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_APP_URL`

Example fallback value:

```bash
ZG_RPC_FALLBACK_URLS=https://evmrpc-testnet.0g.ai,https://0g-galileo-testnet.drpc.org
```

## Local Run

```bash
npm install
npm run dev
```

Open:
- `http://localhost:3000/dashboard`

## Dashboard Usage

### 1) Agents
Route: `/dashboard`

- Create an agent name
- Copy/store the generated `apiKey` per agent
- `apiKey` is required for protected write/search/attest API calls

### 2) Memories
Route: `/dashboard/memories`

- Select an agent
- Browse most recent memories
- Click a memory to view:
  - summary/content
  - storage hash (if upload succeeded)
  - causal chain tree (ancestor + descendants)

### 3) Search
Route: `/dashboard/search`

- Select agent
- Enter free-text query
- Review scored semantic matches

## API Usage

## Response shape

Success:

```json
{ "success": true, "data": { } }
```

Error:

```json
{ "success": false, "error": "..." }
```

### Create Agent

```bash
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -d '{"name":"prod-agent"}'
```

### List Agents

```bash
curl http://localhost:3000/api/agents
```

### Create Memory (protected)

Requires `X-Agent-Key`.

```bash
curl -X POST http://localhost:3000/api/memories \
  -H "Content-Type: application/json" \
  -H "X-Agent-Key: <AGENT_API_KEY>" \
  -d '{
    "agentId":"<AGENT_ID>",
    "type":"episodic",
    "content":"Agent executed a swap.",
    "summary":"Executed swap"
  }'
```

### List Memories (UI path, unprotected)

```bash
curl "http://localhost:3000/api/memories?agentId=<AGENT_ID>&limit=20"
```

### Semantic Search (protected)

```bash
curl "http://localhost:3000/api/search?agentId=<AGENT_ID>&q=uniswap+swap&limit=5" \
  -H "X-Agent-Key: <AGENT_API_KEY>"
```

### Get Causal Chain

```bash
curl "http://localhost:3000/api/memories/<MEMORY_ID>/chain"
```

### Attest Memory (protected)

```bash
curl -X POST "http://localhost:3000/api/memories/<MEMORY_ID>/attest" \
  -H "X-Agent-Key: <AGENT_API_KEY>"
```

### Verify Memory (protected)

```bash
curl "http://localhost:3000/api/memories/<MEMORY_ID>/attest" \
  -H "X-Agent-Key: <AGENT_API_KEY>"
```

Expected verify fields:
- `valid` (signature check)
- `onChainVerified` (contract state check)
- `recoveredAddress`
- `expectedAddress`

### Health Check

```bash
curl http://localhost:3000/api/health
```

## MnemeClient SDK Usage

```ts
import { MnemeClient } from '@/lib/sdk';

const client = new MnemeClient({
  baseUrl: 'http://localhost:3000',
  agentId: '<AGENT_ID>',
  apiKey: '<AGENT_API_KEY>',
});

const memory = await client.remember({
  type: 'episodic',
  content: 'Agent bought ETH based on RSI crossover.',
  summary: 'Bought ETH from RSI signal',
});

const results = await client.recall('ETH RSI');
const chain = await client.getChain(memory.id);
const verification = await client.verify(memory.id);
```

## Attestation Contract

Contract source:
- `contracts/contracts/MnemeAttestation.sol`

Deploy script:
- `contracts/scripts/deploy.ts`

Deploy (from `contracts/`):

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network zgTestnet
```

Set deployed address in root `.env.local`:

```bash
ATTESTATION_CONTRACT_ADDRESS=0x...
```

## Vercel Deployment

`vercel.json` uses:

```json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "installCommand": "npm install"
}
```

Deploy:

```bash
npx vercel --prod
```

Ensure production env vars include everything from `.env.example`.

## Troubleshooting

### `401 Missing X-Agent-Key header`
- Add `X-Agent-Key` for protected routes:
  - `POST /api/memories`
  - `GET /api/search`
  - `POST/GET /api/memories/:id/attest`

### `onChainVerified: false` with `valid: true`
- Signature is fine; on-chain read/write failed.
- Check:
  - `ATTESTATION_CONTRACT_ADDRESS`
  - `ZG_PRIVATE_KEY` funded on target network
  - RPC endpoint reachability
  - `ZG_RPC_FALLBACK_URLS` includes healthy endpoints

### Memory write succeeds but `txHash` is null
- Attestation or contract call failed at runtime; memory still stored with signature-only fallback.

## Security Notes

- Never commit real secrets.
- Keep `ZG_PRIVATE_KEY` server-side only.
- Rotate compromised API keys by creating a new agent key identity and retiring old usage.

## Current Production

- Alias: `https://mneme-ten.vercel.app`

