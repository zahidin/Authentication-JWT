const route = require('express').Router();
const authMiddleware = require('../middlewares/auth.middleware');

route.get('/dashboard', authMiddleware.verifyToken, (req, res) => {
  return res.json({
    status: 'success',
    success: true,
    message: 'Hello from dashboard'
  });
});

module.exports = route;
