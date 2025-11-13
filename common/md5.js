const crypto = require('crypto')

function md5(str, truncateLength = -1) {
  const result = crypto.createHash('md5').update(str, 'utf8').digest('hex')
  if (truncateLength > 0 && truncateLength <= 32) {
    result.substring(0, truncateLength)
  }
  return result
}

module.exports = {
  md5
}