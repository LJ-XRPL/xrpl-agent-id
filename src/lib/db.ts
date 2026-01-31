// ============================================================
// Database layer — Vercel KV (Redis) store
// ============================================================
// Uses Vercel KV (Redis) for production-ready storage
// with proper async operations and scalability.

import { kv } from '@vercel/kv';
import {
  Agent,
  Credential,
  Challenge,
  VerificationSession,
  MonitoringEvent,
  VerificationTier,
  AgentStatus,
} from './types';

// ============================================================
// Agents
// ============================================================

export async function getAllAgents(): Promise<Agent[]> {
  const agentIds = await kv.smembers('agents:all');
  const agents: Agent[] = [];
  
  for (const id of agentIds) {
    const agentData = await kv.get(`agent:${id}`);
    if (agentData) {
      agents.push(typeof agentData === 'string' ? JSON.parse(agentData) : agentData);
    }
  }
  
  return agents;
}

export async function getAgent(idOrAddress: string): Promise<Agent | undefined> {
  // Try by ID first
  let agentData = await kv.get(`agent:${idOrAddress}`);
  
  // If not found, try by address mapping
  if (!agentData) {
    const mappedId = await kv.get(`agent:addr:${idOrAddress}`);
    if (mappedId) {
      agentData = await kv.get(`agent:${mappedId}`);
    }
  }
  
  if (!agentData) return undefined;
  
  return typeof agentData === 'string' ? JSON.parse(agentData) : agentData;
}

export async function createAgent(agent: Agent): Promise<Agent> {
  // Store agent data
  await kv.set(`agent:${agent.id}`, JSON.stringify(agent));
  
  // Store address mapping
  await kv.set(`agent:addr:${agent.xrplAddress}`, agent.id);
  
  // Add to agents set
  await kv.sadd('agents:all', agent.id);
  
  return agent;
}

export async function updateAgent(
  id: string,
  updates: Partial<Agent>
): Promise<Agent | undefined> {
  const existing = await kv.get(`agent:${id}`);
  if (!existing) return undefined;
  
  const agent = typeof existing === 'string' ? JSON.parse(existing) : existing;
  const updated = { 
    ...agent, 
    ...updates, 
    updatedAt: new Date().toISOString() 
  };
  
  // If address changed, update mapping
  if (updates.xrplAddress && updates.xrplAddress !== agent.xrplAddress) {
    await kv.del(`agent:addr:${agent.xrplAddress}`);
    await kv.set(`agent:addr:${updates.xrplAddress}`, id);
  }
  
  await kv.set(`agent:${id}`, JSON.stringify(updated));
  return updated;
}

export async function getAgentsByStatus(status: AgentStatus): Promise<Agent[]> {
  const allAgents = await getAllAgents();
  return allAgents.filter((a) => a.status === status);
}

export async function getAgentsByTier(tier: VerificationTier): Promise<Agent[]> {
  const allAgents = await getAllAgents();
  return allAgents.filter((a) => a.tier === tier);
}

// ============================================================
// Credentials
// ============================================================

export async function getAllCredentials(): Promise<Credential[]> {
  // For simplicity, get all agent IDs and then fetch their credentials
  const agentIds = await kv.smembers('agents:all');
  const credentials: Credential[] = [];
  
  for (const agentId of agentIds) {
    const credIds = await kv.smembers(`creds:agent:${agentId}`);
    for (const credId of credIds) {
      const credData = await kv.get(`cred:${credId}`);
      if (credData) {
        credentials.push(typeof credData === 'string' ? JSON.parse(credData) : credData);
      }
    }
  }
  
  return credentials;
}

export async function getCredential(id: string): Promise<Credential | undefined> {
  const credData = await kv.get(`cred:${id}`);
  if (!credData) return undefined;
  
  return typeof credData === 'string' ? JSON.parse(credData) : credData;
}

export async function getCredentialsByAgent(agentId: string): Promise<Credential[]> {
  const credIds = await kv.smembers(`creds:agent:${agentId}`);
  const credentials: Credential[] = [];
  
  for (const credId of credIds) {
    const credData = await kv.get(`cred:${credId}`);
    if (credData) {
      credentials.push(typeof credData === 'string' ? JSON.parse(credData) : credData);
    }
  }
  
  return credentials;
}

export async function getActiveCredentialsByAgent(agentId: string): Promise<Credential[]> {
  const allCreds = await getCredentialsByAgent(agentId);
  const now = new Date().toISOString();
  
  return allCreds.filter(
    (c) => c.status === 'active' && c.expiresAt > now
  );
}

export async function createCredential(credential: Credential): Promise<Credential> {
  // Store credential
  await kv.set(`cred:${credential.id}`, JSON.stringify(credential));
  
  // Add to agent's credential set
  await kv.sadd(`creds:agent:${credential.agentId}`, credential.id);
  
  return credential;
}

export async function updateCredentialStatus(
  id: string,
  status: Credential['status']
): Promise<boolean> {
  const existing = await kv.get(`cred:${id}`);
  if (!existing) return false;
  
  const credential = typeof existing === 'string' ? JSON.parse(existing) : existing;
  credential.status = status;
  
  if (status === 'revoked') {
    credential.revokedAt = new Date().toISOString();
  }
  
  await kv.set(`cred:${id}`, JSON.stringify(credential));
  return true;
}

// ============================================================
// Challenges
// ============================================================

export async function createChallenge(challenge: Challenge): Promise<Challenge> {
  // Store with TTL (30 seconds auto-expire)
  await kv.setex(`challenge:${challenge.id}`, 30, JSON.stringify(challenge));
  return challenge;
}

export async function getChallenge(id: string): Promise<Challenge | undefined> {
  const challengeData = await kv.get(`challenge:${id}`);
  if (!challengeData) return undefined;
  
  return typeof challengeData === 'string' ? JSON.parse(challengeData) : challengeData;
}

export async function updateChallenge(
  id: string,
  updates: Partial<Challenge>
): Promise<boolean> {
  const existing = await kv.get(`challenge:${id}`);
  if (!existing) return false;
  
  const challenge = typeof existing === 'string' ? JSON.parse(existing) : existing;
  const updated = { ...challenge, ...updates };
  
  // Keep the same TTL
  await kv.setex(`challenge:${id}`, 30, JSON.stringify(updated));
  return true;
}

// ============================================================
// Verification Sessions
// ============================================================

export async function createSession(session: VerificationSession): Promise<VerificationSession> {
  // Store session
  await kv.set(`session:${session.id}`, JSON.stringify(session));
  
  // Add to agent's session set
  await kv.sadd(`sessions:agent:${session.agentId}`, session.id);
  
  return session;
}

export async function getSessionsByAgent(agentId: string): Promise<VerificationSession[]> {
  const sessionIds = await kv.smembers(`sessions:agent:${agentId}`);
  const sessions: VerificationSession[] = [];
  
  for (const sessionId of sessionIds) {
    const sessionData = await kv.get(`session:${sessionId}`);
    if (sessionData) {
      sessions.push(typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData);
    }
  }
  
  return sessions;
}

export async function updateSession(
  id: string,
  updates: Partial<VerificationSession>
): Promise<boolean> {
  const existing = await kv.get(`session:${id}`);
  if (!existing) return false;
  
  const session = typeof existing === 'string' ? JSON.parse(existing) : existing;
  const updated = { ...session, ...updates };
  
  await kv.set(`session:${id}`, JSON.stringify(updated));
  return true;
}

// ============================================================
// Monitoring Events
// ============================================================

export async function logEvent(
  agentId: string,
  eventType: string,
  severity: MonitoringEvent['severity'],
  data: Record<string, unknown>
): Promise<MonitoringEvent> {
  const event: MonitoringEvent = {
    id: crypto.randomUUID(),
    agentId,
    eventType,
    severity,
    data: JSON.stringify(data),
    createdAt: new Date().toISOString(),
  };
  
  // Add to recent events list (keep last 1000)
  await kv.lpush('events:recent', JSON.stringify(event));
  await kv.ltrim('events:recent', 0, 999);
  
  // Add to agent-specific events list
  await kv.lpush(`events:agent:${agentId}`, JSON.stringify(event));
  await kv.ltrim(`events:agent:${agentId}`, 0, 999);
  
  return event;
}

export async function getRecentEvents(limit = 50): Promise<MonitoringEvent[]> {
  const eventStrings = await kv.lrange('events:recent', 0, limit - 1);
  return eventStrings.map(eventStr => 
    typeof eventStr === 'string' ? JSON.parse(eventStr) : eventStr
  );
}

export async function getEventsByAgent(agentId: string): Promise<MonitoringEvent[]> {
  const eventStrings = await kv.lrange(`events:agent:${agentId}`, 0, -1);
  return eventStrings.map(eventStr => 
    typeof eventStr === 'string' ? JSON.parse(eventStr) : eventStr
  );
}

// ============================================================
// Behavioral Baselines
// ============================================================

export async function saveBehavioralBaseline(agentId: string, fingerprint: string): Promise<void> {
  await kv.set(`baseline:${agentId}`, fingerprint);
}

export async function getBehavioralBaseline(agentId: string): Promise<string | null> {
  const baseline = await kv.get(`baseline:${agentId}`);
  return baseline ? (typeof baseline === 'string' ? baseline : JSON.stringify(baseline)) : null;
}

// ============================================================
// Stats
// ============================================================

export async function getStats() {
  const agentIds = await kv.smembers('agents:all');
  const agents: Agent[] = [];
  
  // Fetch all agents for analysis
  for (const id of agentIds) {
    const agentData = await kv.get(`agent:${id}`);
    if (agentData) {
      agents.push(typeof agentData === 'string' ? JSON.parse(agentData) : agentData);
    }
  }
  
  // Fetch recent events
  const recentEvents = await getRecentEvents(20);
  
  // Calculate credential stats
  const allCreds = await getAllCredentials();
  const now = new Date().toISOString();
  
  return {
    totalAgents: agents.length,
    verifiedAgents: agents.filter((a) => a.status === 'verified').length,
    pendingAgents: agents.filter((a) => a.status === 'pending').length,
    suspendedAgents: agents.filter((a) => a.status === 'suspended').length,
    tierDistribution: {
      basic: agents.filter((a) => a.tier === VerificationTier.BASIC).length,
      attested: agents.filter((a) => a.tier === VerificationTier.ATTESTED).length,
      audited: agents.filter((a) => a.tier === VerificationTier.AUDITED).length,
    },
    totalCredentials: allCreds.length,
    activeCredentials: allCreds.filter(
      (c) => c.status === 'active' && c.expiresAt > now
    ).length,
    recentEvents,
  };
}