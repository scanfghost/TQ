require('dotenv').config({ silent: true })
const express = require('express')
const cors = require('cors')
const router = require('./route/route')
const authMiddleware = require('./middleware/auth')
const sessionMiddleware = require('./middleware/session');
const {createFormatRes} = require('./common/formatRes')

let app = express()

app.set('view engine', 'ejs')

// 精确的本机 CORS 配置
const corsOptions = {
  origin: [
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  credentials: true,              
}
app.use(cors(corsOptions))
app.use(express.static('./public'))
app.use(express.json())
app.use(sessionMiddleware);
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