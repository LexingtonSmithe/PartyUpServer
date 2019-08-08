const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
    username: String,
    last_search: String,
    something: String,
    something: String
})

const matchSchema = new Schema({
    match_id: String,
    dm: {
        username: String,
        age: Number

    },
    players: [playerSchema],
    party_size : String,
    age : String,
    days_free : String,
    times_free_start : String,
    times_free_end : String,
    distance: Number
});

module.exports = mongoose.model('match', matchSchema);
