// ============================================================
// DID Document Operations
// ============================================================

import { DIDDocument } from './types';

export function createDIDDocument(
  address: string,
  publicKey: string,
  metadata: {
    name: string;
    description: string;
    modelType: string;
    capabilities: string[];
    owner: string;
    callbackUrl: string;
    environmentalFingerprint?: string;
  }
): DIDDocument {
  const did = `did:xrpl:testnet:${address}`;
  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1',
    ],
    id: did,
    controller: did,
    verificationMethod: [
      {
        id: `${did}#key-1`,
        type: 'EcdsaSecp256k1VerificationKey2019',
        controller: did,
        publicKeyHex: publicKey,
      },
    ],
    authentication: [`${did}#key-1`],
    assertionMethod: [`${did}#key-1`],
    service: [
      {
        id: `${did}#agent-metadata`,
        type: 'AgentMetadata',
        serviceEndpoint: `data:application/json;base64,${Buffer.from(
          JSON.stringify({
            name: metadata.name,
            description: metadata.description,
            modelType: metadata.modelType,
            capabilities: metadata.capabilities,
            owner: metadata.owner,
          })
        ).toString('base64')}`,
      },
      {
        id: `${did}#callback`,
        type: 'AgentCallback',
        serviceEndpoint: metadata.callbackUrl,
      },
      ...(metadata.environmentalFingerprint
        ? [
            {
              id: `${did}#env-fingerprint`,
              type: 'EnvironmentalFingerprint',
              serviceEndpoint: `hash:sha256:${metadata.environmentalFingerprint}`,
            },
          ]
        : []),
    ],
  };
}

export function parseDIDDocument(raw: string): DIDDocument | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function validateDIDDocument(doc: DIDDocument): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  if (!doc['@context']?.includes('https://www.w3.org/ns/did/v1'))
    issues.push('Missing W3C DID context');
  if (!doc.id?.startsWith('did:xrpl:')) issues.push('Invalid DID format');
  if (!doc.verificationMethod?.length) issues.push('No verification methods');
  if (!doc.authentication?.length) issues.push('No authentication methods');

  doc.verificationMethod?.forEach((vm, i) => {
    if (!vm.publicKeyHex)
      issues.push(`Verification method ${i} missing public key`);
    if (!vm.controller)
      issues.push(`Verification method ${i} missing controller`);
  });

  return { valid: issues.length === 0, issues };
}

export function extractMetadataFromDID(
  doc: DIDDocument
): Record<string, unknown> | null {
  const svc = doc.service?.find((s) => s.type === 'AgentMetadata');
  if (!svc) return null;
  try {
    const prefix = 'data:application/json;base64,';
    if (svc.serviceEndpoint.startsWith(prefix)) {
      const b64 = svc.serviceEndpoint.slice(prefix.length);
      return JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));
    }
    return JSON.parse(svc.serviceEndpoint);
  } catch {
    return null;
  }
}
