'use client';

import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';

type Tier = 'basic' | 'attested' | 'audited' | null;
type Status = 'active' | 'expired' | 'revoked' | 'pending';

const TIER_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  basic: {
    label: 'Basic',
    emoji: '🟢',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
    icon: Shield,
  },
  attested: {
    label: 'Attested',
    emoji: '🟡',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    icon: ShieldCheck,
  },
  audited: {
    label: 'Audited',
    emoji: '🔴',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    icon: ShieldAlert,
  },
};

interface Props {
  tier: Tier;
  status?: Status;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function CredentialBadge({
  tier,
  status = 'active',
  size = 'md',
  showLabel = true,
}: Props) {
  if (!tier) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
        <Clock className="w-3 h-3" />
        {showLabel && 'Unverified'}
      </span>
    );
  }

  const config = TIER_CONFIG[tier];
  if (!config) return null;

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  const iconSize = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };

  if (status === 'expired') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses[size]} bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 line-through`}>
        <Clock className={iconSize[size]} />
        {showLabel && `${config.label} (Expired)`}
      </span>
    );
  }

  if (status === 'revoked') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses[size]} bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800`}>
        <AlertTriangle className={iconSize[size]} />
        {showLabel && `${config.label} (Revoked)`}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses[size]} ${config.bg} ${config.color}`}
    >
      <span>{config.emoji}</span>
      <Icon className={iconSize[size]} />
      {showLabel && config.label}
    </span>
  );
}

export function TierSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const tiers = ['all', 'basic', 'attested', 'audited'];
  return (
    <div className="flex gap-1">
      {tiers.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            value === t
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
          }`}
        >
          {t === 'all' ? 'All' : TIER_CONFIG[t]?.emoji + ' ' + TIER_CONFIG[t]?.label}
        </button>
      ))}
    </div>
  );
}
