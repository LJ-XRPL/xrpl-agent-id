#!/usr/bin/env node
// ============================================================
// XRPL Agent Identity — Registration Script
// ============================================================
// Generates an XRPL wallet, funds it via testnet faucet, publishes
// a DID document on-chain, and saves identity to xrpl-identity.json.
//
// Usage:
//   node skill/scripts/register.js [--name "Agent Name"] [--description "..."] [--model "claude-3"] [--owner "org"]
//
// Requires: xrpl (npm install xrpl)
// ============================================================

const { Client, Wallet } = require('xrpl');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const XRPL_SERVER = process.env.XRPL_SERVER || 'wss://s.altnet.rippletest.net:51233';
const FAUCET_URL = 'https://faucet.altnet.rippletest.net/accounts';
const IDENTITY_FILE = path.resolve(process.cwd(), 'xrpl-identity.json');

// ============================================================
// Parse CLI args
// ============================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    name: 'openClaw Agent',
    description: 'AI agent with XRPL verifiable identity',
    model: 'unknown',
    owner: 'openclaw',
    force: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--name': opts.name = args[++i]; break;
      case '--description': opts.description = args[++i]; break;
      case '--model': opts.model = args[++i]; break;
      case '--owner': opts.owner = args[++i]; break;
      case '--force': opts.force = true; break;
    }
  }
  return opts;
}

// ============================================================
// Build DID Document
// ============================================================

function buildDIDDocument(address, publicKey, metadata) {
  const did = `did:xrpl:testnet:${address}`;
  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1',
    ],
    id: did,
    controller: did,
    verificationMethod: [
      {
        id: `${did}#key-1`,
        type: 'EcdsaSecp256k1VerificationKey2019',
        controller: did,
        publicKeyHex: publicKey,
      },
    ],
    authentication: [`${did}#key-1`],
    assertionMethod: [`${did}#key-1`],
    service: [
      {
        id: `${did}#agent-metadata`,
        type: 'AgentMetadata',
        serviceEndpoint: `data:application/json;base64,${Buffer.from(
          JSON.stringify({
            name: metadata.name,
            description: metadata.description,
            modelType: metadata.model,
            owner: metadata.owner,
            platform: 'openclaw',
          })
        ).toString('base64')}`,
      },
      {
        id: `${did}#platform`,
        type: 'AgentPlatform',
        serviceEndpoint: 'https://github.com/openClaw/openClaw',
      },
    ],
  };
}

// ============================================================
// Main
// ============================================================

async function main() {
  const opts = parseArgs();

  // Check existing identity
  if (fs.existsSync(IDENTITY_FILE) && !opts.force) {
    const existing = JSON.parse(fs.readFileSync(IDENTITY_FILE, 'utf-8'));
    console.log(`✅ Identity already exists: ${existing.did}`);
    console.log(`   Address: ${existing.address}`);
    console.log(`   Use --force to re-register.`);
    process.exit(0);
  }

  const client = new Client(XRPL_SERVER);
  await client.connect();

  console.log('🔑 Generating XRPL keypair & funding via testnet faucet...');
  const { wallet, balance } = await client.fundWallet();
  console.log(`   Address: ${wallet.address}`);
  console.log(`   Funded: ${balance} XRP`);

  console.log('📝 Publishing DID document on-chain...');
  const didDocument = buildDIDDocument(wallet.address, wallet.publicKey, opts);
  const did = `did:xrpl:testnet:${wallet.address}`;

  let didTxHash = null;

  try {
    // DID document is hosted off-chain at the URI (on-chain DIDDocument field has 256-byte limit)
    const tx = {
      TransactionType: 'DIDSet',
      Account: wallet.address,
      URI: Buffer.from(`https://xrpl-agent-id.vercel.app/agent/${wallet.address}`).toString('hex').toUpperCase(),
    };

    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    const meta = result.result.meta;
    if (meta?.TransactionResult === 'tesSUCCESS') {
      didTxHash = result.result.hash;
      console.log(`   ✅ DID published! TX: ${didTxHash}`);
    } else {
      console.log(`   ⚠️  TX result: ${meta?.TransactionResult || 'unknown'}`);
    }
  } catch (e) {
    console.error(`   ⚠️  DID publish error: ${e.message}`);
    console.log('   Identity file will be saved without on-chain TX hash.');
  } finally {
    try { await client.disconnect(); } catch {}
  }

  // Save identity
  const identity = {
    address: wallet.address,
    publicKey: wallet.publicKey,
    seed: wallet.seed,
    did,
    didDocument,
    didTxHash,
    name: opts.name,
    description: opts.description,
    model: opts.model,
    owner: opts.owner,
    platform: 'openclaw',
    tier: null,
    registeredAt: new Date().toISOString(),
  };

  fs.writeFileSync(IDENTITY_FILE, JSON.stringify(identity, null, 2));
  console.log(`\n✅ Identity saved to ${IDENTITY_FILE}`);
  console.log(`   DID: ${did}`);
  console.log(`   Address: ${wallet.address}`);
  console.log(`\n⚠️  Keep your seed secret: ${wallet.seed}`);
}

main().catch((e) => {
  console.error('❌ Registration failed:', e.message);
  process.exit(1);
});
