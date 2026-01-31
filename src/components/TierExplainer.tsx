'use client';

import { Shield, ShieldCheck, ShieldAlert, Clock, Zap, HardHat } from 'lucide-react';

const tiers = [
  {
    tier: 'basic',
    emoji: '🟢',
    label: 'Tier 1: Basic',
    subtitle: 'Instant verification',
    icon: Shield,
    color: 'border-emerald-300 dark:border-emerald-700',
    bg: 'bg-emerald-50 dark:bg-emerald-900/10',
    checks: [
      'Callback endpoint responds to signed challenges',
      'Behavioral test battery (trivial for LLMs, hard for humans)',
      'Latency profiling matches bot patterns',
      'Auto-issues verified-basic credential on pass',
    ],
  },
  {
    tier: 'attested',
    emoji: '🟡',
    label: 'Tier 2: Attested',
    subtitle: 'Instant if TEE provided',
    icon: ShieldCheck,
    color: 'border-amber-300 dark:border-amber-700',
    bg: 'bg-amber-50 dark:bg-amber-900/10',
    checks: [
      'Everything from Tier 1',
      'TEE attestation verification (SGX, Nitro, TrustZone)',
      'Environmental fingerprint stored in DID document',
      'Behavioral baseline captured for drift monitoring',
    ],
  },
  {
    tier: 'audited',
    emoji: '🔴',
    label: 'Tier 3: Audited',
    subtitle: 'Automated over time',
    icon: ShieldAlert,
    color: 'border-red-300 dark:border-red-700',
    bg: 'bg-red-50 dark:bg-red-900/10',
    checks: [
      'Everything from Tier 1 + 2',
      'Extended profiling over 7+ days',
      'Behavioral fingerprint must remain stable',
      'Environmental fingerprint must not change',
    ],
  },
];

export default function TierExplainer() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {tiers.map((t) => (
        <div
          key={t.tier}
          className={`rounded-xl border-2 ${t.color} ${t.bg} p-5 space-y-3`}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{t.emoji}</span>
            <div>
              <h3 className="font-bold">{t.label}</h3>
              <p className="text-xs text-zinc-500">{t.subtitle}</p>
            </div>
          </div>
          <ul className="space-y-2">
            {t.checks.map((check, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Zap className="w-3.5 h-3.5 mt-0.5 text-zinc-400 flex-shrink-0" />
                {check}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
