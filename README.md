# XRPL Agent Identity Registry

![XRPL Agent Registry](https://img.shields.io/badge/XRPL-Agent_Registry-blue)
![License MIT](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Next.js 14](https://img.shields.io/badge/Next.js-14-black)
![Testnet](https://img.shields.io/badge/XRPL-Testnet-yellow)

A **fully automated** verifiable identity registry for AI agents using XRPL DIDs (XLS-40d) and Credentials (XLS-70d). Zero human intervention, complete on-chain verifiability.

## 🚀 Quick Start with Clawdbot

The fastest way to give your AI agent a verifiable on-chain identity is via the **Clawdbot skill**.

### 1. Install the skill

```bash
# Clone this repo
git clone https://github.com/LJ-XRPL/xrpl-agent-id.git

# Copy the skill into your Clawdbot agent workspace
cp -r xrpl-agent-id/skill/ your-agent/

# Install the XRPL dependency
cd your-agent && npm install xrpl
```

### 2. Register your agent

```bash
node skill/scripts/register.js --name "My Agent" --model "gpt-4" --owner "my-org"
```

This will:
- Generate an XRPL keypair
- Fund the account via the testnet faucet
- Publish a W3C DID document on-chain (XLS-40d)
- Save identity to `xrpl-identity.json`

### 3. Verify your identity

```bash
node skill/scripts/verify.js --submit https://xrpl-agent-id.vercel.app
```

The script requests a challenge from the registry and responds automatically. Your agent is now verified with a Tier 1 credential.

### Skill Structure

```
skill/
├── SKILL.md                  # Agent instructions (auto-loaded by Clawdbot)
├── scripts/
│   ├── register.js           # XRPL registration (wallet, faucet, DID)
│   └── verify.js             # Challenge-response handler
└── references/
    └── verification-tiers.md # 3-tier system explanation
```

---

## 🎯 Core Concept

- **Trusted Issuer**: A designated XRPL account automatically issues Verifiable Credentials to AI agents that pass verification
- **Agent Registration**: Agents register by creating an XRPL account and publishing a DID document on-chain
- **Full Automation**: ALL verification is automated — NO manual review, NO human in the loop
- **On-Chain Verification**: Anyone can verify an agent by checking: valid DID + unexpired credentials from trusted issuer + key challenge

## 🏗️ 3-Tier Automated Verification System

### 🟢 Tier 1: Basic (Instant)

- **Callback/challenge test**: Agent responds to signed challenges
- **Behavioral test battery**: Prompts trivial for LLMs but unnatural for humans
- **Latency profiling**: Response times must match bot patterns (consistent sub-second)
- **Auto-issues**: `verified-basic` credential on pass

### 🟡 Tier 2: Attested (Instant if TEE provided)

- **Everything from Tier 1**, PLUS:
- **TEE attestation verification**: Hardware-signed attestation report (Intel SGX, ARM TrustZone, AWS Nitro)
- **Environmental fingerprint**: Hash of runtime environment stored in DID document
- **Auto-issues**: `verified-attested` credential on pass

### 🔴 Tier 3: Audited (Automated over time)

- **Everything from Tier 1 + 2**, PLUS:
- **Extended profiling**: Must pass multiple re-challenges over 7 days
- **Consistency checks**: Behavioral fingerprint must remain stable
- **Auto-issues**: `verified-audited` credential when all thresholds met

## 🛠️ Manual Registration (Advanced)

If you're not using Clawdbot, you can register manually via the web interface or API.

### Prerequisites

- Node.js 18+
- npm or yarn
- XRPL testnet account with funds (for issuing credentials)

### Installation

```bash
git clone https://github.com/LJ-XRPL/xrpl-agent-id.git
cd xrpl-agent-id

npm install

cp .env.example .env
# Edit .env with your XRPL issuer credentials

npm run db:init
npm run dev
```

### XRPL Account Setup

1. **Generate an XRPL account** for the credential issuer via the [testnet faucet](https://xrpl.org/xrp-testnet-faucet.html)

2. **Update `.env`** with your issuer credentials:
   ```env
   XRPL_NETWORK=testnet
   XRPL_SERVER=wss://s.altnet.rippletest.net:51233
   ISSUER_ADDRESS=rYourIssuerAddressHere...
   ISSUER_SECRET=sYourIssuerSecretHere...
   ```

3. **Build and run**:
   ```bash
   npm run build
   npm run start
   ```

### Agent Callback Endpoint

For manual registration, your agent must expose an HTTP endpoint that handles verification challenges. See the web interface at `/register` for full details.

## 📖 How It Works

### For AI Agents (Registration)

1. **Submit Details**: Name, description, model type, capabilities, callback URL
2. **Automated Testing**: System runs challenge-response tests
3. **XRPL Account Creation**: Generate keypair, fund via testnet faucet
4. **DID Publication**: Publish W3C DID document to XRPL
5. **Credential Issuance**: Receive verifiable credential if tests pass

### For Verifiers (Checking Agents)

1. **Enter XRPL Address**: Look up any agent by their XRPL address
2. **DID Resolution**: Retrieve and validate DID document from XRPL
3. **Credential Check**: Verify credentials are active and from trusted issuer
4. **Live Challenge**: Send real-time challenge to test agent responsiveness
5. **Trust Score**: Get comprehensive verification result with confidence level

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `XRPL_NETWORK` | XRPL network to use | `testnet` |
| `XRPL_SERVER` | XRPL server WebSocket URL | `wss://s.altnet.rippletest.net:51233` |
| `ISSUER_ADDRESS` | XRPL address of credential issuer | *(required)* |
| `ISSUER_SECRET` | Secret key for issuer account | *(required)* |
| `CHALLENGE_TIMEOUT_MS` | Challenge response timeout | `500` |
| `BEHAVIORAL_TEST_COUNT` | Number of behavioral tests | `5` |
| `TIER3_MONITORING_DAYS` | Days for Tier 3 monitoring | `7` |

## 🏢 Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Agent      │    │   Registry Web   │    │   XRPL Ledger   │
│   (Clawdbot     │    │   Application    │    │                 │
│    or custom)   │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ ┌─────────────┐ │    │ │ Challenge    │ │    │ │ DID Docs    │ │
│ │ Skill /     │◄├────┤ │ System       │ │    │ │ (XLS-40d)   │ │
│ │ Callback    │ │    │ └──────────────┘ │    │ └─────────────┘ │
│ └─────────────┘ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│                 │    │ │ Verification │ │    │ │ Credentials │ │
│                 │    │ │ Engine       │ │◄───┤ │ (XLS-70d)   │ │
│                 │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │ ┌──────────────┐ │    │                 │
│                 │    │ │ JSON Store   │ │    └─────────────────┘
│                 │    │ └──────────────┘ │
└─────────────────┘    └──────────────────┘
```

## ⚖️ License

MIT — see [LICENSE](LICENSE).

## 🙏 Acknowledgments

- **XRPL Foundation**: For XLS-40d (DIDs) and XLS-70d (Credentials) standards
- **Clawdbot**: For the agent skill framework
- **W3C**: For DID and verifiable credentials specifications
