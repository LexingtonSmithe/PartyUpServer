const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  title: String,
  author: String,
  description: String,
  url : String,
  genre : String,
  yearPublished : String,
  description : String
});

module.exports = mongoose.model('chat', chatSchema);
