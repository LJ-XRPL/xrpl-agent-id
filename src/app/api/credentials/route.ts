import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import {
  issueCredential,
  revokeCredential,
  getHighestTier,
} from '@/lib/credentials';
import { VerificationTier } from '@/lib/types';

export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get('agentId');
  const address = req.nextUrl.searchParams.get('address');

  if (agentId) {
    const credentials = db.getCredentialsByAgent(agentId);
    return NextResponse.json({ credentials });
  }

  if (address) {
    const agent = db.getAgent(address);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    const credentials = db.getCredentialsByAgent(agent.id);
    const highestTier = getHighestTier(agent.id);
    return NextResponse.json({ credentials, highestTier });
  }

  const credentials = db.getAllCredentials();
  return NextResponse.json({ credentials });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'issue') {
      const { agentId, tier } = body;
      if (!agentId || !tier) {
        return NextResponse.json(
          { error: 'agentId and tier required' },
          { status: 400 }
        );
      }
      const agent = db.getAgent(agentId);
      if (!agent) {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        );
      }
      const credential = await issueCredential(
        agentId,
        agent.xrplAddress,
        tier as VerificationTier,
        []
      );
      return NextResponse.json({ credential });
    }

    if (body.action === 'revoke') {
      const { credentialId, reason } = body;
      if (!credentialId) {
        return NextResponse.json(
          { error: 'credentialId required' },
          { status: 400 }
        );
      }
      const success = await revokeCredential(
        credentialId,
        reason || 'Manual revocation'
      );
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
