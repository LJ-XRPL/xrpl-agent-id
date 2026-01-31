'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Bot,
  User,
  Copy,
  CheckCircle,
  ArrowRight,
  Terminal,
  Zap,
  Search,
  Database,
  ExternalLink,
  Fingerprint,
  Lock,
  Globe,
} from 'lucide-react';

type View = 'hero' | 'agent' | 'human';
type AgentTab = 'openclaw' | 'manual';

export default function HomePage() {
  const [view, setView] = useState<View>('hero');
  const [agentTab, setAgentTab] = useState<AgentTab>('openclaw');
  const [copied, setCopied] = useState(false);

  const curlCommand = 'curl -s https://xrpl-agent-id.vercel.app/skill.md';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center py-16 sm:py-24 space-y-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/20 border border-emerald-800/30 text-emerald-400 text-sm font-medium">
          <Shield className="w-4 h-4" />
          On-Chain Identity — XRPL Testnet
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            XRPL Agent Identity
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Registry
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Verifiable on-chain identity for AI agents. Register, verify, and prove who your agent
            is — powered by XRPL DIDs and Verifiable Credentials.
          </p>
        </div>

        {/* Two big buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <button
            onClick={() => setView('agent')}
            className={`group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
              view === 'agent'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-105'
                : 'bg-emerald-900/20 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/30 hover:border-emerald-700/50 hover:scale-[1.02]'
            }`}
          >
            <Bot className="w-6 h-6" />
            I&apos;m an Agent
          </button>

          <button
            onClick={() => setView('human')}
            className={`group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 ${
              view === 'human'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 scale-105'
                : 'bg-rose-900/20 text-rose-400 border border-rose-800/40 hover:bg-rose-900/30 hover:border-rose-700/50 hover:scale-[1.02]'
            }`}
          >
            <User className="w-6 h-6" />
            I&apos;m a Human
          </button>
        </div>
      </section>

      {/* Agent View */}
      {view === 'agent' && (
        <section className="max-w-3xl mx-auto w-full pb-16 space-y-8 animate-fade-in">
          {/* Tab Card */}
          <div className="border border-emerald-800/40 rounded-2xl overflow-hidden bg-zinc-900/50">
            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
              <button
                onClick={() => setAgentTab('openclaw')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                  agentTab === 'openclaw'
                    ? 'bg-emerald-900/20 text-emerald-400 border-b-2 border-emerald-500'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <Zap className="w-4 h-4" />
                openClaw
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 uppercase tracking-wider">
                  recommended
                </span>
              </button>
              <button
                onClick={() => setAgentTab('manual')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
                  agentTab === 'manual'
                    ? 'bg-zinc-800/50 text-zinc-200 border-b-2 border-zinc-500'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <Terminal className="w-4 h-4" />
                Manual
              </button>
            </div>

            {/* openClaw Tab Content */}
            {agentTab === 'openclaw' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-emerald-400 mb-2">
                    Zero-config identity in one command
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Pipe this into your openClaw agent. It fetches the skill, registers on XRPL,
                    and gets verified — fully automated.
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
                      A shareable DID:{' '}
                      <code className="px-1 py-0.5 rounded bg-emerald-900/40">
                        did:xrpl:testnet:&lt;address&gt;
                      </code>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Manual Tab Content */}
            {agentTab === 'manual' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-zinc-200 mb-2">Manual HTTP Callback Setup</h3>
                  <p className="text-sm text-zinc-400">
                    For agents that prefer direct API integration. You&apos;ll set up a callback
                    endpoint and register via the web form.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      num: '1',
                      title: 'Set up your callback endpoint',
                      desc: 'Expose an HTTP endpoint that can respond to JSON verification challenges (callback, behavioral, latency).',
                      icon: Globe,
                    },
                    {
                      num: '2',
                      title: 'Register via the web form',
                      desc: 'Fill in your agent details, capabilities, and callback URL. The system generates your XRPL keypair.',
                      icon: Database,
                    },
                    {
                      num: '3',
                      title: 'Pass verification challenges',
                      desc: 'Automated tests hit your callback. Pass them all and receive your on-chain Verifiable Credential.',
                      icon: Lock,
                    },
                  ].map((step) => (
                    <div key={step.num} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-zinc-400">{step.num}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-zinc-200">{step.title}</h4>
                        <p className="text-sm text-zinc-500">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-medium transition-colors"
                >
                  Go to Registration Form
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Human View */}
      {view === 'human' && (
        <section className="max-w-3xl mx-auto w-full pb-16 space-y-6 animate-fade-in">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold">Explore the Agent Directory</h2>
            <p className="text-zinc-400">
              Browse verified agents, check credentials, and verify agent identities.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                href: '/directory',
                icon: Database,
                title: 'Agent Directory',
                desc: 'Browse all registered agents and their verification status.',
                color: 'rose',
              },
              {
                href: '/verify',
                icon: Search,
                title: 'Verify an Agent',
                desc: 'Check if an agent has valid on-chain credentials.',
                color: 'rose',
              },
              {
                href: '/monitor',
                icon: Shield,
                title: 'Live Monitor',
                desc: 'Real-time verification activity and registry stats.',
                color: 'rose',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group border border-rose-800/30 bg-rose-950/10 rounded-2xl p-5 space-y-3 hover:border-rose-700/50 hover:bg-rose-950/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-900/30 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="font-bold text-zinc-200 group-hover:text-rose-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-500">{item.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-medium">
                  Open <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bottom Section */}
      <section className="border-t border-zinc-800/50 py-12 mt-auto">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <p className="text-zinc-500 text-sm">Don&apos;t have an AI agent?</p>
            <a
              href="https://openclaw.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Create one at openclaw.ai
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-zinc-600">
            <span>Open Source (MIT)</span>
            <span>·</span>
            <span>XRPL Testnet</span>
            <span>·</span>
            <a
              href="https://github.com/LJ-XRPL/xrpl-agent-id"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
