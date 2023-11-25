// article/routes/users.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Render the register page
router.get('/register', async (req, res) => {
    try {
        res.render('register');
    } catch (error) {
        console.error('Error rendering register page:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/register', async (req, res) => {
    try {
        // console.log(req.body.username);
        const data = {username: req.body.username, password: req.body.password};
        // console.log(req.body);
        // console.log(data);
        // console.log('\n\n\n\n\n');
        response = await axios.post('http://host.docker.internal:3001/users/register', data);
        if (response.data.success) res.redirect('/login');
        else res.redirect('/register');
      } catch (error) {
        console.error('Error registering user:', error);
        res.redirect('/register');
      }
})

// Render the login page
router.get('/login', async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.error('Error rendering login page:', error);
        res.status(500).send('Internal Server Error');
    }
});

// router.post('/login', async (req, res) => {
//     try {
//         data = {username: req.body.username, password: req.body.password}
//         console.log(req.body);
//         console.log(data);
//         response = await axios.post('http://host.docker.internal:3001/users/login', data);
//         if (response.data.success) res.redirect('/');
//         else res.redirect('/login')
//       } catch (error) {
//         console.error('Error logging in:', error);
//         res.redirect('/login')
//       }

// })

router.post('/login', async (req, res) => {
    try {
      // Make a request to the auth container to log in
      const authResponse = await axios.post('http://host.docker.internal:3001/users/login', req.body);
  
      // Check if the login was successful and retrieve the JWT
      if (authResponse.data.success) {
        const token = authResponse.data.token;
        // Store the token in the session
        req.session.token = token;
        // req.session.role = 'reader';
        res.redirect('/reader');
      } else {
        // res.json({ success: false });
        res.redirect('/login');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      res.redirect('/login');
      // res.json({ success: false });
    }
  });

router.get('/logout', (req, res) => {
  req.session.token = 'defaut-token-value';
  req.user = null;
  res.redirect('/');
});

module.exports = router;