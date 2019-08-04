const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const credentialsSchema = new Schema({
    username: Number,
    password: String
});

module.exports = mongoose.model('preferences', credentialsSchema);
