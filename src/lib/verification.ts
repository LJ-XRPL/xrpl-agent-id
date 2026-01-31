// ============================================================
// Verification Orchestration
// ============================================================

import crypto from 'crypto';
import {
  VerificationTier,
  VerificationSession,
  VerificationResult,
  TEEAttestation,
} from './types';
import * as db from './db';
import {
  runChallengeBattery,
  verifyTEEAttestation,
  buildBehavioralFingerprint,
  detectBehavioralDrift,
} from './challenge';
import { issueCredential } from './credentials';

// ============================================================
// Tier thresholds
// ============================================================

const THRESHOLDS = {
  [VerificationTier.BASIC]: { minScore: 60, requiredCallbackPass: true },
  [VerificationTier.ATTESTED]: { minScore: 75, requiresTEE: true },
  [VerificationTier.AUDITED]: {
    minScore: 85,
    requiresTEE: true,
    monitoringDays: 7,
  },
};

// ============================================================
// Run verification for a tier
// ============================================================

export async function runVerification(
  agentId: string,
  targetTier: VerificationTier,
  teeAttestation?: TEEAttestation
): Promise<VerificationSession> {
  const agent = await db.getAgent(agentId);
  if (!agent) throw new Error('Agent not found');

  const sessionId = crypto.randomUUID();
  const session: VerificationSession = {
    id: sessionId,
    agentId,
    tier: targetTier,
    status: 'running',
    results: [],
    overallScore: 0,
    passed: false,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
  await db.createSession(session);

  const results: VerificationResult[] = [];

  try {
    // Phase 1: Challenge battery (all tiers)
    const challengeResults = await runChallengeBattery(
      agent.xrplAddress,
      agent.callbackUrl
    );
    results.push(...challengeResults);

    // Phase 2: TEE attestation (Tier 2+)
    if (
      targetTier === VerificationTier.ATTESTED ||
      targetTier === VerificationTier.AUDITED
    ) {
      if (!teeAttestation) {
        results.push({
          type: 'tee',
          passed: false,
          score: 0,
          details: { error: 'No TEE attestation provided' },
          timestamp: new Date().toISOString(),
        });
      } else {
        const teeResult = await verifyTEEAttestation(teeAttestation);
        results.push(teeResult);

        if (teeResult.passed) {
          const envFingerprint = crypto
            .createHash('sha256')
            .update(teeAttestation.attestationReport)
            .digest('hex');
          await db.updateAgent(agentId, { environmentalFingerprint: envFingerprint });
        }
      }
    }

    // Phase 3: Behavioral fingerprinting (Tier 2+)
    if (
      targetTier === VerificationTier.ATTESTED ||
      targetTier === VerificationTier.AUDITED
    ) {
      const fingerprint = buildBehavioralFingerprint(results);
      await db.saveBehavioralBaseline(agentId, JSON.stringify(fingerprint));

      results.push({
        type: 'behavioral',
        passed: fingerprint.consistencyScore >= 50,
        score: fingerprint.consistencyScore,
        details: {
          meanResponseMs: fingerprint.meanResponseMs,
          stdDevMs: fingerprint.stdDevMs,
          patternAccuracy: fingerprint.patternAccuracy,
          fingerprintEstablished: true,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Phase 4: Extended monitoring setup (Tier 3)
    if (targetTier === VerificationTier.AUDITED) {
      results.push({
        type: 'consistency',
        passed: true,
        score: 100,
        details: {
          monitoringPeriodDays: THRESHOLDS[VerificationTier.AUDITED].monitoringDays,
          status: 'monitoring_started',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Evaluate
    const overallScore = calculateScore(results);
    const passed = evaluateTier(results, targetTier, overallScore);

    // Determine achieved tier
    let achievedTier: VerificationTier | null = null;
    if (passed) {
      achievedTier = targetTier;
    } else if (
      targetTier !== VerificationTier.BASIC &&
      overallScore >= THRESHOLDS[VerificationTier.BASIC].minScore
    ) {
      // Fall back to basic
      achievedTier = VerificationTier.BASIC;
    }

    // Update agent & issue credential
    if (achievedTier) {
      await db.updateAgent(agentId, { status: 'verified', tier: achievedTier });
      try {
        await issueCredential(agentId, agent.xrplAddress, achievedTier, results);
      } catch (e) {
        console.warn('Credential issuance failed:', e);
      }
    }

    const finalSession: VerificationSession = {
      ...session,
      results,
      overallScore,
      passed: achievedTier !== null,
      status: achievedTier ? 'completed' : 'failed',
      completedAt: new Date().toISOString(),
    };

    await db.updateSession(sessionId, finalSession);
    await db.logEvent(agentId, 'verification_complete', achievedTier ? 'info' : 'warning', {
      tier: achievedTier,
      score: overallScore,
      passed: achievedTier !== null,
    });

    return finalSession;
  } catch (error) {
    const failedSession: VerificationSession = {
      ...session,
      results,
      status: 'failed',
      completedAt: new Date().toISOString(),
    };
    await db.updateSession(sessionId, failedSession);
    await db.logEvent(agentId, 'verification_error', 'critical', {
      error: (error as Error).message,
    });
    return failedSession;
  }
}

// ============================================================
// Re-verification (for monitoring)
// ============================================================

export async function reverifyAgent(agentId: string): Promise<{
  passed: boolean;
  driftDetected: boolean;
  results: VerificationResult[];
}> {
  const agent = await db.getAgent(agentId);
  if (!agent) throw new Error('Agent not found');

  const results = await runChallengeBattery(agent.xrplAddress, agent.callbackUrl);
  const newFingerprint = buildBehavioralFingerprint(results);

  let driftDetected = false;
  const baselineStr = await db.getBehavioralBaseline(agentId);
  if (baselineStr) {
    const previous = JSON.parse(baselineStr);
    driftDetected = detectBehavioralDrift(previous, newFingerprint);
  }

  const passed = !driftDetected && results.some((r) => r.passed);

  if (passed) {
    await db.saveBehavioralBaseline(agentId, JSON.stringify(newFingerprint));
  }

  await db.logEvent(
    agentId,
    driftDetected ? 'behavioral_drift' : 'reverification',
    driftDetected ? 'warning' : 'info',
    { passed, driftDetected, score: calculateScore(results) }
  );

  return { passed, driftDetected, results };
}

// ============================================================
// Helpers
// ============================================================

function calculateScore(results: VerificationResult[]): number {
  if (results.length === 0) return 0;
  const total = results.reduce((sum, r) => sum + r.score, 0);
  return Math.round(total / results.length);
}

function evaluateTier(
  results: VerificationResult[],
  tier: VerificationTier,
  score: number
): boolean {
  const threshold = THRESHOLDS[tier];
  if (score < threshold.minScore) return false;

  // Callback must pass for all tiers
  const callbackPassed = results.some(
    (r) => r.type === 'callback' && r.passed
  );
  if (!callbackPassed) return false;

  // TEE must pass for attested/audited
  if ('requiresTEE' in threshold && threshold.requiresTEE) {
    const teePassed = results.some((r) => r.type === 'tee' && r.passed);
    if (!teePassed) return false;
  }

  return true;
}
