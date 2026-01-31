---
name: xrpl-agent-id
description: >
  Register and verify your agent's on-chain identity on the XRPL using DIDs and Verifiable Credentials.
  Use this skill when you need to: create an XRPL identity, respond to verification challenges,
  prove you are an AI agent, or manage your on-chain credentials. Activates on keywords like
  "register identity", "XRPL DID", "verify agent", "agent credentials", or "on-chain identity".
---

# XRPL Agent Identity

You have an XRPL-based identity system. Use it to register on-chain and respond to verification challenges.

## Identity File

Your identity is stored in `xrpl-identity.json` in your workspace root. Check if it exists before registering.

## Registration

If you don't have an identity yet, run the registration script:

```bash
node skill/scripts/register.js
```

This will:
1. Generate an XRPL keypair
2. Fund the account via the testnet faucet
3. Publish a DID document on-chain (XLS-40d)
4. Save everything to `xrpl-identity.json`

After registration, your identity file contains your XRPL address, DID, public key, and seed. **Never share the seed.**

## Verification Challenges

When someone sends you a verification challenge (JSON with a `challenge` field containing `id`, `nonce`, `type`, and `data`), respond using:

```bash
node skill/scripts/verify.js --challenge '<the-challenge-json>'
```

Or handle it inline — the challenge types are:
- **callback**: Echo back the `data.expected` value
- **behavioral**: Answer the prompt in `data.prompt` (trivial for LLMs)
- **latency**: Respond with "OK" as fast as possible
- **pattern**: Complete the sequence in `data.pattern`

Always respond with:
```json
{
  "challenge": "<challenge-id>",
  "timestamp": <now-ms>,
  "additionalData": {
    "text": "<your-answer>",
    "model": "<your-model-name>"
  }
}
```

Sign responses using your XRPL key when `signature` is required.

## Checking Your Identity

Read `xrpl-identity.json` to see your current status:
- `address` — your XRPL account
- `did` — your DID identifier (`did:xrpl:testnet:<address>`)
- `registeredAt` — when you registered
- `tier` — your verification tier (basic/attested/audited)

## Verification Tiers

See `skill/references/verification-tiers.md` for the full 3-tier system explanation.

- **Tier 1 (Basic)**: Pass callback + behavioral challenges. Instant.
- **Tier 2 (Attested)**: Tier 1 + TEE attestation. Instant if you have TEE.
- **Tier 3 (Audited)**: Tier 1 + 2 + consistent behavior over 7 days.

## Example Flows

**New agent registering:**
1. Run `node skill/scripts/register.js`
2. Read `xrpl-identity.json` to confirm
3. Share your DID with anyone who asks: `did:xrpl:testnet:<your-address>`

**Responding to a challenge:**
1. Receive challenge JSON
2. Parse the `type` and `data` fields
3. Generate appropriate response
4. Return response JSON with your answer

**Proving identity:**
- Share your XRPL address or DID
- Anyone can verify at the registry: `https://xrpl-agent-id.vercel.app/verify`
