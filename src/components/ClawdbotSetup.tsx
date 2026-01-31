'use client';

import { useState } from 'react';
import { Copy, CheckCircle, Terminal, Bot, ArrowRight } from 'lucide-react';

export default function ClawdbotSetup() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      label: 'Copy the skill into your agent workspace',
      code: 'cp -r xrpl-agent-id/skill/ your-agent/skill/',
      note: 'Or clone directly: git clone https://github.com/LJ-XRPL/xrpl-agent-id && cp -r xrpl-agent-id/skill/ your-agent/',
    },
    {
      label: 'Install the XRPL dependency',
      code: 'cd your-agent && npm install xrpl',
      note: 'The skill scripts need xrpl.js to interact with the ledger.',
    },
    {
      label: 'Register your agent on XRPL',
      code: 'node skill/scripts/register.js --name "My Agent" --model "gpt-4" --owner "my-org"',
      note: 'Generates a wallet, funds it via testnet faucet, and publishes a DID on-chain.',
    },
    {
      label: 'Verify your identity',
      code: 'node skill/scripts/verify.js --submit https://xrpl-agent-id.vercel.app',
      note: 'Requests a challenge from the registry and responds automatically.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Why Clawdbot */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          {
            icon: Bot,
            title: 'Auto-Handles Challenges',
            desc: 'The skill solves verification challenges automatically — no callback server needed.',
          },
          {
            icon: Terminal,
            title: 'Manages Keys',
            desc: 'Generates and stores XRPL keypairs securely in your workspace.',
          },
          {
            icon: CheckCircle,
            title: 'One Command',
            desc: 'From zero to verified on-chain identity in a single script run.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-1"
          >
            <div className="flex items-center gap-2">
              <item.icon className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-semibold">{item.title}</h4>
            </div>
            <p className="text-xs text-zinc-500">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden"
          >
            <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-sm font-medium">{step.label}</span>
            </div>
            <div className="p-3 flex items-center gap-2 bg-zinc-950 dark:bg-black">
              <code className="text-xs text-green-400 font-mono flex-1 overflow-x-auto">
                $ {step.code}
              </code>
              <button
                onClick={() => copyToClipboard(step.code, i)}
                className="text-zinc-500 hover:text-zinc-300 flex-shrink-0"
              >
                {copiedIndex === i ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            {step.note && (
              <div className="px-4 py-2 text-xs text-zinc-500 border-t border-zinc-200 dark:border-zinc-800">
                {step.note}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* What happens */}
      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm space-y-2">
        <h4 className="font-semibold text-green-800 dark:text-green-300">
          ✅ After setup, your agent has:
        </h4>
        <ul className="space-y-1 text-green-700 dark:text-green-400 text-xs list-disc list-inside">
          <li>An XRPL account with testnet XRP</li>
          <li>A W3C-compliant DID published on-chain (XLS-40d)</li>
          <li>Identity stored locally in <code className="bg-green-100 dark:bg-green-900/40 px-1 rounded">xrpl-identity.json</code></li>
          <li>Ability to respond to verification challenges via the skill</li>
          <li>A shareable DID anyone can verify: <code className="bg-green-100 dark:bg-green-900/40 px-1 rounded">did:xrpl:testnet:&lt;address&gt;</code></li>
        </ul>
      </div>

      {/* Skill structure */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1">
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
          View skill file structure
        </summary>
        <pre className="mt-2 p-3 rounded-lg bg-zinc-950 text-xs text-zinc-400 font-mono overflow-x-auto">
{`skill/
├── SKILL.md                  # Agent instructions (auto-loaded by Clawdbot)
├── scripts/
│   ├── register.js           # XRPL registration (wallet, faucet, DID)
│   └── verify.js             # Challenge-response handler
└── references/
    └── verification-tiers.md # 3-tier system docs`}
        </pre>
      </details>
    </div>
  );
}
