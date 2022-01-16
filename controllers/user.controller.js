const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const redisClient = require('../redis');

async function register(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  try {
    const saveUser = await user.save();
    res.status(201).json({ success: true, message: 'Registered successfully.', data: saveUser });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Fail registration', error });
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password }).exec();
    if (user === null) {
      return res
        .status(401)
        .json({ success: false, message: 'Username or password is not valid', status: 'failed' });
    }

    const accessToken = jwt.sign({ sub: user._id }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_TIME
    });
    ``;
    const refreshToken = generateRefreshToken(user._id);
    return res.json({
      status: 'success',
      success: true,
      message: 'login successs',
      data: { accessToken, refreshToken }
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'fail login', status: 'failed', error });
  }
}
async function logout(req, res) {
  const userId = req.userData.sub;

  // remove refresh token
  await redisClient.del(userId);

  // blacklist current access token
  await redisClient.set(`BL_${userId.toString()}`, req.token);
  return res.json({
    status: 'success',
    success: true,
    message: 'Success logout'
  });
}

function generateRefreshToken(userId) {
  const refreshToken = jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_TIME
  });

  redisClient.get(userId.toString(), (err, data) => {
    if (err) throw err;

    redisClient.set(userId.toString(), JSON.stringify({ token: refreshToken }));
  });

  return refreshToken;
}

function getAccessToken(req, res) {
  const userId = req.userData.sub;
  const accessToken = jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TIME
  });
  const refreshToken = generateRefreshToken(userId);
  return res.json({
    status: 'success',
    success: true,
    message: 'login successs',
    data: { accessToken, refreshToken }
  });
}

module.exports = {
  register,
  login,
  logout,
  getAccessToken
};
