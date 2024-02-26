const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'resturant',
    password: 'office123',
    port: 6000,
    max:20000
  })
  module.exports = pool 

