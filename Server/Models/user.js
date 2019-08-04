const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  user_id : String,
  username : String,
  display_name : String,
  password : String,
  name: {
      first_name : String,
      last_name : String
  },
  contact: {
      email : String,
      telephone : String
  },
  date_of_birth  : String,
  city : String,
  country : String,
  location : {
      latitude : Number,
      longditude : Number
  },
  rec_created_at : Date,
  rec_updated_at : Date,
  last_login : Date,
  last_search : Date,
});

module.exports = mongoose.model('user', userSchema);
