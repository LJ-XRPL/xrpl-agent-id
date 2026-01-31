// ============================================================
// XRPL Client & Transaction Helpers
// ============================================================

import { Client, Wallet, SubmittableTransaction } from 'xrpl';

const NETWORK =
  process.env.NEXT_PUBLIC_XRPL_NETWORK ||
  'wss://s.altnet.rippletest.net:51233';

let clientInstance: Client | null = null;

export async function getClient(): Promise<Client> {
  if (clientInstance?.isConnected()) return clientInstance;
  clientInstance = new Client(NETWORK);
  await clientInstance.connect();
  return clientInstance;
}

export async function disconnectClient(): Promise<void> {
  if (clientInstance?.isConnected()) {
    await clientInstance.disconnect();
    clientInstance = null;
  }
}

// ============================================================
// Wallet helpers
// ============================================================

export function generateWallet(): {
  address: string;
  publicKey: string;
  privateKey: string;
  seed: string;
} {
  const wallet = Wallet.generate();
  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
    seed: wallet.seed!,
  };
}

export function getIssuerWallet(): Wallet {
  const seed = process.env.ISSUER_SECRET;
  if (!seed) throw new Error('ISSUER_SECRET not configured');
  return Wallet.fromSeed(seed);
}

// ============================================================
// Testnet faucet
// ============================================================

export async function fundAccount(
  address: string
): Promise<{ success: boolean; balance?: string }> {
  try {
    const resp = await fetch(
      'https://faucet.altnet.rippletest.net/accounts',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: address }),
      }
    );
    if (!resp.ok) return { success: false };
    const data = await resp.json();
    return { success: true, balance: data.balance?.toString() };
  } catch {
    return { success: false };
  }
}

// ============================================================
// Account info
// ============================================================

export async function getAccountInfo(
  address: string
): Promise<{ exists: boolean; balance: string }> {
  const client = await getClient();
  try {
    const resp = await client.request({
      command: 'account_info',
      account: address,
    });
    return { exists: true, balance: resp.result.account_data.Balance };
  } catch (e: unknown) {
    const err = e as { data?: { error?: string } };
    if (err?.data?.error === 'actNotFound') return { exists: false, balance: '0' };
    throw e;
  }
}

// ============================================================
// DID transactions
// ============================================================

export async function submitDIDSet(
  wallet: Wallet,
  didDocument: string,
  uri: string
): Promise<{ success: boolean; hash?: string; error?: string }> {
  const client = await getClient();
  try {
    const tx: Record<string, unknown> = {
      TransactionType: 'DIDSet',
      Account: wallet.address,
      DIDDocument: Buffer.from(didDocument).toString('hex').toUpperCase(),
      URI: Buffer.from(uri).toString('hex').toUpperCase(),
    };
    const prepared = await client.autofill(tx as unknown as SubmittableTransaction);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    const meta = result.result.meta as Record<string, unknown> | undefined;
    return {
      success: meta?.TransactionResult === 'tesSUCCESS',
      hash: result.result.hash,
    };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

export async function resolveDID(
  address: string
): Promise<{ didDocument: string | null; uri: string | null } | null> {
  const client = await getClient();
  try {
    const resp = await client.request({
      command: 'account_objects',
      account: address,
      type: 'did' as never,
    });
    const objects = (resp.result as Record<string, unknown>).account_objects as
      | Array<Record<string, string>>
      | undefined;
    const didObj = objects?.[0];
    if (!didObj) return null;
    return {
      didDocument: didObj.DIDDocument
        ? Buffer.from(didObj.DIDDocument, 'hex').toString('utf-8')
        : null,
      uri: didObj.URI
        ? Buffer.from(didObj.URI, 'hex').toString('utf-8')
        : null,
    };
  } catch {
    return null;
  }
}

// ============================================================
// Credential transactions (XLS-70d)
// ============================================================

export async function submitCredentialCreate(
  issuerWallet: Wallet,
  subjectAddress: string,
  credentialType: string,
  uri: string
): Promise<{ success: boolean; hash?: string; error?: string }> {
  const client = await getClient();
  try {
    const tx: Record<string, unknown> = {
      TransactionType: 'CredentialCreate',
      Account: issuerWallet.address,
      Subject: subjectAddress,
      CredentialType: Buffer.from(credentialType).toString('hex').toUpperCase(),
      URI: Buffer.from(uri).toString('hex').toUpperCase(),
    };
    const prepared = await client.autofill(tx as unknown as SubmittableTransaction);
    const signed = issuerWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    const meta = result.result.meta as Record<string, unknown> | undefined;
    return {
      success: meta?.TransactionResult === 'tesSUCCESS',
      hash: result.result.hash,
    };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

export async function submitCredentialDelete(
  issuerWallet: Wallet,
  subjectAddress: string,
  credentialType: string
): Promise<{ success: boolean; hash?: string; error?: string }> {
  const client = await getClient();
  try {
    const tx: Record<string, unknown> = {
      TransactionType: 'CredentialDelete',
      Account: issuerWallet.address,
      Subject: subjectAddress,
      CredentialType: Buffer.from(credentialType).toString('hex').toUpperCase(),
    };
    const prepared = await client.autofill(tx as unknown as SubmittableTransaction);
    const signed = issuerWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);
    const meta = result.result.meta as Record<string, unknown> | undefined;
    return {
      success: meta?.TransactionResult === 'tesSUCCESS',
      hash: result.result.hash,
    };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}
