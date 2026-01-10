
import dns from 'dns';

const hosts = [
    'db.cprjqulkssdnvxoankgz.supabase.co',
    'aws-0-us-east-1.pooler.supabase.com'
];

hosts.forEach(host => {
    dns.lookup(host, (err, address, family) => {
        if (err) {
            console.log(`Error resolving ${host}:`, err.message);
        } else {
            console.log(`Resolved ${host}: ${address} (IPv${family})`);
        }
    });
});
