const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const pool = require('../config/mysql2/connectionPool')
require('dotenv').config({ silent: true })

const sessionStore = new MySQLStore(
    {
        createDatabaseTable: true,
        useMysql2: true
    },
    pool
)

let SESSION_SECRET = null

if (process.env.dynamicSecret == 1) {
    SESSION_SECRET = process.env.secret + Date.now()
} else {
    SESSION_SECRET = process.env.secret
}

const sessionMiddleware = session(
    {
        secret: SESSION_SECRET,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60,
            httpOnly: true,
            secure: false
        },
        rolling: true
    }
)

module.exports = sessionMiddleware