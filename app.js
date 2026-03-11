require('dotenv').config({ silent: true })
const express = require('express')
const cors = require('cors')
const router = require('./route/route')
const authMiddleware = require('./middleware/auth')
const sessionMiddleware = require('./middleware/session');
const {createFormatRes} = require('./common/formatRes')

let app = express()

app.set('view engine', 'ejs')

// 动态 CORS 配置，支持带凭据的请求
app.use((req, res, next) => {
  const origin = req.headers.origin
  res.setHeader('Access-Control-Allow-Origin', origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, X-Total-Count')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  
  next()
})
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