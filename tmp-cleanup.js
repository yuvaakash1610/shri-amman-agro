const db = require('./backend/config/db');
db.query("DELETE FROM companies WHERE company_name IN ('akash', 'akash2')")
  .then(r => { console.log('Cleaned:', r.rowCount, 'rows'); process.exit(0); })
  .catch(e => { console.error(e.message); process.exit(1); });
