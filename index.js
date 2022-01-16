require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
app.use(express.json());
// routes
// registration

let refreshTokens = [];

// login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'didin' && password === '1234') {
    const accessToken = jwt.sign({ sub: username }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_TIME
    });
    const refreshToken = generateRefreshToken(username);
    return res.json({
      status: 'success',
      success: true,
      message: 'login successs',
      data: { accessToken, refreshToken }
    });
  }
  return res.status(401).json({ success: false, message: 'fail login', status: 'failed' });
});

app.post('/token/refresh', verifyRefreshToken, (req, res) => {
  const username = req.userData.sub;
  const accessToken = jwt.sign({ sub: username }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TIME
  });
  const refreshToken = generateRefreshToken(username);
  return res.json({
    status: 'success',
    success: true,
    message: 'login successs',
    data: { accessToken, refreshToken }
  });
});

// logout
app.get('/logout', verifyToken, (req, res) => {
  const username = req.userData.sub;
  refreshTokens = refreshTokens.filter((x) => x.username !== username);

  return res.json({
    status: 'success',
    success: true,
    message: 'Success logout'
  });
});

// dashboard
app.get('/dashboard', verifyToken, (req, res) => {
  return res.json({
    status: 'success',
    success: true,
    message: 'Hello from dashboard'
  });
});

// custom middleware
function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userData = decoded;
    next();
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
    let storedRefreshToken = refreshTokens.find((x) => x.username === decoded.sub);
    if (storedRefreshToken === undefined) {
      return res.status(401).json({
        status: 'failed',
        success: false,
        message: 'Invalid request, token is not stored'
      });
    }

    if (storedRefreshToken.token !== refreshToken) {
      return res.status(401).json({
        status: 'failed',
        success: false,
        message: 'Invalid request, token is not same in stored'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      status: 'failed',
      success: false,
      message: 'Your token is not valid.',
      data: error
    });
  }
}

function generateRefreshToken(username) {
  const refreshToken = jwt.sign({ sub: username }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_TIME
  });

  let storedRefreshToken = refreshTokens.find((x) => x.username === username);
  if (storedRefreshToken === undefined) {
    refreshTokens.push({
      username,
      token: refreshToken
    });
  } else {
    refreshTokens[refreshTokens.findIndex((x) => x.username === username)].token = refreshToken;
  }

  return refreshToken;
}

app.listen(3000, () => console.log('Server is running ...'));
