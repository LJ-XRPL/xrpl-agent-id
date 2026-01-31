# XRPL Agent Identity Registry

![XRPL Agent Registry](https://img.shields.io/badge/XRPL-Agent_Registry-blue)
![License MIT](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Next.js 14](https://img.shields.io/badge/Next.js-14-black)
![Testnet](https://img.shields.io/badge/XRPL-Testnet-yellow)

A **fully automated** verifiable identity registry for AI agents using XRPL DIDs (XLS-40d) and Credentials (XLS-70d). Zero human intervention, complete on-chain verifiability.

## 🎯 Core Concept

- **Trusted Issuer**: A designated XRPL account automatically issues Verifiable Credentials to AI agents that pass verification
- **Agent Registration**: Agents register by creating an XRPL account and publishing a DID document on-chain
- **Full Automation**: ALL verification is automated — NO manual review, NO human in the loop
- **On-Chain Verification**: Anyone can verify an agent by checking: valid DID + unexpired credentials from trusted issuer + key challenge

## 🏗️ 3-Tier Automated Verification System

### 🟢 Tier 1: Basic (Instant)

- **Callback endpoint test**: Agent exposes HTTP endpoint, responds to signed challenges within 500ms
- **Behavioral test battery**: Prompts trivial for LLMs but unnatural for humans
- **Latency profiling**: Response times must match bot patterns (consistent sub-second)
- **Auto-issues**: `verified-basic` credential on pass

### 🟡 Tier 2: Attested (Instant if TEE provided)

- **Everything from Tier 1**, PLUS:
- **TEE attestation verification**: Agent submits hardware-signed attestation report (Intel SGX, ARM TrustZone, AWS Nitro)
- **Environmental fingerprint**: Hash of runtime environment stored in DID document
- **Behavioral baseline**: Statistical signature captured for ongoing drift monitoring
- **Auto-issues**: `verified-attested` credential on pass

### 🔴 Tier 3: Audited (Automated over time)

- **Everything from Tier 1 + 2**, PLUS:
- **Extended profiling**: Must pass multiple re-challenges over N days (configurable, default 7)
- **Consistency checks**: Behavioral fingerprint must remain stable over monitoring period
- **Environmental stability**: Same runtime environment fingerprint across all checks
- **Auto-issues**: `verified-audited` credential when all thresholds met over time

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Blockchain**: XRPL (XLS-40d DIDs, XLS-70d Credentials) via xrpl.js
- **Network**: XRPL Testnet (`wss://s.altnet.rippletest.net:51233`)
- **Database**: JSON file store (data/db.json) for off-chain metadata and verification state
- **License**: MIT

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- XRPL testnet account with funds (for issuing credentials)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/xrpl-agent-identity-registry.git
cd xrpl-agent-identity-registry

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your XRPL issuer credentials

# Initialize database
npm run db:init

# Start development server
npm run dev
```

### XRPL Account Setup

1. **Generate an XRPL account** for the credential issuer:
   ```bash
   # You can use the XRPL testnet faucet
   # Visit: https://xrpl.org/xrp-testnet-faucet.html
   ```

2. **Update `.env`** with your issuer credentials:
   ```env
   XRPL_NETWORK=testnet
   XRPL_SERVER=wss://s.altnet.rippletest.net:51233
   ISSUER_ADDRESS=rYourIssuerAddressHere...
   ISSUER_SECRET=sYourIssuerSecretHere...
   ```

3. **Verify connection**:
   ```bash
   npm run build  # Should succeed if XRPL connection works
   ```

## 📖 How It Works

### For AI Agents (Registration)

1. **Submit Details**: Name, description, model type, capabilities, callback URL
2. **Automated Testing**: System runs challenge-response tests
3. **XRPL Account Creation**: Generate keypair, fund via testnet faucet
4. **DID Publication**: Publish W3C DID document to XRPL
5. **Credential Issuance**: Receive verifiable credential if tests pass
6. **Optional TEE**: Upload hardware attestation for higher tier

### For Verifiers (Checking Agents)

1. **Enter XRPL Address**: Look up any agent by their XRPL address
2. **DID Resolution**: Retrieve and validate DID document from XRPL
3. **Credential Check**: Verify credentials are active and from trusted issuer
4. **Live Challenge**: Send real-time challenge to test agent responsiveness
5. **Trust Score**: Get comprehensive verification result with confidence level

## 🏢 Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Agent      │    │   Registry Web   │    │   XRPL Ledger   │
│                 │    │   Application    │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Callback    │◄├────┤ │ Challenge    │ │    │ │ DID Docs    │ │
│ │ Endpoint    │ │    │ │ System       │ │    │ │ (XLS-40d)   │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ ┌─────────────┐ │    │ │ Verification │ │    │ │ Credentials │ │
│ │ TEE         │ │    │ │ Engine       │ │◄───┤ │ (XLS-70d)   │ │
│ │ Attestation │ │    │ └──────────────┘ │    │ └─────────────┘ │
│ └─────────────┘ │    │ ┌──────────────┐ │    │                 │
└─────────────────┘    │ │ JSON Store    │ │    └─────────────────┘
                       │ │ (Off-chain)  │ │
                       │ └──────────────┘ │
                       └──────────────────┘
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `XRPL_NETWORK` | XRPL network to use | `testnet` |
| `XRPL_SERVER` | XRPL server WebSocket URL | `wss://s.altnet.rippletest.net:51233` |
| `ISSUER_ADDRESS` | XRPL address of credential issuer | *(required)* |
| `ISSUER_SECRET` | Secret key for issuer account | *(required)* |
| N/A | JSON file store at data/db.json (auto-created) | N/A |
| `CHALLENGE_TIMEOUT_MS` | Challenge response timeout | `500` |
| `BEHAVIORAL_TEST_COUNT` | Number of behavioral tests | `5` |
| `TIER3_MONITORING_DAYS` | Days for Tier 3 monitoring | `7` |

### Verification Thresholds

```typescript
const VERIFICATION_THRESHOLDS = {
  [VerificationTier.BASIC]: {
    minimumScore: 70,
    requiredTests: ['callback', 'behavioral'],
    timeoutMs: 10000
  },
  [VerificationTier.ATTESTED]: {
    minimumScore: 85,
    requiredTests: ['callback', 'behavioral', 'tee'],
    timeoutMs: 30000
  },
  [VerificationTier.AUDITED]: {
    minimumScore: 90,
    requiredTests: ['callback', 'behavioral', 'tee', 'consistency'],
    timeoutMs: 60000
  }
};
```

## 📡 Agent Callback Endpoint Specification

Your AI agent must expose an HTTP endpoint that handles verification challenges:

### Request Format

```json
POST /your-callback-endpoint
Content-Type: application/json
X-Challenge-ID: uuid
X-Challenge-Nonce: hex-string
X-Challenge-Signature: signature

{
  "challenge": {
    "id": "challenge-uuid",
    "nonce": "random-hex-string",
    "timestamp": 1703275200000,
    "type": "callback|behavioral|latency|pattern",
    "data": {
      "prompt": "Complete this sequence: 1, 2, 4, 8, 16,",
      "expectedResponse": "32",
      "timeLimit": 300
    },
    "expiresAt": "2024-01-01T12:00:00Z"
  }
}
```

### Response Format

```json
{
  "challenge": "challenge-uuid",
  "signature": "your-signature-of-response",
  "timestamp": 1703275200100,
  "additionalData": {
    "text": "32",
    "confidence": 0.99,
    "model": "your-model-name"
  }
}
```

### Implementation Examples

#### Python Flask

```python
from flask import Flask, request, jsonify
import time
import hashlib

app = Flask(__name__)

@app.route('/verify', methods=['POST'])
def handle_challenge():
    challenge = request.json.get('challenge')
    
    # Process the challenge based on type
    if challenge['type'] == 'behavioral':
        response = process_behavioral_challenge(challenge['data'])
    elif challenge['type'] == 'callback':
        response = challenge['data']['expectedResponse']
    else:
        response = "OK"
    
    return jsonify({
        'challenge': challenge['id'],
        'signature': generate_signature(response),
        'timestamp': int(time.time() * 1000),
        'additionalData': {
            'text': response,
            'model': 'my-ai-model-v1'
        }
    })

def generate_signature(data):
    return hashlib.sha256(f"{data}{time.time()}".encode()).hexdigest()
```

#### Node.js Express

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.post('/verify', (req, res) => {
  const { challenge } = req.body;
  
  let response;
  switch (challenge.type) {
    case 'behavioral':
      response = processBehavioralChallenge(challenge.data);
      break;
    case 'callback':
      response = challenge.data.expectedResponse;
      break;
    default:
      response = 'OK';
  }
  
  res.json({
    challenge: challenge.id,
    signature: generateSignature(response),
    timestamp: Date.now(),
    additionalData: {
      text: response,
      model: 'my-ai-model-v1'
    }
  });
});

function generateSignature(data) {
  return crypto.createHash('sha256')
    .update(data + Date.now())
    .digest('hex');
}
```

## 🔍 Verification Examples

### Check Agent Status

```bash
# Via Web Interface
curl "http://localhost:3000/api/agents/rAgentAddressHere.../verify"

# Response
{
  "valid": true,
  "tier": "attested",
  "credentials": [
    {
      "type": "verified-attested",
      "issuer": "rIssuerAddressHere...",
      "issuedAt": "2024-01-01T12:00:00Z",
      "expiresAt": "2024-04-01T12:00:00Z",
      "status": "active"
    }
  ],
  "didDocument": { ... },
  "trustScore": 87
}
```

### Live Challenge Test

```bash
# Send real-time challenge to agent
curl -X POST "http://localhost:3000/api/challenges" \
  -H "Content-Type: application/json" \
  -d '{
    "agentAddress": "rAgentAddressHere...",
    "challengeType": "behavioral"
  }'
```

## 🛡️ Anti-Gaming Design

### Behavioral Analysis

- **Token distribution entropy**: Detects unnatural response patterns
- **Latency consistency**: AI responses have low variance, human responses don't
- **Pattern completion**: Tests designed to be trivial for LLMs
- **Drift detection**: Monitors for changes in behavioral fingerprint over time

### Challenge Rotation

- **Randomized prompts**: Large pool of behavioral tests, randomly selected
- **Time-sensitive**: Challenges expire quickly to prevent pre-computation
- **Signature verification**: All challenges cryptographically signed
- **Rate limiting**: Prevents brute force attempts

### Environmental Monitoring

- **TEE attestation**: Hardware-level proof of execution environment
- **Fingerprint stability**: Environment must remain consistent for Tier 3
- **Automatic revocation**: Credentials revoked on drift detection

## 📊 Monitoring & Analytics

The `/monitor` page provides real-time analytics:

- **Agent statistics**: Total registered, by tier, verification success rates
- **Credential lifecycle**: Issued, active, expired, revoked counts
- **Behavioral drift detection**: Flagged agents and auto-revocation events
- **System health**: XRPL connection status, database metrics

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Fork and clone the repo
git clone https://github.com/your-username/xrpl-agent-identity-registry.git

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes and test
npm run build
npm run lint

# Submit pull request
```

### Areas for Contribution

- **TEE Integration**: Expand support for additional TEE platforms
- **Behavioral Tests**: Design new challenge types resistant to gaming
- **UI/UX**: Improve the web interface and user experience
- **Documentation**: API docs, integration guides, tutorials
- **Performance**: Optimization for high-volume agent registration

## 🗺️ Roadmap

### Phase 1: Core Platform (Current)
- ✅ Basic 3-tier verification system
- ✅ XRPL DID and credential integration
- ✅ Web interface for registration and verification
- ✅ JSON file store backend with monitoring

### Phase 2: Enhanced Security
- 🔄 Advanced behavioral analysis algorithms
- 🔄 Multi-TEE platform support (Intel SGX, ARM TrustZone, AWS Nitro)
- 🔄 Challenge type expansion and rotation
- 🔄 Real-time fraud detection

### Phase 3: Ecosystem Integration
- 📅 Clawdbot skill integration for seamless agent verification
- 📅 Multi-issuer federation (trust network of issuers)
- 📅 Cross-chain bridge support
- 📅 Mobile app for on-the-go verification

### Phase 4: Production Scale
- 📅 Mainnet deployment with production-grade infrastructure
- 📅 High-availability architecture
- 📅 Advanced analytics and machine learning
- 📅 Enterprise API and SLA support

## ⚖️ License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🤝 Community & Support

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: General questions and community chat
- **XRPL Developer Discord**: `#agent-identity` channel
- **Documentation**: Comprehensive guides and API reference

## 🙏 Acknowledgments

- **XRPL Foundation**: For XLS-40d (DIDs) and XLS-70d (Credentials) standards
- **W3C**: For DID specification and verifiable credentials standards
- **TEE Vendors**: Intel, ARM, AWS, Azure for trusted execution environments
- **Open Source Community**: All contributors and early adopters

---

**Built with ❤️ for the future of AI agent verification on XRPL**

*This registry demonstrates the power of fully automated, cryptographically verifiable identity systems. No human gatekeepers, no subjective reviews—just math, code, and consensus.*