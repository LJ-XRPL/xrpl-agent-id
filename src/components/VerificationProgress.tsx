'use client';

import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Result {
  type: string;
  passed: boolean;
  score: number;
  details: Record<string, unknown>;
  responseTimeMs?: number;
}

export default function VerificationProgress({
  results,
  loading,
}: {
  results: Result[];
  loading: boolean;
}) {
  if (results.length === 0 && !loading) return null;

  const overallScore =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
      : 0;
  const passedCount = results.filter((r) => r.passed).length;

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          Running verification tests…
        </div>
      )}

      {results.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
              <div className="text-2xl font-bold">{overallScore}</div>
              <div className="text-xs text-zinc-500">Score</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
              <div className="text-2xl font-bold text-green-600">
                {passedCount}
              </div>
              <div className="text-xs text-zinc-500">Passed</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
              <div className="text-2xl font-bold text-red-600">
                {results.length - passedCount}
              </div>
              <div className="text-xs text-zinc-500">Failed</div>
            </div>
          </div>

          {/* Individual results */}
          <div className="space-y-2">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800"
              >
                {r.passed ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <span className="text-sm font-medium capitalize flex-1">
                  {r.type}
                </span>
                {r.responseTimeMs != null && (
                  <span className="text-xs text-zinc-400">
                    {r.responseTimeMs}ms
                  </span>
                )}
                <span
                  className={`text-sm font-mono font-bold ${
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
            ))}
          </div>
        </>
      )}
    </div>
  );
}
