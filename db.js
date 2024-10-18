// db.js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',         // Replace with your PostgreSQL username
    host: 'localhost',
    database: 'nutrition', // Replace with the name of your database
    password: 'fldskghjlsdkfghj',   // Replace with your PostgreSQL password
    port: 5432,                     // Default PostgreSQL port
});

module.exports = pool;
