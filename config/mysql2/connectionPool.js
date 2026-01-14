const mysql = require('mysql2/promise')

const pool = mysql.createPool(
    {
        host: "localhost",
        user: "TQ",
        password: "sjk1234",
        database: "tq",
        connectionLimit: 10,
        port: 3308
    }
)

module.exports = pool