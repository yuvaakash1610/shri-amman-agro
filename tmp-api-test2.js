const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJ5dXZhYWthc2gxNkBnbWFpbC5jb20iLCJyb2xlIjoiU3RhZmYiLCJmdWxsTmFtZSI6Ill1dmFha2FzaCIsImlhdCI6MTc4NjI5NTU5MCwiZXhwIjoxNzg2Mjk5MTkwfQ.bI--FTPzANsVjXepM2M1Xk_6T4d3sUZN46p7QhYNl-w';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  // Test with the GSTIN from the screenshot (partially visible, starts with what looks like a GSTIN)
  const payload = {
    companyName: 'akash',
    contactPerson: 'Yuvaakash K',
    phone: '09994589432',
    email: 'yuvaakash16@gmail.com',
    address: 'Test Address',
    gstin: '1Z5' // partially visible from screenshot
  };

  console.log('Testing POST /api/companies...');
  const body = JSON.stringify(payload);
  const res = await request({
    hostname: 'localhost', port: 3000, path: '/api/companies', method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'Authorization': `Bearer ${token}`
    }
  }, body);
  
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(res.body, null, 2));

  // Try with empty gstin
  console.log('\nTesting with empty GSTIN...');
  const payload2 = { ...payload, gstin: '' };
  const body2 = JSON.stringify(payload2);
  const res2 = await request({
    hostname: 'localhost', port: 3000, path: '/api/companies', method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body2),
      'Authorization': `Bearer ${token}`
    }
  }, body2);
  
  console.log('Status:', res2.status);
  console.log('Response:', JSON.stringify(res2.body, null, 2));
}

run().catch(console.error);
