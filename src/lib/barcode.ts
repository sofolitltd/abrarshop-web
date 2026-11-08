/**
 * Generates and validates EAN-13 barcode values for products.
 *
 * Codes start with "20" (the GS1 range reserved for in-store/internal use,
 * so generated codes never collide with real manufacturer barcodes), followed
 * by 10 random digits and a standard EAN-13 check digit. This keeps generated
 * codes scannable by any standard barcode scanner or phone camera.
 */

const PREFIX = '20';

function calculateEan13CheckDigit(digits12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = Number(digits12[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return (10 - (sum % 10)) % 10;
}

/** Creates a random, structurally-valid EAN-13 barcode value (13 digits). */
export function generateBarcodeValue(): string {
  let body = PREFIX;
  for (let i = 0; i < 10; i++) {
    body += Math.floor(Math.random() * 10).toString();
  }
  const checkDigit = calculateEan13CheckDigit(body);
  return body + checkDigit;
}

/** Verifies a barcode is 13 digits with a valid EAN-13 check digit. */
export function isValidEan13(value: string): boolean {
  if (!/^\d{13}$/.test(value)) return false;
  return calculateEan13CheckDigit(value.slice(0, 12)) === Number(value[12]);
}
