'use client';

import { useState } from 'react';
import { Shield, CheckCircle, XCircle, Loader2, Send } from 'lucide-react';

interface ChallengeResult {
  type: string;
  passed: boolean;
  score: number;
  details: Record<string, unknown>;
  responseTimeMs?: number;
}

export default function ChallengeVerifier({ address }: { address: string }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ChallengeResult[] | null>(null);
  const [error, setError] = useState('');

  const runChallenge = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const resp = await fetch('/api/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run-battery', address }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Challenge failed');
      setResults(data.results);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const overallScore =
    results && results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
      : null;

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 bg-white dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">Live Challenge Test</h3>
        </div>
        <button
          onClick={runChallenge}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {loading ? 'Running…' : 'Run Challenge'}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-3">
          {/* Overall score */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
            <span className="font-medium">Overall Score</span>
            <span
              className={`text-lg font-bold ${
                (overallScore || 0) >= 70
                  ? 'text-green-600'
                  : (overallScore || 0) >= 40
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {overallScore}/100
            </span>
          </div>

          {/* Individual results */}
          {results.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800"
            >
              <div className="flex items-center gap-2">
                {r.passed ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium capitalize">
                  {r.type}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {r.responseTimeMs != null && (
                  <span className="text-zinc-400">{r.responseTimeMs}ms</span>
                )}
                <span
                  className={`font-mono font-medium ${
                    r.score >= 70
                      ? 'text-green-600'
                      : r.score >= 40
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {r.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!results && !loading && !error && (
        <p className="text-sm text-zinc-500 text-center py-4">
          Click &quot;Run Challenge&quot; to send a live verification challenge to this agent&apos;s callback endpoint.
        </p>
      )}
    </div>
  );
}
