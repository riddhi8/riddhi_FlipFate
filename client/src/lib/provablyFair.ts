import { CoinChoice } from './types';

// Converts an ArrayBuffer to a hex string
export function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate random hex string for seeds
export function generateRandomHex(length: number = 32): string {
  if (typeof window === 'undefined' || !window.crypto) {
    return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
  const bytes = new Uint8Array(length / 2);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// SHA-256 hash a string
export async function sha256(message: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback hash implementation for SSR
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      hash = ((hash << 5) - hash) + message.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

// Calculate the provably fair outcome from serverSeed, clientSeed, and nonce
export async function calculateOutcome(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<{ outcome: CoinChoice; rawHash: string; numericValue: number }> {
  const combined = `${serverSeed}:${clientSeed}:${nonce}`;
  const rawHash = await sha256(combined);
  
  // Take first 8 chars of hash and convert to integer
  const subHex = rawHash.slice(0, 8);
  const numericValue = parseInt(subHex, 16);
  
  // 0 = SOLAR, 1 = LUNAR
  const isSolar = numericValue % 2 === 0;
  return {
    outcome: isSolar ? 'SOLAR' : 'LUNAR',
    rawHash,
    numericValue,
  };
}

// Verify a past game
export async function verifyFlip(
  serverSeed: string,
  serverSeedHash: string,
  clientSeed: string,
  nonce: number
): Promise<{ validHash: boolean; calculatedOutcome: CoinChoice; rawHash: string }> {
  const calculatedHash = await sha256(serverSeed);
  const validHash = calculatedHash.toLowerCase() === serverSeedHash.toLowerCase();
  
  const { outcome, rawHash } = await calculateOutcome(serverSeed, clientSeed, nonce);
  return {
    validHash,
    calculatedOutcome: outcome,
    rawHash,
  };
}
