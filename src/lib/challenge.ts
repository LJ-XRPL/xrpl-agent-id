// ============================================================
// Challenge Generation & Verification
// ============================================================

import crypto from 'crypto';
import {
  Challenge,
  ChallengeType,
  VerificationResult,
  TEEAttestation,
  BehavioralFingerprint,
} from './types';
import * as db from './db';

const CHALLENGE_TIMEOUT_MS = 5000; // 5s total, individual tests have tighter limits

// ============================================================
// Behavioral test definitions
// ============================================================

const BEHAVIORAL_TESTS = [
  {
    prompt: 'Complete: The quick brown fox jumps over the lazy ___',
    expectedPattern: /dog|hound/i,
    timeLimit: 300,
  },
  {
    prompt: 'What is 127 + 384? Answer only the number.',
    expectedPattern: /^511$/,
    timeLimit: 200,
  },
  {
    prompt: "Reverse this string: 'HELLO'",
    expectedPattern: /OLLEH/,
    timeLimit: 200,
  },
  {
    prompt: 'List 3 prime numbers between 10 and 30, comma-separated:',
    expectedPattern: /\b(11|13|17|19|23|29)\b.*\b(11|13|17|19|23|29)\b.*\b(11|13|17|19|23|29)\b/,
    timeLimit: 400,
  },
  {
    prompt: 'Convert binary 1101 to decimal:',
    expectedPattern: /13/,
    timeLimit: 200,
  },
];

const PATTERN_TESTS = [
  { pattern: '1, 2, 4, 8, 16, __', expected: '32' },
  { pattern: 'A, C, E, G, __', expected: 'I' },
  { pattern: 'Red, Orange, Yellow, Green, __', expected: 'Blue' },
];

// ============================================================
// Challenge generation
// ============================================================

export function generateChallenge(
  agentAddress: string,
  challengeType: ChallengeType,
  extraData?: Record<string, unknown>
): Challenge {
  const nonce = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now();

  let data: Record<string, unknown>;
  switch (challengeType) {
    case 'callback': {
      const echoStr = crypto.randomBytes(16).toString('hex');
      data = {
        type: 'echo',
        message: `Echo: ${echoStr}`,
        expected: echoStr,
      };
      break;
    }
    case 'behavioral': {
      const idx = Math.floor(Math.random() * BEHAVIORAL_TESTS.length);
      const test = BEHAVIORAL_TESTS[idx];
      data = {
        type: 'behavioral',
        prompt: test.prompt,
        testIndex: idx,
        timeLimit: test.timeLimit,
      };
      break;
    }
    case 'latency':
      data = { type: 'latency', prompt: 'Respond with OK', expected: 'OK' };
      break;
    case 'pattern': {
      const idx = Math.floor(Math.random() * PATTERN_TESTS.length);
      const pt = PATTERN_TESTS[idx];
      data = {
        type: 'pattern',
        pattern: pt.pattern,
        expected: pt.expected,
        testIndex: idx,
      };
      break;
    }
    default:
      data = {};
  }

  // Merge extra data
  if (extraData) data = { ...data, ...extraData };

  const signature = crypto
    .createHmac('sha256', nonce)
    .update(`${nonce}${timestamp}`)
    .digest('hex');

  const challenge: Challenge = {
    id: crypto.randomUUID(),
    agentAddress,
    challengeType,
    nonce,
    data: JSON.stringify(data),
    signature,
    timestamp,
    expiresAt: timestamp + CHALLENGE_TIMEOUT_MS,
    status: 'pending',
    responseData: null,
    responseTimeMs: null,
  };

  db.createChallenge(challenge);
  return challenge;
}

// ============================================================
// Send challenge to agent callback
// ============================================================

export async function sendChallenge(
  challenge: Challenge,
  callbackUrl: string
): Promise<{
  success: boolean;
  responseTimeMs: number;
  response?: Record<string, unknown>;
  error?: string;
}> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHALLENGE_TIMEOUT_MS);

    const resp = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Challenge-ID': challenge.id,
        'X-Challenge-Nonce': challenge.nonce,
      },
      body: JSON.stringify({
        challenge: {
          id: challenge.id,
          nonce: challenge.nonce,
          timestamp: challenge.timestamp,
          type: challenge.challengeType,
          data: JSON.parse(challenge.data),
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;

    if (!resp.ok) {
      return {
        success: false,
        responseTimeMs,
        error: `HTTP ${resp.status}`,
      };
    }

    const response = await resp.json();
    db.updateChallenge(challenge.id, {
      status: 'completed',
      responseData: JSON.stringify(response),
      responseTimeMs,
    });

    return { success: true, responseTimeMs, response };
  } catch (e: unknown) {
    return {
      success: false,
      responseTimeMs: Date.now() - start,
      error: (e as Error).message,
    };
  }
}

// ============================================================
// Verify challenge response
// ============================================================

export function verifyCallbackResponse(
  challenge: Challenge,
  response: Record<string, unknown>
): VerificationResult {
  const data = JSON.parse(challenge.data);
  const expected = data.expected as string;
  const actual = ((response.message || response.text || '') as string).trim();
  const passed = actual === expected;

  return {
    type: 'callback',
    passed,
    score: passed ? 100 : 0,
    details: { expected, actual },
    timestamp: new Date().toISOString(),
  };
}

export function verifyBehavioralResponse(
  challenge: Challenge,
  response: Record<string, unknown>,
  responseTimeMs: number
): VerificationResult {
  const data = JSON.parse(challenge.data);
  const testIndex = data.testIndex as number;
  const test = BEHAVIORAL_TESTS[testIndex];
  const text = ((response.text || response.message || '') as string).trim();

  let score = 0;
  const details: Record<string, unknown> = {
    prompt: data.prompt,
    response: text,
    responseTimeMs,
    testIndex,
  };

  // Pattern match
  if (test && test.expectedPattern.test(text)) {
    score += 50;
    details.patternMatch = true;
  }

  // Speed check
  if (test && responseTimeMs <= test.timeLimit) {
    score += 30;
    details.withinTimeLimit = true;
  }

  // Consistency bonus (AI responds consistently fast)
  if (responseTimeMs < 500) {
    score += 20;
    details.fastResponse = true;
  }

  return {
    type: 'behavioral',
    passed: score >= 60,
    score,
    details,
    timestamp: new Date().toISOString(),
    responseTimeMs,
  };
}

export function verifyLatencyResponse(
  challenge: Challenge,
  response: Record<string, unknown>,
  responseTimeMs: number
): VerificationResult {
  const data = JSON.parse(challenge.data);
  const expected = data.expected as string;
  const actual = ((response.text || response.message || '') as string).trim();

  let score = 0;
  if (actual === expected) score += 50;
  if (responseTimeMs < 200) score += 50;
  else if (responseTimeMs < 500) score += 25;

  return {
    type: 'latency',
    passed: score >= 75,
    score,
    details: { expected, actual, responseTimeMs },
    timestamp: new Date().toISOString(),
    responseTimeMs,
  };
}

export function verifyPatternResponse(
  challenge: Challenge,
  response: Record<string, unknown>,
  responseTimeMs: number
): VerificationResult {
  const data = JSON.parse(challenge.data);
  const expected = (data.expected as string).toLowerCase().trim();
  const actual = ((response.text || response.message || '') as string)
    .toLowerCase()
    .trim();

  const passed = actual.includes(expected);
  return {
    type: 'pattern',
    passed,
    score: passed ? 100 : 0,
    details: { pattern: data.pattern, expected, actual },
    timestamp: new Date().toISOString(),
    responseTimeMs,
  };
}

// ============================================================
// Full challenge battery
// ============================================================

export async function runChallengeBattery(
  agentAddress: string,
  callbackUrl: string
): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];

  // 1. Callback echo test
  try {
    const ch = generateChallenge(agentAddress, 'callback');
    const res = await sendChallenge(ch, callbackUrl);
    if (res.success && res.response) {
      results.push(verifyCallbackResponse(ch, res.response));
    } else {
      results.push({
        type: 'callback',
        passed: false,
        score: 0,
        details: { error: res.error || 'No response' },
        timestamp: new Date().toISOString(),
        responseTimeMs: res.responseTimeMs,
      });
    }
  } catch {
    results.push({
      type: 'callback',
      passed: false,
      score: 0,
      details: { error: 'Callback test failed' },
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Behavioral tests (3 rounds)
  for (let i = 0; i < 3; i++) {
    try {
      const ch = generateChallenge(agentAddress, 'behavioral', { round: i });
      const res = await sendChallenge(ch, callbackUrl);
      if (res.success && res.response) {
        results.push(
          verifyBehavioralResponse(ch, res.response, res.responseTimeMs)
        );
      } else {
        results.push({
          type: 'behavioral',
          passed: false,
          score: 0,
          details: { error: res.error, round: i },
          timestamp: new Date().toISOString(),
          responseTimeMs: res.responseTimeMs,
        });
      }
      await new Promise((r) => setTimeout(r, 50));
    } catch {
      results.push({
        type: 'behavioral',
        passed: false,
        score: 0,
        details: { error: 'Test failed', round: i },
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 3. Latency test
  try {
    const ch = generateChallenge(agentAddress, 'latency');
    const res = await sendChallenge(ch, callbackUrl);
    if (res.success && res.response) {
      results.push(verifyLatencyResponse(ch, res.response, res.responseTimeMs));
    }
  } catch {
    /* optional */
  }

  // 4. Pattern test
  try {
    const ch = generateChallenge(agentAddress, 'pattern');
    const res = await sendChallenge(ch, callbackUrl);
    if (res.success && res.response) {
      results.push(
        verifyPatternResponse(ch, res.response, res.responseTimeMs)
      );
    }
  } catch {
    /* optional */
  }

  return results;
}

// ============================================================
// TEE verification (mock for testnet demo)
// ============================================================

export async function verifyTEEAttestation(
  attestation: TEEAttestation
): Promise<VerificationResult> {
  // In production, verify against Intel IAS / AWS NSM / etc.
  // For demo, validate structure and freshness
  const isValid =
    attestation.attestationReport?.length > 50 &&
    attestation.nonce?.length >= 32 &&
    attestation.type &&
    attestation.timestamp;

  return {
    type: 'tee',
    passed: !!isValid,
    score: isValid ? 100 : 0,
    details: {
      attestationType: attestation.type,
      verified: !!isValid,
      note: isValid
        ? 'Attestation structure validated (production would verify cryptographic signature)'
        : 'Invalid attestation format',
    },
    timestamp: new Date().toISOString(),
  };
}

// ============================================================
// Behavioral fingerprint
// ============================================================

export function buildBehavioralFingerprint(
  results: VerificationResult[]
): BehavioralFingerprint {
  const times = results
    .map((r) => r.responseTimeMs)
    .filter((t): t is number => t != null && t > 0);

  const mean = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  const variance =
    times.length > 1
      ? times.reduce((acc, t) => acc + Math.pow(t - mean, 2), 0) /
        times.length
      : 0;
  const stdDev = Math.sqrt(variance);

  const passedCount = results.filter((r) => r.passed).length;
  const consistencyScore = mean > 0 ? Math.max(0, 100 - (stdDev / mean) * 100) : 0;

  return {
    meanResponseMs: Math.round(mean),
    stdDevMs: Math.round(stdDev),
    consistencyScore: Math.round(consistencyScore),
    patternAccuracy: results.length > 0
      ? Math.round((passedCount / results.length) * 100)
      : 0,
    sampleCount: results.length,
    establishedAt: new Date().toISOString(),
  };
}

export function detectBehavioralDrift(
  previous: BehavioralFingerprint,
  current: BehavioralFingerprint,
  threshold = 0.2
): boolean {
  if (previous.meanResponseMs === 0) return false;
  const latencyDrift =
    Math.abs(current.meanResponseMs - previous.meanResponseMs) /
    previous.meanResponseMs;
  const consistencyDrift =
    Math.abs(current.consistencyScore - previous.consistencyScore) / 100;

  return latencyDrift > threshold || consistencyDrift > threshold;
}
