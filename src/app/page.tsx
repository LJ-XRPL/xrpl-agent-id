import Link from 'next/link';
import {
  Shield,
  Zap,
  Eye,
  ArrowRight,
  UserPlus,
  Database,
  Search,
  Lock,
  Cpu,
  Globe,
  Bot,
  Terminal,
  CheckCircle,
} from 'lucide-react';
import TierExplainer from '@/components/TierExplainer';

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-12 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium">
          <Globe className="w-4 h-4" />
          Built on XRPL Testnet — XLS-40d & XLS-70d
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          Verifiable Identity
          <br />
          <span className="text-blue-600 dark:text-blue-500">
            for AI Agents
          </span>
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          An open-source registry where AI agents receive on-chain verifiable credentials
          through fully automated verification. Install the{' '}
          <a
            href="https://github.com/LJ-XRPL/xrpl-agent-id"
            className="text-blue-600 hover:underline"
          >
            openClaw skill
          </a>{' '}
          and go from zero to verified identity in one command.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
          >
            <Bot className="w-5 h-5" />
            Get Started
          </Link>
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 font-medium"
          >
            <Search className="w-5 h-5" />
            Verify Agent
          </Link>
        </div>
      </section>

      {/* Quick Start with openClaw */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5" />
            QUICKEST PATH
          </div>
          <h2 className="text-2xl font-bold">Quick Start with openClaw</h2>
          <p className="text-zinc-500 mt-2">
            Three commands. Your agent gets a verifiable on-chain identity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Terminal,
              step: '1',
              title: 'Install Skill',
              code: 'cp -r skill/ your-agent/',
              desc: 'Copy the xrpl-agent-id skill into your openClaw agent workspace.',
            },
            {
              icon: Zap,
              step: '2',
              title: 'Register',
              code: 'node skill/scripts/register.js',
              desc: 'Generates wallet, funds via faucet, publishes DID on-chain.',
            },
            {
              icon: CheckCircle,
              step: '3',
              title: 'Verified',
              code: 'node skill/scripts/verify.js --submit <url>',
              desc: 'Responds to challenges automatically. Agent is verified.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden"
            >
              <div className="p-5 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold">
                  <span className="text-blue-600">{item.step}.</span>{' '}
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-500">{item.desc}</p>
              </div>
              <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                <code className="text-xs text-green-400 font-mono">
                  $ {item.code}
                </code>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium"
          >
            Full setup guide <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: UserPlus,
              title: '1. Register',
              desc: 'Create an XRPL account, publish a DID document, and install the openClaw skill — or expose a callback endpoint manually.',
            },
            {
              icon: Zap,
              title: '2. Verify',
              desc: 'Automated test battery checks your agent: callback challenges, behavioral tests, latency profiling.',
            },
            {
              icon: Shield,
              title: '3. Credential',
              desc: 'Pass verification and receive an on-chain Verifiable Credential anyone can check.',
            },
          ].map((step) => (
            <div
              key={step.title}
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
                <step.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg">{step.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tier system */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">3-Tier Verification System</h2>
          <p className="text-zinc-500 mt-2">
            Fully automated — no manual review at any tier
          </p>
        </div>
        <TierExplainer />
      </section>

      {/* Trust model */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center">Trust Model</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: Lock,
              title: 'XRPL DIDs (XLS-40d)',
              desc: 'Each agent has a W3C-compliant DID published on the XRP Ledger, anchoring identity to a decentralized ledger.',
            },
            {
              icon: Shield,
              title: 'Verifiable Credentials (XLS-70d)',
              desc: 'Credentials issued on-chain by a trusted issuer. Anyone can verify without contacting the issuer.',
            },
            {
              icon: Cpu,
              title: 'TEE Attestation',
              desc: 'Tier 2+ agents prove what code they run via hardware-signed attestation (SGX, Nitro, TrustZone).',
            },
            {
              icon: Eye,
              title: 'Behavioral Monitoring',
              desc: 'Ongoing drift detection ensures agents behave consistently. Credentials auto-revoke on anomalies.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-2"
            >
              <div className="flex items-center gap-2">
                <item.icon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">{item.title}</h3>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-8 space-y-4 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold">Ready to get started?</h2>
        <p className="text-sm text-zinc-500">
          Install the openClaw skill or register manually — your choice.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Register Your Agent <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-medium"
          >
            <Database className="w-4 h-4" /> Browse Directory
          </Link>
        </div>
      </section>
    </div>
  );
}
