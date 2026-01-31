// ============================================================
// XRPL Agent Identity Registry — Shared Types
// ============================================================

// Verification tier levels
export enum VerificationTier {
  BASIC = 'basic',
  ATTESTED = 'attested',
  AUDITED = 'audited',
}

// Agent status
export type AgentStatus = 'pending' | 'verified' | 'suspended' | 'revoked';

// Credential types issued on-chain
export type CredentialType = 'verified-basic' | 'verified-attested' | 'verified-audited';

// Credential status
export type CredentialStatus = 'active' | 'expired' | 'revoked';

// Challenge types for verification
export type ChallengeType = 'callback' | 'behavioral' | 'latency' | 'pattern';

// TEE attestation types
export type TEEType = 'intel-sgx' | 'aws-nitro' | 'arm-trustzone' | 'azure-cc';

// ============================================================
// Core entities
// ============================================================

export interface Agent {
  id: string;
  name: string;
  description: string;
  modelType: string;
  capabilities: string[];
  owner: string;
  callbackUrl: string;
  xrplAddress: string;
  publicKey: string;
  did: string;
  status: AgentStatus;
  tier: VerificationTier | null;
  didTxHash: string | null;
  environmentalFingerprint: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Credential {
  id: string;
  agentId: string;
  issuer: string;
  type: CredentialType;
  status: CredentialStatus;
  xrplTxHash: string | null;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  metadata: string; // JSON string
}

export interface Challenge {
  id: string;
  agentAddress: string;
  challengeType: ChallengeType;
  nonce: string;
  data: string; // JSON string
  signature: string;
  timestamp: number;
  expiresAt: number;
  status: 'pending' | 'completed' | 'expired';
  responseData: string | null;
  responseTimeMs: number | null;
}

export interface VerificationResult {
  type: ChallengeType | 'tee' | 'consistency';
  passed: boolean;
  score: number;
  details: Record<string, unknown>;
  timestamp: string;
  responseTimeMs?: number;
}

export interface VerificationSession {
  id: string;
  agentId: string;
  tier: VerificationTier;
  status: 'running' | 'completed' | 'failed';
  results: VerificationResult[];
  overallScore: number;
  passed: boolean;
  startedAt: string;
  completedAt: string | null;
}

export interface MonitoringEvent {
  id: string;
  agentId: string;
  eventType: string;
  severity: 'info' | 'warning' | 'critical';
  data: string; // JSON string
  createdAt: string;
}

export interface TEEAttestation {
  type: TEEType;
  attestationReport: string;
  nonce: string;
  timestamp: string;
  verificationDetails?: Record<string, unknown>;
}

export interface BehavioralFingerprint {
  meanResponseMs: number;
  stdDevMs: number;
  consistencyScore: number;
  patternAccuracy: number;
  sampleCount: number;
  establishedAt: string;
}

// ============================================================
// DID Document (W3C format)
// ============================================================

export interface DIDDocument {
  '@context': string[];
  id: string;
  controller: string;
  verificationMethod: {
    id: string;
    type: string;
    controller: string;
    publicKeyHex: string;
  }[];
  authentication: string[];
  assertionMethod: string[];
  service: {
    id: string;
    type: string;
    serviceEndpoint: string;
  }[];
}

// ============================================================
// API request/response types
// ============================================================

export interface RegisterRequest {
  name: string;
  description: string;
  modelType: string;
  capabilities: string[];
  owner: string;
  callbackUrl: string;
}

export interface RegisterResponse {
  agent: Agent;
  wallet: {
    address: string;
    publicKey: string;
    seed: string;
  };
  didTxHash: string | null;
  fundingSuccess: boolean;
}

export interface VerifyRequest {
  address: string;
}

export interface VerifyResponse {
  agent: Agent | null;
  did: DIDDocument | null;
  credentials: Credential[];
  tier: VerificationTier | null;
  onChainDID: { didDocument: string | null; uri: string | null } | null;
}

export interface ChallengeRequest {
  action: 'generate' | 'verify';
  address?: string;
  challengeId?: string;
  signature?: string;
  publicKey?: string;
  responseData?: Record<string, unknown>;
}

export interface VerificationRequest {
  agentId: string;
  tier: VerificationTier;
  teeAttestation?: TEEAttestation;
}

// Stats for the monitor page
export interface SystemStats {
  totalAgents: number;
  verifiedAgents: number;
  pendingAgents: number;
  suspendedAgents: number;
  tierDistribution: Record<string, number>;
  totalCredentials: number;
  activeCredentials: number;
  recentEvents: MonitoringEvent[];
}
