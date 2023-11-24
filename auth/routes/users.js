const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');
const User = require('../models/user');

// Register
router.get('/register', (req, res) => {
  console.log('Get /users/register');
  const filePath = path.join(__dirname, '../views/register.html');
  res.sendFile(filePath);
});

router.post('/register', (req, res) => {
  console.log(req.body.username);
  const newUser = new User({ username: req.body.username });
  newUser.setPassword(req.body.password);

  newUser.save()
    .then(() => {
      res.redirect('/users/login');
    })
    .catch(err => {
      // Handle the error, e.g., by redirecting to an error page or rendering a message.
      console.error(err);
      // Add error handling logic here
    });
});

// Login
router.get('/login', (req, res) => {
  const filePath = path.join(__dirname, '../views/login.html');
  res.sendFile(filePath);
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  })
);

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
