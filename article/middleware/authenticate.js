// article/middleware/authenticate.js

const axios = require('axios');

async function authenticateToken(req, res, next) {
  // const token = req.headers['authorization'];
  const token = req.session.token || 'default-token-value';
  response = await axios.post('http://host.docker.internal:3001/users/authenticateToken', {token: token});
  if (response.data.success) {
    req.user = response.data.user;
    next();
  }
  else {
    res.redirect('/login');
  }
  // next();
}

module.exports = authenticateToken;