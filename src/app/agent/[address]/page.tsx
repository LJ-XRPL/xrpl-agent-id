'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Agent, Credential, VerificationSession } from '@/lib/types';
import CredentialBadge from '@/components/CredentialBadge';
import ChallengeVerifier from '@/components/ChallengeVerifier';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Bot,
  FileText,
  Activity,
  Loader2,
  Copy,
} from 'lucide-react';

export default function AgentDetailPage() {
  const params = useParams();
  const address = params?.address as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [sessions, setSessions] = useState<VerificationSession[]>([]);
  const [did, setDid] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    Promise.all([
      fetch(`/api/agents?address=${address}`).then((r) => r.json()),
      fetch(`/api/verify?address=${address}`).then((r) => r.json()),
    ])
      .then(([agentData, verifyData]) => {
        setAgent(agentData.agent || null);
        setCredentials(verifyData.credentials || []);
        setSessions(verifyData.sessions || []);
        if (verifyData.did) {
          try {
            setDid(
              typeof verifyData.did === 'string'
                ? JSON.parse(verifyData.did)
                : verifyData.did
            );
          } catch {
            setDid(null);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [address]);

  const copy = (text: string) => navigator.clipboard.writeText(text);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-zinc-500">Agent not found</p>
        <Link href="/directory" className="text-blue-600 hover:underline text-sm">
          ← Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/directory"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="w-4 h-4" /> Back to directory
      </Link>

      {/* Header */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{agent.name}</h1>
              <p className="text-sm text-zinc-500">{agent.modelType} · {agent.owner}</p>
            </div>
          </div>
          <CredentialBadge tier={agent.tier} size="lg" />
        </div>

        <p className="text-zinc-600 dark:text-zinc-400">{agent.description}</p>

        {/* Key info */}
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-24">Address:</span>
              <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded flex-1 truncate">
                {agent.xrplAddress}
              </code>
              <button onClick={() => copy(agent.xrplAddress)} className="text-zinc-400 hover:text-zinc-600">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-24">DID:</span>
              <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded flex-1 truncate">
                {agent.did}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-24">Status:</span>
              <span
                className={`font-medium ${
                  agent.status === 'verified'
                    ? 'text-green-600'
                    : agent.status === 'pending'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {agent.status}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-24">Registered:</span>
              <span>{new Date(agent.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-24">Updated:</span>
              <span>{new Date(agent.updatedAt).toLocaleString()}</span>
            </div>
            {agent.didTxHash && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 w-24">DID TX:</span>
                <a
                  href={`https://testnet.xrpl.org/transactions/${agent.didTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-xs flex items-center gap-0.5"
                >
                  {agent.didTxHash.slice(0, 16)}… <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Capabilities */}
        {agent.capabilities.length > 0 && (
          <div>
            <span className="text-sm text-zinc-500">Capabilities:</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {agent.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Credentials */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Credential History
        </h2>
        {credentials.length === 0 ? (
          <p className="text-sm text-zinc-500">No credentials issued yet.</p>
        ) : (
          <div className="space-y-2">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  {cred.status === 'active' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : cred.status === 'revoked' ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-zinc-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{cred.type}</p>
                    <p className="text-xs text-zinc-500">
                      Issued {new Date(cred.issuedAt).toLocaleDateString()} ·
                      Expires {new Date(cred.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      cred.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : cred.status === 'revoked'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {cred.status}
                  </span>
                  {cred.xrplTxHash && (
                    <a
                      href={`https://testnet.xrpl.org/transactions/${cred.xrplTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DID Document */}
      {did && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            DID Document
          </h2>
          <pre className="text-xs bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg overflow-x-auto max-h-80">
            {JSON.stringify(did, null, 2)}
          </pre>
        </div>
      )}

      {/* Verification sessions */}
      {sessions.length > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Verification History
          </h2>
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  {s.passed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium capitalize">
                      Tier: {s.tier}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(s.startedAt).toLocaleString()} · Score:{' '}
                      {s.overallScore}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    s.status === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live challenge */}
      <ChallengeVerifier address={agent.xrplAddress} />
    </div>
  );
}
