const nacl = require('tweetnacl');
const bs58Pkg = require('bs58');
const bs58 = bs58Pkg.default || bs58Pkg;
const jwt = require('jsonwebtoken');

console.log('nacl:', typeof nacl);
console.log('bs58:', typeof bs58);
console.log('bs58.decode:', typeof bs58.decode);
console.log('jwt:', typeof jwt);
