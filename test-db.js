
import pkg from 'pg';
const { Pool } = pkg;

const connectionString = 'postgresql://app_user.cprjqulkssdnvxoankgz:' + encodeURIComponent('NewStrongPass123!') + '@aws-0-us-east-1.pooler.supabase.com:5432/postgres';

console.log('Testing connection to:', connectionString.replace(/:[^:@]*@/, ':****@'));

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Connection Error:', err.message);
        if (err.code) console.error('Code:', err.code);
    } else {
        console.log('Success! Time:', res.rows[0].now);
    }
    pool.end();
});
