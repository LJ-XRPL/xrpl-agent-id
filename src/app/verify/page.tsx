'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Agent, Credential, DIDDocument, VerificationTier } from '@/lib/types';
import CredentialBadge from '@/components/CredentialBadge';
import ChallengeVerifier from '@/components/ChallengeVerifier';
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';

function VerifyPageInner() {
  const searchParams = useSearchParams();
  const [address, setAddress] = useState(searchParams?.get('address') || '');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [did, setDid] = useState<DIDDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const verify = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError('');
    setAgent(null);
    setCredentials([]);
    setDid(null);
    setSearched(true);

    try {
      const resp = await fetch(`/api/verify?address=${encodeURIComponent(address)}`);
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Verification failed');
      setAgent(data.agent);
      setCredentials(data.credentials || []);
      if (data.did) {
        try {
          setDid(typeof data.did === 'string' ? JSON.parse(data.did) : data.did);
        } catch {
          setDid(null);
        }
      }
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Verify Agent</h1>
        <p className="text-zinc-500">
          Enter an XRPL address to verify an agent&apos;s identity, DID document,
          and credentials.
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && verify()}
            placeholder="rXXXXXXXXXXXXXX… or agent name"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
          />
        </div>
        <button
          onClick={verify}
          disabled={loading || !address.trim()}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Verify
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {searched && !loading && !agent && !error && (
        <div className="text-center py-8 text-zinc-500">
          <XCircle className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
          No agent found at this address
        </div>
      )}

      {agent && (
        <div className="space-y-6 animate-fade-in">
          {/* Agent summary */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{agent.name}</h2>
              <CredentialBadge tier={agent.tier} />
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {agent.description}
            </p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-zinc-500">Model:</span>{' '}
                <span className="font-medium">{agent.modelType}</span>
              </div>
              <div>
                <span className="text-zinc-500">Owner:</span>{' '}
                <span className="font-medium">{agent.owner}</span>
              </div>
              <div>
                <span className="text-zinc-500">Status:</span>{' '}
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
              <div>
                <span className="text-zinc-500">Registered:</span>{' '}
                <span className="font-medium">
                  {new Date(agent.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 p-2 rounded overflow-x-auto">
              {agent.xrplAddress}
            </div>
          </div>

          {/* Credentials */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Credentials ({credentials.length})
            </h3>
            {credentials.length === 0 ? (
              <p className="text-sm text-zinc-500">No credentials issued yet.</p>
            ) : (
              <div className="space-y-2">
                {credentials.map((cred) => (
                  <div
                    key={cred.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      {cred.status === 'active' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">{cred.type}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{cred.status}</span>
                      <span>
                        Expires {new Date(cred.expiresAt).toLocaleDateString()}
                      </span>
                      {cred.xrplTxHash && (
                        <a
                          href={`https://testnet.xrpl.org/transactions/${cred.xrplTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-0.5"
                        >
                          TX <ExternalLink className="w-3 h-3" />
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
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                DID Document
              </h3>
              <pre className="text-xs bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg overflow-x-auto max-h-80">
                {JSON.stringify(did, null, 2)}
              </pre>
            </div>
          )}

          {/* Live challenge */}
          <ChallengeVerifier address={agent.xrplAddress} />
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyPageInner />
    </Suspense>
  );
}
