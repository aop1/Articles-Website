const express = require('express');
const router = express.Router();
const path = require('path');

// Welcome (authenticated route)
router.get('', (req, res) => {
  if (req.isAuthenticated()) {
  //if (req.user) {
    console.log(req.user.username)
    res.render('welcome', { username: req.user.username });
  } else {
    //const filePath = path.join(__dirname, '../views/register.html');
    const filePath = path.join(__dirname, '../views/index.html');
    res.sendFile(filePath);
  }
});

// router.get('/', (req, res) => {
//   if (req.isAuthenticated()) {
//     res.send('Welcome to the dashboard!');
//   } else {
//     res.redirect('/login');
//   }
// });

module.exports = router;
