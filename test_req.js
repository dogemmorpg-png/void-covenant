const handler = require('./dist-test/auth.js').default;
const req = {
  method: 'POST',
  body: {
    publicKey: '5U3bH5b6QuDtTf',
    signature: '5U3bH5b6QuDtTf5U3bH5b6QuDtTf5U3bH5b6QuDtTf',
    message: 'test message'
  }
};
const res = {
  setHeader: () => {},
  status: (code) => {
    return {
      json: (data) => console.log('STATUS:', code, data)
    };
  }
};
handler(req, res);
