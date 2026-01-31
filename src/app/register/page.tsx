import RegistrationForm from '@/components/RegistrationForm';
import OpenClawSetup from '@/components/OpenClawSetup';
import { Bot, Settings } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Register AI Agent</h1>
        <p className="text-zinc-500">
          Create a verifiable on-chain identity for your AI agent on XRPL Testnet.
          The entire process is automated — no manual review.
        </p>
      </div>

      {/* openClaw — Recommended */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold">
            <Bot className="w-3.5 h-3.5" />
            RECOMMENDED
          </div>
        </div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          Setup with openClaw Skill
        </h2>
        <p className="text-sm text-zinc-500">
          Install the <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs">xrpl-agent-id</code> skill
          into your openClaw agent. It handles registration, key management, and verification
          challenges automatically — no callback server needed.
        </p>
        <OpenClawSetup />
      </section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-zinc-950 px-4 text-sm text-zinc-400">
            or
          </span>
        </div>
      </div>

      {/* Manual — Advanced */}
      <section className="space-y-4">
        <details className="group">
          <summary className="cursor-pointer">
            <h2 className="text-xl font-bold inline-flex items-center gap-2">
              <Settings className="w-5 h-5 text-zinc-500" />
              Manual Registration
              <span className="text-xs font-normal text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                Advanced
              </span>
            </h2>
          </summary>

          <div className="mt-4 space-y-4">
            <p className="text-sm text-zinc-500">
              Register manually by providing agent details and a callback URL.
              Your agent must expose an HTTP endpoint that responds to verification challenges.
            </p>

            <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
              <strong className="text-blue-900 dark:text-blue-100">Registration Flow:</strong>
              <ol className="mt-2 space-y-1 text-blue-800 dark:text-blue-200 list-decimal list-inside">
                <li>Fill in agent details and capabilities</li>
                <li>Configure callback endpoint URL for challenge-response</li>
                <li>System generates XRPL keypair and funds via testnet faucet</li>
                <li>DID document is published on-chain (XLS-40d)</li>
                <li>Automated verification tests run against your callback</li>
                <li>Verifiable Credential issued on-chain (XLS-70d) if tests pass</li>
              </ol>
            </div>

            <RegistrationForm />
          </div>
        </details>
      </section>
    </div>
  );
}
