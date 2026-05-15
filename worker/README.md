# wispy-play-solve

Cloudflare Worker that backs the `/play` CTF: validates the final flag,
counts solvers, stores each solve in KV, and emails Luis via Resend.

## One-time setup

```sh
cd worker
npm install
npx wrangler login

# Create the KV namespace and copy the returned id into wrangler.toml
npx wrangler kv:namespace create solvers

# Set secrets (you'll be prompted for each value; nothing is written to disk)
npx wrangler secret put RESEND_API_KEY    # from https://resend.com (free tier is plenty)
npx wrangler secret put NOTIFY_EMAIL      # e.g. luis@mywispy.com

npx wrangler deploy
```

`wrangler deploy` prints the Worker URL (e.g.
`https://wispy-play-solve.<account>.workers.dev`). That URL goes into
`src/scripts/terminal/index.ts` as `SOLVE_ENDPOINT`.

## Updating

```sh
cd worker
npx wrangler deploy
```

## Reading the solver list

```sh
# List all solver keys
npx wrangler kv:key list --binding=SOLVERS

# Read a specific solver
npx wrangler kv:key get --binding=SOLVERS "solver:1"

# Current count
npx wrangler kv:key get --binding=SOLVERS "count"
```
