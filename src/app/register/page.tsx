'use client';

import { useState } from 'react';
import {
  Copy,
  CheckCircle,
  Terminal,
  Shield,
  Fingerprint,
  ArrowRight,
} from 'lucide-react';

export default function RegisterPage() {
  const [copied, setCopied] = useState(false);

  const curlCommand = 'curl -s https://xrpl-agent-id.vercel.app/skill.md';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Register AI Agent</h1>
        <p className="text-zinc-400">
          Create a verifiable on-chain identity for your AI agent on XRPL Testnet.
          The entire process is automated — no manual review.
        </p>
      </div>

      {/* Registration Content */}
      <div className="border border-emerald-800/40 rounded-2xl overflow-hidden bg-zinc-900/50">
        <div className="p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-emerald-400 mb-2">
                Zero-config identity in one command
              </h3>
              <p className="text-sm text-zinc-400">
                Pipe this into your openClaw agent. It fetches the skill, registers on XRPL,
                and gets verified — fully automated, zero manual steps.
              </p>
            </div>

            {/* Command Block */}
            <div className="group relative rounded-xl overflow-hidden border border-zinc-700/50">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/80 border-b border-zinc-700/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-600" />
                  <div className="w-3 h-3 rounded-full bg-zinc-600" />
                  <div className="w-3 h-3 rounded-full bg-zinc-600" />
                </div>
                <span className="text-xs text-zinc-500 ml-2">terminal</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-zinc-950">
                <span className="text-emerald-500 select-none">$</span>
                <code className="text-sm text-emerald-300 font-mono flex-1 select-all">
                  {curlCommand}
                </code>
                <button
                  onClick={() => copyToClipboard(curlCommand)}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-zinc-500 hover:text-zinc-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {[
                {
                  num: '1',
                  title: 'Run the command above',
                  desc: 'Fetches the XRPL identity skill with registration and verification scripts.',
                  icon: Terminal,
                },
                {
                  num: '2',
                  title: 'Agent auto-registers on XRPL',
                  desc: 'Generates a wallet, funds via testnet faucet, publishes DID on-chain. Zero manual steps.',
                  icon: Fingerprint,
                },
                {
                  num: '3',
                  title: 'Verified on-chain identity',
                  desc: 'Passes verification challenges automatically. You get a Verifiable Credential on XRPL.',
                  icon: Shield,
                },
              ].map((step) => (
                <div key={step.num} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-900/30 border border-emerald-800/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-emerald-400">{step.num}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-200">{step.title}</h4>
                    <p className="text-sm text-zinc-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Result */}
            <div className="rounded-xl bg-emerald-950/30 border border-emerald-800/30 p-4 space-y-2">
              <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                After setup, your agent has:
              </h4>
              <ul className="text-xs text-emerald-300/70 space-y-1 list-disc list-inside">
                <li>An XRPL account with testnet XRP</li>
                <li>A W3C-compliant DID published on-chain (XLS-40d)</li>
                <li>A Verifiable Credential anyone can check (XLS-70d)</li>
                <li>
                  Identity stored locally in{' '}
                  <code className="px-1 py-0.5 rounded bg-emerald-900/40">xrpl-identity.json</code>
                </li>
                <li>
                  A shareable DID:{' '}
                  <code className="px-1 py-0.5 rounded bg-emerald-900/40">
                    did:xrpl:testnet:&lt;address&gt;
                  </code>
                </li>
              </ul>
            </div>

            {/* Skill structure */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
                View skill file structure
              </summary>
              <pre className="mt-2 p-3 rounded-lg bg-zinc-950 text-xs text-zinc-400 font-mono overflow-x-auto">
{`skill/
├── SKILL.md                  # Agent instructions (auto-loaded by openClaw)
├── scripts/
│   ├── register.js           # XRPL registration (wallet, faucet, DID)
│   └── verify.js             # Challenge-response handler
└── references/
    └── verification-tiers.md # 3-tier system docs`}
              </pre>
            </details>

            {/* Manual Registration Note */}
            <div className="border-t border-zinc-700/50 pt-4">
              <p className="text-xs text-zinc-500 text-center">
                Need to register manually? Use the{' '}
                <a 
                  href="/api/agents" 
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  API directly
                </a>{' '}
                with a POST request.
              </p>
            </div>
          </div>
      </div>
    </div>
  );
}
