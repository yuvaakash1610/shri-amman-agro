const http = require('http');

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
  // Try login with known email
  const loginData = JSON.stringify({ email: 'yuvaakash16@gmail.com', password: 'password' });
  const loginRes = await request({
    hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
  }, loginData);
  
  console.log('Login status:', loginRes.status);
  console.log('Login body:', JSON.stringify(loginRes.body));
  
  if (!loginRes.body.token) {
    // Try with admin email
    const loginData2 = JSON.stringify({ email: 'admin@shriammanagro.com', password: 'admin123' });
    const loginRes2 = await request({
      hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData2) }
    }, loginData2);
    console.log('Admin Login status:', loginRes2.status);
    console.log('Admin Login body:', JSON.stringify(loginRes2.body));
    
    if (!loginRes2.body.token) {
      console.log('Cannot login. Please check credentials.');
      return;
    }
    
    const token = loginRes2.body.token;
    await testCompanyAdd(token);
    return;
  }
  
  await testCompanyAdd(loginRes.body.token);
}

async function testCompanyAdd(token) {
  console.log('\nTesting company add...');
  const companyData = JSON.stringify({
    companyName: 'akash', contactPerson: 'Yuvaakash K',
    phone: '09994589432', email: 'yuvaakash16@gmail.com',
    address: 'Test Address', gstin: '22AAAAA0000A1Z5'
  });
  
  const companyRes = await request({
    hostname: 'localhost', port: 3000, path: '/api/companies', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(companyData), 'Authorization': `Bearer ${token}` }
  }, companyData);
  
  console.log('Company add status:', companyRes.status);
  console.log('Company add body:', JSON.stringify(companyRes.body));
  
  // Try without GSTIN
  const companyData2 = JSON.stringify({
    companyName: 'akash', contactPerson: 'Yuvaakash K',
    phone: '09994589432', email: 'yuvaakash16@gmail.com',
    address: 'Test Address', gstin: ''
  });
  
  const companyRes2 = await request({
    hostname: 'localhost', port: 3000, path: '/api/companies', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(companyData2), 'Authorization': `Bearer ${token}` }
  }, companyData2);
  
  console.log('Company add (no GSTIN) status:', companyRes2.status);
  console.log('Company add (no GSTIN) body:', JSON.stringify(companyRes2.body));
}

run().catch(console.error);
