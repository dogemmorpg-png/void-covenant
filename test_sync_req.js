const handler = require('./dist-test/sync.js').default;
const req = {
  method: 'POST',
  headers: {
    authorization: 'Bearer invalid_token'
  },
  body: {}
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
