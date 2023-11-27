// auth/routes/users.js

const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Endpoint to check authentication status
router.post('/authenticateToken', (req, res) => {
  const token = req.body.token;
  if (!token) {
    // return res.status(401).json({ success: false, message: 'Unauthorized' });
    res.json({ success: false, message: 'Unauthorized' });
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      // res.status(403).json({ success: false, message: 'Forbidden' });
      console.log(err);
      return res.json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, user: user });
  });
});
// router.get('/checkAuthentication', (req, res) => {
//   const isAuthenticated = req.isAuthenticated();
//   const responseData = {
//     isAuthenticated,
//     user: isAuthenticated ? req.user : null,
//   };

//   res.json(responseData);
// });

// Register
// router.get('/register', (req, res) => {
//   console.log('Get /users/register');
//   const filePath = path.join(__dirname, '../views/register.html');
//   res.sendFile(filePath);
// });

router.post('/register', async (req, res) => {
  // console.log(req.body.username);
  const existingUser = await User.findOne({ username: req.body.username });
  if (existingUser) return res.json({success: false});
  const newUser = new User({ username: req.body.username });
  newUser.setPassword(req.body.password);

  newUser.save()
    .then(() => {
      // res.redirect('/users/login');
      res.json({success: true});
    })
    .catch(err => {
      // Handle the error, e.g., by redirecting to an error page or rendering a message.
      console.error(err);
      res.json({success: false});
      // Add error handling logic here
    });
});

// // Login
// router.get('/login', (req, res) => {
//   const filePath = path.join(__dirname, '../views/login.html');
//   res.sendFile(filePath);
// });

// router.post(
//   '/login',
//   passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/users/login',
//     failureFlash: true,
//   })
// );

// Endpoint to handle login and issue a JWT upon success
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const user = { id: req.user._id, username: req.user.username };

  // Create a JWT token and send it back to the article container
  const token = jwt.sign(user, 'your-secret-key');
  res.json({ success: true, token });
});

// Logout
// router.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// });

module.exports = router;
