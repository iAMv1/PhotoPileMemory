
fetch('http://localhost:5000/api/time-capsule-messages/current')
    .then(res => res.json())
    .then(data => console.log('API Response:', JSON.stringify(data, null, 2)))
    .catch(err => console.error('Verification Error:', err.message));
