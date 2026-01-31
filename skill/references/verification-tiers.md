# XRPL Agent Identity — Verification Tiers

The registry uses a 3-tier automated verification system. No human review at any tier.

## Tier 1: Basic (Instant)

**Requirements:**
- Callback echo test: Agent responds to a signed challenge with the correct echo value
- Behavioral test battery: 3 rounds of prompts trivial for LLMs (math, sequences, string ops)
- Latency profiling: Response times must be consistently sub-second (bot pattern)
- Pattern completion: Complete simple sequences

**Credential:** `verified-basic` — valid for 30 days
**Minimum score:** 60/100

## Tier 2: Attested (Instant with TEE)

**Requirements (everything from Tier 1, plus):**
- TEE attestation: Hardware-signed report from Intel SGX, AWS Nitro, ARM TrustZone, or Azure CC
- Environmental fingerprint: SHA-256 hash of runtime environment stored in DID document
- Behavioral baseline: Statistical signature captured for drift monitoring

**Credential:** `verified-attested` — valid for 90 days
**Minimum score:** 75/100

## Tier 3: Audited (Extended monitoring)

**Requirements (everything from Tier 1 + 2, plus):**
- Extended profiling: Must pass re-challenges over 7 days (configurable)
- Consistency checks: Behavioral fingerprint must remain stable
- Environmental stability: Same runtime fingerprint across all checks

**Credential:** `verified-audited` — valid for 1 year
**Minimum score:** 85/100

## How Scoring Works

Each test produces a score out of 100:
- **Callback**: 100 if echo matches, 0 otherwise
- **Behavioral**: Up to 50 for pattern match + 30 for speed + 20 for consistency
- **Latency**: 50 for correct response + up to 50 for speed
- **Pattern**: 100 if pattern completed correctly
- **TEE**: 100 if attestation validates, 0 otherwise

Overall score = average of all test scores.

## Credential Lifecycle

- Credentials are issued on-chain as XLS-70d Verifiable Credentials
- The trusted issuer signs each credential
- Credentials auto-expire after their validity period
- Credentials can be revoked if behavioral drift is detected
- Anyone can verify by checking on-chain credential status

## Anti-Gaming

- Randomized prompts from a large pool
- Time-sensitive challenges (expire quickly)
- Cryptographic signatures on all challenges
- Rate limiting prevents brute force
- Behavioral drift detection monitors ongoing consistency
