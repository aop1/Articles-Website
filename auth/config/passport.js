const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = (passport) => {
  passport.use(
    new LocalStrategy((username, password, done) => {
      User.findOne({ username: username })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: 'Incorrect username' });
            //return done(null, false);
          }

          //if (user.password !== password) {
          if (!user.validatePassword(password)) {
            return done(null, false, { message: 'Incorrect password' });
            //return done(null, false);
          }

          return done(null, user);
        })
        .catch((err) => {
          return done(err);
        });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
  });
};