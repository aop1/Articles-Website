// article/app.js
const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const axios = require('axios');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const articlesRouter = require('./routes/articles');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://host.docker.internal:27017/daily', { useNewUrlParser: true, useUnifiedTopology: true });

// Set EJS as the view engine
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(cookieParser());

// // Middleware to handle user authentication (replace with your actual authentication logic)
// app.use((req, res, next) => {
//   // Check user authentication, set req.user if authenticated
//   // ...

//   next();
// });

const session = require('express-session');
app.use(session({
  secret: 'your-session-secret', // Replace with a secure secret
  resave: false,
  saveUninitialized: true,
}));

// const jwt = require('jsonwebtoken');

// async function authenticateToken(req, res, next) {
//   // const token = req.headers['authorization'];
//   const token = req.session.token;
//   response = await axios.post('http://host.docker.internal:3001/users/authenticateToken', {token: token});
//   req.user = response.data.user;
//   next();

//   // if (!token) {
//   //   return res.status(401).json({ success: false, message: 'Unauthorized' });
//   // }

//   // jwt.verify(token, 'your-secret-key', (err, user) => {
//   //   if (err) {
//   //     return res.status(403).json({ success: false, message: 'Forbidden' });
//   //   }

//   //   req.user = user;
//   //   next();
//   // });
// }

// // Use the middleware in routes that require authentication
// app.get('/protected-route', authenticateToken, (req, res) => {
//   // Only authenticated and authorized users can access this route
//   res.json({ success: true, user: req.user });
// });


// Mount the indexRouter for the root path '/'
// app.use('', indexRouter);
app.use('', usersRouter);

app.use('', indexRouter);

const authenticateToken = require('./middleware/authenticate');
// // Middleware to handle user authentication
app.use(authenticateToken);

app.use('', articlesRouter);

// Other routes go here...

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});