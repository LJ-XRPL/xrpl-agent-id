// ============================================================
// Database layer — JSON file store (no native dependencies)
// ============================================================
// Uses a JSON file for storage to avoid native module issues
// with Next.js webpack bundling. For production, swap to SQLite/Postgres.

import fs from 'fs';
import path from 'path';
import {
  Agent,
  Credential,
  Challenge,
  VerificationSession,
  MonitoringEvent,
  VerificationTier,
  AgentStatus,
} from './types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

interface Database {
  agents: Agent[];
  credentials: Credential[];
  challenges: Challenge[];
  sessions: VerificationSession[];
  events: MonitoringEvent[];
  behavioralBaselines: Record<string, string>; // agentId -> JSON fingerprint
}

function emptyDB(): Database {
  return {
    agents: [],
    credentials: [],
    challenges: [],
    sessions: [],
    events: [],
    behavioralBaselines: {},
  };
}

function readDB(): Database {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
      const db = emptyDB();
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
      return db;
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return emptyDB();
  }
}

function writeDB(db: Database): void {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// ============================================================
// Agents
// ============================================================

export function getAllAgents(): Agent[] {
  return readDB().agents;
}

export function getAgent(idOrAddress: string): Agent | undefined {
  const db = readDB();
  return db.agents.find(
    (a) => a.id === idOrAddress || a.xrplAddress === idOrAddress
  );
}

export function createAgent(agent: Agent): Agent {
  const db = readDB();
  const existing = db.agents.findIndex((a) => a.id === agent.id);
  if (existing >= 0) {
    db.agents[existing] = agent;
  } else {
    db.agents.push(agent);
  }
  writeDB(db);
  return agent;
}

export function updateAgent(
  id: string,
  updates: Partial<Agent>
): Agent | undefined {
  const db = readDB();
  const idx = db.agents.findIndex((a) => a.id === id);
  if (idx < 0) return undefined;
  db.agents[idx] = { ...db.agents[idx], ...updates, updatedAt: new Date().toISOString() };
  writeDB(db);
  return db.agents[idx];
}

export function getAgentsByStatus(status: AgentStatus): Agent[] {
  return readDB().agents.filter((a) => a.status === status);
}

export function getAgentsByTier(tier: VerificationTier): Agent[] {
  return readDB().agents.filter((a) => a.tier === tier);
}

// ============================================================
// Credentials
// ============================================================

export function getAllCredentials(): Credential[] {
  return readDB().credentials;
}

export function getCredential(id: string): Credential | undefined {
  return readDB().credentials.find((c) => c.id === id);
}

export function getCredentialsByAgent(agentId: string): Credential[] {
  return readDB().credentials.filter((c) => c.agentId === agentId);
}

export function getActiveCredentialsByAgent(agentId: string): Credential[] {
  const now = new Date().toISOString();
  return readDB().credentials.filter(
    (c) => c.agentId === agentId && c.status === 'active' && c.expiresAt > now
  );
}

export function createCredential(credential: Credential): Credential {
  const db = readDB();
  db.credentials.push(credential);
  writeDB(db);
  return credential;
}

export function updateCredentialStatus(
  id: string,
  status: Credential['status']
): boolean {
  const db = readDB();
  const idx = db.credentials.findIndex((c) => c.id === id);
  if (idx < 0) return false;
  db.credentials[idx].status = status;
  if (status === 'revoked') {
    db.credentials[idx].revokedAt = new Date().toISOString();
  }
  writeDB(db);
  return true;
}

// ============================================================
// Challenges
// ============================================================

export function createChallenge(challenge: Challenge): Challenge {
  const db = readDB();
  db.challenges.push(challenge);
  writeDB(db);
  return challenge;
}

export function getChallenge(id: string): Challenge | undefined {
  return readDB().challenges.find((c) => c.id === id);
}

export function updateChallenge(
  id: string,
  updates: Partial<Challenge>
): boolean {
  const db = readDB();
  const idx = db.challenges.findIndex((c) => c.id === id);
  if (idx < 0) return false;
  db.challenges[idx] = { ...db.challenges[idx], ...updates };
  writeDB(db);
  return true;
}

// ============================================================
// Verification Sessions
// ============================================================

export function createSession(session: VerificationSession): VerificationSession {
  const db = readDB();
  db.sessions.push(session);
  writeDB(db);
  return session;
}

export function getSessionsByAgent(agentId: string): VerificationSession[] {
  return readDB().sessions.filter((s) => s.agentId === agentId);
}

export function updateSession(
  id: string,
  updates: Partial<VerificationSession>
): boolean {
  const db = readDB();
  const idx = db.sessions.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  db.sessions[idx] = { ...db.sessions[idx], ...updates };
  writeDB(db);
  return true;
}

// ============================================================
// Monitoring Events
// ============================================================

export function logEvent(
  agentId: string,
  eventType: string,
  severity: MonitoringEvent['severity'],
  data: Record<string, unknown>
): MonitoringEvent {
  const db = readDB();
  const event: MonitoringEvent = {
    id: crypto.randomUUID(),
    agentId,
    eventType,
    severity,
    data: JSON.stringify(data),
    createdAt: new Date().toISOString(),
  };
  db.events.push(event);
  // Keep only last 1000 events
  if (db.events.length > 1000) {
    db.events = db.events.slice(-1000);
  }
  writeDB(db);
  return event;
}

export function getRecentEvents(limit = 50): MonitoringEvent[] {
  const db = readDB();
  return db.events.slice(-limit).reverse();
}

export function getEventsByAgent(agentId: string): MonitoringEvent[] {
  return readDB().events.filter((e) => e.agentId === agentId);
}

// ============================================================
// Behavioral Baselines
// ============================================================

export function saveBehavioralBaseline(agentId: string, fingerprint: string): void {
  const db = readDB();
  db.behavioralBaselines[agentId] = fingerprint;
  writeDB(db);
}

export function getBehavioralBaseline(agentId: string): string | null {
  return readDB().behavioralBaselines[agentId] || null;
}

// ============================================================
// Stats
// ============================================================

export function getStats() {
  const db = readDB();
  const now = new Date().toISOString();
  return {
    totalAgents: db.agents.length,
    verifiedAgents: db.agents.filter((a) => a.status === 'verified').length,
    pendingAgents: db.agents.filter((a) => a.status === 'pending').length,
    suspendedAgents: db.agents.filter((a) => a.status === 'suspended').length,
    tierDistribution: {
      basic: db.agents.filter((a) => a.tier === VerificationTier.BASIC).length,
      attested: db.agents.filter((a) => a.tier === VerificationTier.ATTESTED).length,
      audited: db.agents.filter((a) => a.tier === VerificationTier.AUDITED).length,
    },
    totalCredentials: db.credentials.length,
    activeCredentials: db.credentials.filter(
      (c) => c.status === 'active' && c.expiresAt > now
    ).length,
    recentEvents: db.events.slice(-20).reverse(),
  };
}
