const route = require('express').Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

route.post('/register', userController.register);
route.post('/login', userController.login);
route.post('/token/refresh', authMiddleware.verifyRefreshToken, userController.getAccessToken);
route.get('/logout', authMiddleware.verifyToken, userController.logout);

module.exports = route;
