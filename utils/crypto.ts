/**
 * Cryptographically secure random number utilities
 */

/**
 * Generates a cryptographically secure random number between 0 and 1
 * @returns A random number in the range [0, 1)
 */
export function getSecureRandom(): number {
  const buffer = new Uint8Array(4);
  crypto.getRandomValues(buffer);
  const value = new DataView(buffer.buffer).getUint32(0);
  return value / 0xFFFFFFFF;
}

/**
 * Generates a cryptographically secure random ID
 * @returns A 32-character hexadecimal string
 */
export function generateSecureId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a cryptographically secure seed
 * @returns A base64-encoded random seed
 */
export function generateSecureSeed(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}
