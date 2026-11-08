// One-off migration: generates a unique EAN-13 barcode for every existing
// product that doesn't have one yet. Run with `npm run db:backfill-barcodes`
// after the `barcode` column has been added to the database (`npm run db:push`).
import 'dotenv/config';
import { Pool } from 'pg';

const PREFIX = '20';

function calculateEan13CheckDigit(digits12) {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = Number(digits12[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return (10 - (sum % 10)) % 10;
}

function generateBarcodeValue() {
  let body = PREFIX;
  for (let i = 0; i < 10; i++) {
    body += Math.floor(Math.random() * 10).toString();
  }
  return body + calculateEan13CheckDigit(body);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const { rows: existingBarcodeRows } = await pool.query(
      `SELECT barcode FROM products WHERE barcode IS NOT NULL`
    );
    const usedBarcodes = new Set(existingBarcodeRows.map((r) => r.barcode));

    const { rows: productsToUpdate } = await pool.query(
      `SELECT id, name FROM products WHERE barcode IS NULL`
    );

    console.log(`Found ${productsToUpdate.length} product(s) without a barcode.`);

    for (const product of productsToUpdate) {
      let code = generateBarcodeValue();
      while (usedBarcodes.has(code)) {
        code = generateBarcodeValue();
      }
      usedBarcodes.add(code);

      await pool.query(`UPDATE products SET barcode = $1 WHERE id = $2`, [code, product.id]);
      console.log(`  ${product.id}  ${product.name}  ->  ${code}`);
    }

    console.log('Backfill complete.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
