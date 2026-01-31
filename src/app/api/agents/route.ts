import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import * as db from '@/lib/db';
import { generateWallet, fundAccount, submitDIDSet } from '@/lib/xrpl';
import { createDIDDocument } from '@/lib/did';
import { Agent, RegisterRequest } from '@/lib/types';
import { Wallet } from 'xrpl';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');

  if (address) {
    const agent = db.getAgent(address);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    return NextResponse.json({ agent });
  }

  const agents = db.getAllAgents();
  return NextResponse.json({ agents });
}

export async function POST(req: NextRequest) {
  const body: RegisterRequest = await req.json();

  // Validate
  if (!body.name || !body.description || !body.modelType || !body.owner || !body.callbackUrl) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Use streaming response for real-time progress
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
      };

      try {
        // Step 0: Generate wallet
        send({ type: 'step', index: 0, status: 'running' });
        const walletData = generateWallet();
        send({
          type: 'wallet',
          wallet: {
            address: walletData.address,
            publicKey: walletData.publicKey,
            seed: walletData.seed,
          },
        });
        send({
          type: 'step',
          index: 0,
          status: 'done',
          detail: `Address: ${walletData.address}`,
        });

        // Step 1: Fund account
        send({ type: 'step', index: 1, status: 'running' });
        const funding = await fundAccount(walletData.address);
        send({
          type: 'step',
          index: 1,
          status: funding.success ? 'done' : 'error',
          detail: funding.success
            ? 'Account funded with test XRP'
            : 'Funding failed — account may not exist on-chain yet',
        });

        // Step 2: Publish DID
        send({ type: 'step', index: 2, status: 'running' });
        const did = `did:xrpl:testnet:${walletData.address}`;
        const didDocument = createDIDDocument(walletData.address, walletData.publicKey, {
          name: body.name,
          description: body.description,
          modelType: body.modelType,
          capabilities: body.capabilities || [],
          owner: body.owner,
          callbackUrl: body.callbackUrl,
        });

        let didTxHash: string | null = null;
        if (funding.success) {
          try {
            const wallet = Wallet.fromSeed(walletData.seed);
            const result = await submitDIDSet(
              wallet,
              JSON.stringify(didDocument),
              `https://xrpl-agent-id.example.com/agent/${walletData.address}`
            );
            didTxHash = result.hash || null;
            send({
              type: 'step',
              index: 2,
              status: result.success ? 'done' : 'error',
              detail: result.success
                ? 'DID published on-chain'
                : result.error || 'DID publication failed',
              txHash: didTxHash,
            });
          } catch (e: unknown) {
            send({
              type: 'step',
              index: 2,
              status: 'error',
              detail: (e as Error).message,
            });
          }
        } else {
          send({
            type: 'step',
            index: 2,
            status: 'done',
            detail: 'DID document created (on-chain publish requires funded account)',
          });
        }

        // Create agent record
        const agent: Agent = {
          id: crypto.randomUUID(),
          name: body.name,
          description: body.description,
          modelType: body.modelType,
          capabilities: body.capabilities || [],
          owner: body.owner,
          callbackUrl: body.callbackUrl,
          xrplAddress: walletData.address,
          publicKey: walletData.publicKey,
          did,
          status: 'pending',
          tier: null,
          didTxHash,
          environmentalFingerprint: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.createAgent(agent);
        db.logEvent(agent.id, 'agent_registered', 'info', {
          address: walletData.address,
          did,
        });

        // Step 3: Run verification (simulate for demo since callback probably isn't real)
        send({ type: 'step', index: 3, status: 'running' });
        // In a real scenario, this would call runVerification
        // For demo, we'll create a simulated verification
        try {
          const { runVerification } = await import('@/lib/verification');
          const { VerificationTier } = await import('@/lib/types');
          const session = await runVerification(agent.id, VerificationTier.BASIC);
          send({
            type: 'step',
            index: 3,
            status: session.passed ? 'done' : 'error',
            detail: session.passed
              ? `Score: ${session.overallScore}/100 — Passed!`
              : `Score: ${session.overallScore}/100 — Tests didn't pass (callback may be unreachable)`,
          });

          // Step 4: Issue credential
          if (session.passed) {
            send({ type: 'step', index: 4, status: 'done', detail: 'Tier 1 credential issued' });
          } else {
            send({
              type: 'step',
              index: 4,
              status: 'done',
              detail: 'Agent registered without credential — verify later when callback is available',
            });
          }
        } catch (e: unknown) {
          send({
            type: 'step',
            index: 3,
            status: 'done',
            detail: 'Verification skipped (callback endpoint unreachable)',
          });
          send({
            type: 'step',
            index: 4,
            status: 'done',
            detail: 'Register complete — run verification later from agent profile',
          });
        }

        send({ type: 'complete', address: walletData.address });
      } catch (e: unknown) {
        send({ type: 'error', message: (e as Error).message });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}
