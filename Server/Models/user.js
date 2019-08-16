const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  user_id : {
      type: String,
      default: null
  },
  username : {
      type: String,
      default: null
  },
  display_name : {
      type: String,
      default: null
  },
  password : {
      type: String,
      default: null
  },
  name: {
      first_name : {
          type: String,
          default: null
      },
      last_name : {
          type: String,
          default: null
      }
  },
  contact: {
      email : {
          type: String,
          default: null
      },
      telephone : {
          type: String,
          default: null
      }
  },
  date_of_birth  : {
      type: String,
      default: null
  },
  city : {
      type: String,
      default: null
  },
  country : {
      type: String,
      default: null
  },
  location : {
      latitude : {
          type: Number,
          default: null
      },
      longditude : {
          type: Number,
          default: null
      },
  },
  rec_created_at : {
      type: Date,
      default: Date.now()
  },
  rec_updated_at : {
      type: Date,
      default: Date.now()
  },
  last_login : {
      type: Date,
      default: Date.now()
  },
  last_search : {
      type: Date,
      default: null
  },
});

module.exports = mongoose.model('user', userSchema);
