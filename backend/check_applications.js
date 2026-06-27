import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:34j1b@db.adyqoqytnetghyhzodjs.supabase.co:5432/postgres';

async function main() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query('SELECT id, full_name, created_at, status FROM loan_applications ORDER BY created_at DESC');
    console.log(`Found ${res.rows.length} applications in the database:`);
    console.log(res.rows);
  } catch (err) {
    console.error('Error fetching applications:', err);
  } finally {
    await client.end();
  }
}

main();
