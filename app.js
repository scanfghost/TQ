require('dotenv').config({ silent: true })
var express = require('express')
var mongoose = require('mongoose')
var router = require('./route/route')
var session = require('express-session')
var MongoStore = require('connect-mongo');
const authMiddleware = require('./middleware/auth')

mongoose.connect(process.env.remoteUrl)
    .then(() => {
        console.log('✅ MongoDB 连接成功');
    })
    .catch(err => {
        console.error('❌ MongoDB 连接失败:', err.message);
    });

const sessionStore = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: 'session',
    ttl: 60 * 60,
    autoRemove: 'native'
});

var app = express()

app.set('view engine', 'ejs')

app.use(express.static('./public'))
app.use(express.json())
const SESSION_SECRET = process.env.secret + Date.now()
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
        secure: false
    }
}))
app.use(authMiddleware.auth)
app.use('/', router)

app.listen(process.env.port)
console.log('NEMTQ listening to localhost port 3000')