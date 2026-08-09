const controller = require('./backend/controllers/customerController');

const req = {
  params: { id: '1' },
  body: {
    customerName: 'Ravi Kumar Updated',
    phoneNumber: '9876543211',
    aadhaarNumber: '123412341234',
    address: 'Village Markapur Updated',
    customerType: 'Farmer',
    email: 'ravi@example.com'
  }
};

const res = {
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    console.log('status', this.statusCode);
    console.log(JSON.stringify(payload));
  },
  send(payload) {
    console.log(payload);
  }
};

controller.updateCustomer(req, res).then(() => {}).catch((err) => {
  console.error(err);
});
