import RegistrationForm from '@/components/RegistrationForm';

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
  );
}
