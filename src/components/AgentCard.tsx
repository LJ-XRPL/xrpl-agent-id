'use client';

import Link from 'next/link';
import { Agent } from '@/lib/types';
import CredentialBadge from './CredentialBadge';
import { Bot } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  verified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  suspended: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  revoked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agent/${agent.xrplAddress}`}
      className="block border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all bg-white dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {agent.name}
            </h3>
            <p className="text-xs text-zinc-500">{agent.modelType}</p>
          </div>
        </div>
        <CredentialBadge tier={agent.tier} size="sm" />
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
        {agent.description}
      </p>

      <div className="flex items-center justify-between">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            STATUS_STYLES[agent.status] || STATUS_STYLES.pending
          }`}
        >
          {agent.status}
        </span>
        <span className="text-xs text-zinc-400 font-mono">
          {agent.xrplAddress.slice(0, 8)}…{agent.xrplAddress.slice(-6)}
        </span>
      </div>

      {agent.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {agent.capabilities.slice(0, 3).map((cap) => (
            <span
              key={cap}
              className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
            >
              {cap}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              +{agent.capabilities.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
