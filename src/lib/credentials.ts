// ============================================================
// Credential Management
// ============================================================

import crypto from 'crypto';
import {
  Credential,
  CredentialType,
  VerificationTier,
  VerificationResult,
} from './types';
import * as db from './db';
import { getIssuerWallet, submitCredentialCreate, submitCredentialDelete } from './xrpl';

// Credential validity periods
export const CREDENTIAL_VALIDITY: Record<CredentialType, number> = {
  'verified-basic': 30 * 24 * 60 * 60 * 1000,     // 30 days
  'verified-attested': 90 * 24 * 60 * 60 * 1000,   // 90 days
  'verified-audited': 365 * 24 * 60 * 60 * 1000,   // 1 year
};

export const CREDENTIAL_LABELS: Record<CredentialType, string> = {
  'verified-basic': 'Basic Verified',
  'verified-attested': 'TEE Attested',
  'verified-audited': 'Fully Audited',
};

export function tierToCredentialType(tier: VerificationTier): CredentialType {
  switch (tier) {
    case VerificationTier.BASIC:
      return 'verified-basic';
    case VerificationTier.ATTESTED:
      return 'verified-attested';
    case VerificationTier.AUDITED:
      return 'verified-audited';
  }
}

// ============================================================
// Issue credential
// ============================================================

export async function issueCredential(
  agentId: string,
  agentAddress: string,
  tier: VerificationTier,
  verificationResults: VerificationResult[]
): Promise<Credential> {
  const credentialType = tierToCredentialType(tier);
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + CREDENTIAL_VALIDITY[credentialType]);

  const metadata = {
    tier,
    verificationResultCount: verificationResults.length,
    passedTests: verificationResults.filter((r) => r.passed).length,
    averageScore: Math.round(
      verificationResults.reduce((a, r) => a + r.score, 0) /
        (verificationResults.length || 1)
    ),
  };

  // Attempt on-chain issuance
  let txHash: string | null = null;
  try {
    const issuerWallet = getIssuerWallet();
    const result = await submitCredentialCreate(
      issuerWallet,
      agentAddress,
      credentialType,
      JSON.stringify(metadata)
    );
    if (result.success) {
      txHash = result.hash || null;
    }
  } catch (e) {
    console.warn('On-chain credential issuance failed (testnet):', e);
  }

  const credential: Credential = {
    id: crypto.randomUUID(),
    agentId,
    issuer: process.env.NEXT_PUBLIC_ISSUER_ADDRESS || 'rISSUER',
    type: credentialType,
    status: 'active',
    xrplTxHash: txHash,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    revokedAt: null,
    metadata: JSON.stringify(metadata),
  };

  db.createCredential(credential);
  db.logEvent(agentId, 'credential_issued', 'info', {
    credentialId: credential.id,
    type: credentialType,
    txHash,
  });

  return credential;
}

// ============================================================
// Revoke credential
// ============================================================

export async function revokeCredential(
  credentialId: string,
  reason: string
): Promise<boolean> {
  const credential = db.getCredential(credentialId);
  if (!credential || credential.status === 'revoked') return false;

  // Attempt on-chain revocation
  try {
    const issuerWallet = getIssuerWallet();
    const agent = db.getAgent(credential.agentId);
    if (agent) {
      await submitCredentialDelete(
        issuerWallet,
        agent.xrplAddress,
        credential.type
      );
    }
  } catch (e) {
    console.warn('On-chain revocation failed:', e);
  }

  db.updateCredentialStatus(credentialId, 'revoked');
  db.logEvent(credential.agentId, 'credential_revoked', 'warning', {
    credentialId,
    type: credential.type,
    reason,
  });

  return true;
}

// ============================================================
// Query helpers
// ============================================================

export function getHighestTier(agentId: string): VerificationTier | null {
  const creds = db.getActiveCredentialsByAgent(agentId);
  if (creds.length === 0) return null;

  const priority: Record<string, number> = {
    'verified-audited': 3,
    'verified-attested': 2,
    'verified-basic': 1,
  };

  const sorted = creds.sort(
    (a, b) => (priority[b.type] || 0) - (priority[a.type] || 0)
  );
  const typeToTier: Record<string, VerificationTier> = {
    'verified-audited': VerificationTier.AUDITED,
    'verified-attested': VerificationTier.ATTESTED,
    'verified-basic': VerificationTier.BASIC,
  };

  return typeToTier[sorted[0].type] || null;
}
