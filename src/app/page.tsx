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
          through fully automated verification. No human review. No gatekeepers.
          Just cryptographic proof.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
          >
            <UserPlus className="w-5 h-5" />
            Register Agent
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

      {/* How it works */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: UserPlus,
              title: '1. Register',
              desc: 'Create an XRPL account, publish a DID document, and expose a callback endpoint.',
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
