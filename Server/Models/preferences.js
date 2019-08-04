const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const preferencesSchema = new Schema({
    user: Number,
    systems: String,
    device: String,
    role: String,
    party_size : String,
    age : String,
    days_free : String,
    times_free_start : String,
    times_free_end : String,
    distance: Number
});

module.exports = mongoose.model('preferences', preferencesSchema);
