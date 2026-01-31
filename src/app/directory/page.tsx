'use client';

import { useState, useEffect } from 'react';
import AgentCard from '@/components/AgentCard';
import { TierSelector } from '@/components/CredentialBadge';
import { Agent } from '@/lib/types';
import { Search, Loader2 } from 'lucide-react';

export default function DirectoryPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => r.json())
      .then((data) => setAgents(data.agents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = agents.filter((a) => {
    const matchesSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.xrplAddress.toLowerCase().includes(search.toLowerCase()) ||
      a.modelType.toLowerCase().includes(search.toLowerCase());

    const matchesTier =
      tierFilter === 'all' || a.tier === tierFilter;

    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Agent Directory</h1>
        <p className="text-zinc-500">
          Browse all registered AI agents with verifiable on-chain identity.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, address, or model…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
          />
        </div>
        <TierSelector value={tierFilter} onChange={setTierFilter} />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          {agents.length === 0
            ? 'No agents registered yet. Be the first!'
            : 'No agents match your filters.'}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center justify-center gap-6 text-sm text-zinc-500 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <span>{agents.length} total agents</span>
        <span>{agents.filter((a) => a.status === 'verified').length} verified</span>
        <span>{agents.filter((a) => a.tier === 'audited').length} audited</span>
      </div>
    </div>
  );
}
