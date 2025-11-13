require('dotenv').config({ silent: true })
var express = require('express')
var mongoose = require('mongoose')
var router = require('./route/route')
var session = require('express-session')
var MongoStore = require('connect-mongo');
const authMiddleware = require('./middleware/auth')
const {createFormatRes} = require('./common/formatRes')

if (process.env.nativeDB == 1) {
    mongoose.connect(process.env.nativeUrl)
    .then(() => {
        console.log('✅ 本地MongoDB 连接成功');
    })
    .catch(err => {
        console.error('❌ MongoDB 连接失败:', err.message);
    });
} else {
    mongoose.connect(process.env.remoteUrl)
    .then(() => {
        console.log('✅ 远程MongoDB 连接成功');
    })
    .catch(err => {
        console.error('❌ MongoDB 连接失败:', err.message);
    });
}


const sessionStore = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: 'session',
    ttl: 60 * 60,
    autoRemove: 'native'
});

var app = express()

app.set('view engine', 'ejs')

app.use(express.static('./public'))

var SESSION_SECRET = null

if (process.env.dynamicSecret == 1) {
    SESSION_SECRET = process.env.secret + Date.now()
} else {
    SESSION_SECRET = process.env.secret
}

app.use(express.json())

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
app.use(authMiddleware.adminOnly)
app.use('/', router)
app.use((err, req, res, next) => {
    var formatRes = createFormatRes()
    if (err) {
        formatRes.errMsg = err.message
      return res.status(400).json(formatRes)
    }
    next()
  })

app.listen(process.env.port)
console.log('NEMTQ listening to localhost port 3000')