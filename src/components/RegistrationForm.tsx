'use client';

import { useState } from 'react';
import {
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface WalletInfo {
  address: string;
  publicKey: string;
  seed: string;
}

interface StepResult {
  label: string;
  status: 'pending' | 'running' | 'done' | 'error';
  detail?: string;
  txHash?: string;
}

const MODEL_TYPES = [
  'GPT-4',
  'GPT-4o',
  'Claude 3.5 Sonnet',
  'Claude 3 Opus',
  'Llama 3',
  'Mistral',
  'Gemini Pro',
  'Custom / Other',
];

const CAPABILITY_OPTIONS = [
  'text-generation',
  'code-generation',
  'image-analysis',
  'function-calling',
  'web-browsing',
  'file-processing',
  'multi-modal',
  'autonomous-actions',
  'financial-operations',
  'data-analysis',
];

export default function RegistrationForm() {
  const [step, setStep] = useState(0);

  // Step 0: Agent details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modelType, setModelType] = useState('');
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [owner, setOwner] = useState('');

  // Step 1: Callback URL
  const [callbackUrl, setCallbackUrl] = useState('');

  // Step 2+: Results
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [steps, setSteps] = useState<StepResult[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [agentAddress, setAgentAddress] = useState('');

  const toggleCapability = (cap: string) => {
    setCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const canProceedStep0 = name && description && modelType && owner;
  const canProceedStep1 = callbackUrl;

  const startRegistration = async () => {
    setIsRegistering(true);
    setError('');
    setSteps([
      { label: 'Generate XRPL keypair', status: 'running' },
      { label: 'Fund account via testnet faucet', status: 'pending' },
      { label: 'Publish DID document on-chain', status: 'pending' },
      { label: 'Run verification tests', status: 'pending' },
      { label: 'Issue credential', status: 'pending' },
    ]);

    try {
      const resp = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          modelType,
          capabilities,
          owner,
          callbackUrl,
        }),
      });

      // Read the streaming response
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const event = JSON.parse(line);
              if (event.type === 'step') {
                setSteps((prev) => {
                  const updated = [...prev];
                  if (event.index < updated.length) {
                    updated[event.index] = {
                      ...updated[event.index],
                      status: event.status,
                      detail: event.detail,
                      txHash: event.txHash,
                    };
                  }
                  // Set next step to running
                  if (
                    event.status === 'done' &&
                    event.index + 1 < updated.length
                  ) {
                    updated[event.index + 1] = {
                      ...updated[event.index + 1],
                      status: 'running',
                    };
                  }
                  return updated;
                });
              } else if (event.type === 'wallet') {
                setWallet(event.wallet);
              } else if (event.type === 'complete') {
                setAgentAddress(event.address);
              } else if (event.type === 'error') {
                setError(event.message);
              }
            } catch {
              // ignore parse errors from partial lines
            }
          }
        }
      }

      if (!resp.ok && !error) {
        setError('Registration failed. Please try again.');
      }
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setIsRegistering(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {['Agent Details', 'Callback URL', 'Registration'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i < step
                  ? 'bg-green-500 text-white'
                  : i === step
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span
              className={`text-sm font-medium ${
                i <= step
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-400'
              }`}
            >
              {label}
            </span>
            {i < 2 && (
              <div className="w-8 h-px bg-zinc-300 dark:bg-zinc-700" />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Agent details */}
      {step === 0 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-sm font-medium mb-1">Agent Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., TradingBot Alpha"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this agent do?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model Type *</label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
            >
              <option value="">Select model…</option>
              {MODEL_TYPES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Owner / Organization *</label>
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Your name or org"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Capabilities</label>
            <div className="flex flex-wrap gap-2">
              {CAPABILITY_OPTIONS.map((cap) => (
                <button
                  key={cap}
                  onClick={() => toggleCapability(cap)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    capabilities.includes(cap)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setStep(1)}
            disabled={!canProceedStep0}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium ml-auto"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 1: Callback URL */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm">
            <strong>Callback Endpoint Requirements:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside text-blue-800 dark:text-blue-300">
              <li>Must accept POST requests with JSON body</li>
              <li>Must respond within 500ms</li>
              <li>Must echo back challenge data in the response</li>
              <li>Used for automated verification — no human in the loop</li>
            </ul>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Callback URL *
            </label>
            <input
              value={callbackUrl}
              onChange={(e) => setCallbackUrl(e.target.value)}
              placeholder="https://your-agent.example.com/challenge"
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
            />
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => {
                setStep(2);
                startRegistration();
              }}
              disabled={!canProceedStep1}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
            >
              Register Agent <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Registration progress */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          {/* Steps progress */}
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800"
              >
                {s.status === 'running' ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
                ) : s.status === 'done' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : s.status === 'error' ? (
                  <span className="w-5 h-5 text-red-500 flex-shrink-0">✗</span>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{s.label}</p>
                  {s.detail && (
                    <p className="text-xs text-zinc-500 truncate">{s.detail}</p>
                  )}
                </div>
                {s.txHash && (
                  <a
                    href={`https://testnet.xrpl.org/transactions/${s.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center gap-0.5"
                  >
                    TX <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Wallet info */}
          {wallet && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 space-y-2">
              <h4 className="font-semibold text-green-800 dark:text-green-300">
                🔐 XRPL Account Created
              </h4>
              <p className="text-xs text-green-700 dark:text-green-400">
                Save your seed — it won&apos;t be shown again!
              </p>
              {[
                { label: 'Address', value: wallet.address },
                { label: 'Public Key', value: wallet.publicKey },
                { label: 'Seed', value: wallet.seed },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-700 dark:text-green-400 w-20">
                    {label}:
                  </span>
                  <code className="text-xs font-mono bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded flex-1 truncate">
                    {value}
                  </code>
                  <button
                    onClick={() => copyToClipboard(value)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Agent address result */}
          {agentAddress && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                ✅ Agent registered successfully!
              </p>
              <a
                href={`/agent/${agentAddress}`}
                className="text-sm text-blue-600 hover:underline mt-1 inline-block"
              >
                View agent profile →
              </a>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
