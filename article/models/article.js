const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema (Assuming you have an existing User model)
// const userSchema = new Schema({
//   // Your user schema fields here
//   // ...
// });

// Comment Schema
const commentSchema = new Schema({
  comment: {
    type: String,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  }
});

// Article Schema
const articleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  teaser: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  dateLastEdited: {
    type: Date,
    default: Date.now
  },
  categories: {
    type: [String],
    default: []
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  comments: {
    type: [commentSchema],
    default: []
  }
});

// Create models
const Article = mongoose.model('Article', articleSchema);
const Comment = mongoose.model('Comment', commentSchema);
// const User = mongoose.model('User', userSchema);

// Export models
// module.exports = { Article, Comment, User };
module.exports = { Article, Comment};