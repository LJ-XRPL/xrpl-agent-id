'use client';

import { useState, useEffect } from 'react';
import { SystemStats, MonitoringEvent } from '@/lib/types';
import CredentialBadge from '@/components/CredentialBadge';
import {
  Activity,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Loader2,
  TrendingUp,
} from 'lucide-react';

export default function MonitorPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = () => {
    setLoading(true);
    fetch('/api/monitor')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Monitoring Dashboard</h1>
          <p className="text-zinc-500">
            System-wide stats and event log. No manual approval needed — everything is automated.
          </p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {stats && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Agents"
              value={stats.totalAgents}
              icon={Users}
              color="text-blue-600"
            />
            <StatCard
              label="Verified"
              value={stats.verifiedAgents}
              icon={CheckCircle}
              color="text-green-600"
            />
            <StatCard
              label="Active Credentials"
              value={stats.activeCredentials}
              icon={Shield}
              color="text-purple-600"
            />
            <StatCard
              label="Pending"
              value={stats.pendingAgents}
              icon={Activity}
              color="text-amber-600"
            />
          </div>

          {/* Tier distribution */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tier Distribution
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {(['basic', 'attested', 'audited'] as const).map((tier) => (
                <div
                  key={tier}
                  className="text-center p-4 rounded-lg border border-zinc-200 dark:border-zinc-800"
                >
                  <CredentialBadge tier={tier} size="md" />
                  <div className="text-3xl font-bold mt-2">
                    {stats.tierDistribution[tier] || 0}
                  </div>
                  <div className="text-xs text-zinc-500 capitalize">{tier}</div>
                </div>
              ))}
            </div>

            {/* Visual bar */}
            {stats.totalAgents > 0 && (
              <div className="flex h-4 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {stats.tierDistribution.basic > 0 && (
                  <div
                    className="bg-emerald-500"
                    style={{
                      width: `${
                        (stats.tierDistribution.basic / stats.totalAgents) * 100
                      }%`,
                    }}
                  />
                )}
                {stats.tierDistribution.attested > 0 && (
                  <div
                    className="bg-amber-500"
                    style={{
                      width: `${
                        (stats.tierDistribution.attested / stats.totalAgents) *
                        100
                      }%`,
                    }}
                  />
                )}
                {stats.tierDistribution.audited > 0 && (
                  <div
                    className="bg-red-500"
                    style={{
                      width: `${
                        (stats.tierDistribution.audited / stats.totalAgents) *
                        100
                      }%`,
                    }}
                  />
                )}
                {stats.pendingAgents > 0 && (
                  <div
                    className="bg-zinc-300 dark:bg-zinc-600"
                    style={{
                      width: `${
                        (stats.pendingAgents / stats.totalAgents) * 100
                      }%`,
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Recent events */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Events
            </h2>
            {stats.recentEvents.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">
                No events yet. Register an agent to see activity.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {stats.recentEvents.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">{label}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function EventRow({ event }: { event: MonitoringEvent }) {
  const severityColors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    warning:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    critical:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    info: CheckCircle,
    warning: AlertTriangle,
    critical: AlertTriangle,
  };
  const Icon = icons[event.severity] || Activity;

  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(event.data);
  } catch {
    /* noop */
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
      <Icon
        className={`w-4 h-4 flex-shrink-0 ${
          event.severity === 'critical'
            ? 'text-red-500'
            : event.severity === 'warning'
            ? 'text-amber-500'
            : 'text-blue-500'
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{event.eventType}</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              severityColors[event.severity] || severityColors.info
            }`}
          >
            {event.severity}
          </span>
        </div>
        {data && Object.keys(data).length > 0 && (
          <p className="text-xs text-zinc-500 truncate">
            {Object.entries(data)
              .slice(0, 3)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' · ')}
          </p>
        )}
      </div>
      <span className="text-xs text-zinc-400 flex-shrink-0">
        {new Date(event.createdAt).toLocaleTimeString()}
      </span>
    </div>
  );
}
