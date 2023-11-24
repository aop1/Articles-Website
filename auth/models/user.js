const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  username: String,
  salt: String, // Add a salt field
  hashedPassword: String, // Add a hashedPassword field
});

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hashedPassword = crypto.pbkdf2Sync(password, this.salt, 310000, 32, 'sha256').toString('hex');
};

UserSchema.methods.validatePassword = function (password) {
  const hashedPassword = crypto.pbkdf2Sync(password, this.salt, 310000, 32, 'sha256').toString('hex');
  return this.hashedPassword === hashedPassword;
};

module.exports = mongoose.model('User', UserSchema);