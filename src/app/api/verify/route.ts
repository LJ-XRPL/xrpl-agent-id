import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { resolveDID } from '@/lib/xrpl';
import { parseDIDDocument } from '@/lib/did';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  const agent = await db.getAgent(address);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  const credentials = await db.getCredentialsByAgent(agent.id);
  const sessions = await db.getSessionsByAgent(agent.id);

  // Try to resolve DID from chain
  let did = null;
  try {
    const onChain = await resolveDID(address);
    if (onChain?.didDocument) {
      did = parseDIDDocument(onChain.didDocument);
    }
  } catch {
    // DID might not be on-chain yet
  }

  // If no on-chain DID, construct from local data
  if (!did) {
    const { createDIDDocument } = await import('@/lib/did');
    did = createDIDDocument(agent.xrplAddress, agent.publicKey, {
      name: agent.name,
      description: agent.description,
      modelType: agent.modelType,
      capabilities: agent.capabilities,
      owner: agent.owner,
      callbackUrl: agent.callbackUrl,
    });
  }

  return NextResponse.json({
    agent,
    credentials,
    sessions,
    did,
    tier: agent.tier,
  });
}
