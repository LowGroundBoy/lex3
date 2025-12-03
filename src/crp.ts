import crypto from 'crypto';

const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log(sessionSecret);