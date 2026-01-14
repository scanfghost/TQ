const mysql = require('mysql2/promise')

const pool = mysql.createPool(
    {
        host: "localhost",
        user: "www.TQ.org",
        password: "sjk1234",
        database: "TQ",
        connectionLimit: 10
    }
)

module.exports = pool