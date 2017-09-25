'use strict';

require('dotenv').config(); // this is unconditional, which will require heroku to install it (which is not needed), but since it is listed in core dependencies, it at least won't break heroku. Later learn to do it conditionally.

exports.DATABASE_URL =
    process.env.DATABASE_URL ||
    global.DATABASE_URL ||
    'mongodb://localhost/music-app';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
console.log('process.env', process.env);
console.log('secret ', process.env.JWT_SECRET);
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
