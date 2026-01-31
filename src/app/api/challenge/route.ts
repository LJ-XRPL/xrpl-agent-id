import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import {
  generateChallenge,
  runChallengeBattery,
  verifyCallbackResponse,
  verifyBehavioralResponse,
  verifyLatencyResponse,
  verifyPatternResponse,
} from '@/lib/challenge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'generate') {
      const { address, type = 'callback' } = body;
      if (!address) {
        return NextResponse.json({ error: 'Address required' }, { status: 400 });
      }
      const challenge = await generateChallenge(address, type);
      return NextResponse.json({
        challenge: {
          id: challenge.id,
          nonce: challenge.nonce,
          timestamp: challenge.timestamp,
          type: challenge.challengeType,
          data: JSON.parse(challenge.data),
        },
      });
    }

    if (body.action === 'verify') {
      const { challengeId, response } = body;
      if (!challengeId || !response) {
        return NextResponse.json(
          { error: 'Challenge ID and response required' },
          { status: 400 }
        );
      }
      const challenge = await db.getChallenge(challengeId);
      if (!challenge) {
        return NextResponse.json(
          { error: 'Challenge not found' },
          { status: 404 }
        );
      }
      if (challenge.status !== 'pending') {
        return NextResponse.json(
          { error: 'Challenge already used' },
          { status: 400 }
        );
      }
      if (Date.now() > challenge.expiresAt) {
        return NextResponse.json(
          { error: 'Challenge expired' },
          { status: 400 }
        );
      }

      let result;
      const responseTimeMs = Date.now() - challenge.timestamp;
      switch (challenge.challengeType) {
        case 'callback':
          result = verifyCallbackResponse(challenge, response);
          break;
        case 'behavioral':
          result = verifyBehavioralResponse(challenge, response, responseTimeMs);
          break;
        case 'latency':
          result = verifyLatencyResponse(challenge, response, responseTimeMs);
          break;
        case 'pattern':
          result = verifyPatternResponse(challenge, response, responseTimeMs);
          break;
        default:
          return NextResponse.json(
            { error: 'Unknown challenge type' },
            { status: 400 }
          );
      }

      await db.updateChallenge(challengeId, {
        status: 'completed',
        responseData: JSON.stringify(response),
        responseTimeMs,
      });

      return NextResponse.json({ result });
    }

    if (body.action === 'run-battery') {
      const { address } = body;
      if (!address) {
        return NextResponse.json({ error: 'Address required' }, { status: 400 });
      }
      const agent = await db.getAgent(address);
      if (!agent) {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        );
      }

      const results = await runChallengeBattery(
        agent.xrplAddress,
        agent.callbackUrl
      );

      return NextResponse.json({ results });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
