// ad/models/ad.js

const mongoose = require('mongoose');

// Ad Schema
const adSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

// AdEvent Schema
const adEventSchema = new mongoose.Schema({
  ad_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  userIp: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming there is a User model
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article', // Assuming there is an Article model
  },
});

const Ad = mongoose.model('Ad', adSchema);
const AdEvent = mongoose.model('AdEvent', adEventSchema);

module.exports = { Ad, AdEvent };