const { createFormatRes } = require('../common/formatRes')

const publicPaths = ['/', '/login']
const adminPrefixes = ['/upload', '/admin']

function auth(req, res, next) {
    if (publicPaths.includes(req.url) || req.session.user) {
        return next()
    }
    res.redirect('/')
}

function adminOnly(req, res, next) {
    var formatRes = createFormatRes()
    const isAdminPath = adminPrefixes.some(prefix => req.path.startsWith(prefix))
    if (isAdminPath && req.session.user.role !== 'admin') {
        formatRes.errMsg = '权限不足'
        return res.status(403).json(formatRes)
    }

    return next()
}

module.exports = {
    auth,
    adminOnly
}