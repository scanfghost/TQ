const publicPaths = ['/', '/login']

function auth(req, res, next) {
    if (publicPaths.includes(req.url) || req.session.user) {
        return next()
    }
    res.redirect('/')
}

module.exports = {
    auth,
}