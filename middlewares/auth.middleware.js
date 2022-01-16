const jwt = require('jsonwebtoken');
const redisClient = require('../redis');

function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.token = token;
    req.userData = decoded;

    // verify blacklist access token

    redisClient.get(`BL_${decoded.sub.toString()}`, (err, data) => {
      if (err) throw err;

      if (data === token) {
        return res.status(401).json({
          status: 'failed',
          success: false,
          message: 'Blacklisted token'
        });
      }

      next();
    });
  } catch (error) {
    return res.status(401).json({
      status: 'failed',
      success: false,
      message: 'Your token is not valid.',
      data: error
    });
  }
}

function verifyRefreshToken(req, res, next) {
  const refreshToken = req.body.refreshToken;

  if (refreshToken === null) {
    return res.status(401).json({
      status: 'failed',
      success: false,
      message: 'Invalid request'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    req.userData = decoded;

    // verify if token is in store or not
    redisClient.get(decoded.sub.toString(), (err, data) => {
      if (err) throw err;

      if (data === null) {
        return res.status(401).json({
          status: 'failed',
          success: false,
          message: 'Invalid request, token is not stored'
        });
      }

      if (JSON.parse(data).token !== refreshToken) {
        return res.status(401).json({
          status: 'failed',
          success: false,
          message: 'Invalid request, token is not same in stored'
        });
      }

      next();
    });
  } catch (error) {
    return res.status(401).json({
      status: 'failed',
      success: false,
      message: 'Your token is not valid.',
      data: error
    });
  }
}

module.exports = {
  verifyRefreshToken,
  verifyToken
};
