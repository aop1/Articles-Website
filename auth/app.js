const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('express-flash');
const bodyParser = require('body-parser');  // req.body.username
const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/daily', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb://host.docker.internal:27017/daily', { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');  // res.render()

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(flash());
app.use(
    session({
      secret: 'your-secret-key',
      resave: false, // don't save session if unmodified
      saveUninitialized: false, // don't create session until something stored
      //saveUninitialized: true,
    })
  );

// ... Other middleware setup

// Create a User model (models/user.js)
const User = require('./models/user');

// Passport configuration
const passport = require('passport');
require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

// ... Other app configuration

// Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

app.use('/', indexRouter);
app.use('/users', usersRouter);

// ... Other route setup

app.listen(3001, () => {
  console.log('Server started on http://localhost:3001');
});