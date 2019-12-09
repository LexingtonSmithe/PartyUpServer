const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchSchema = new Schema({
    match_id: String,
    dm: {
        username: String,
        age: Number
    },
    players: [{
        username: String,
        something: String
    }],
    party_size : [String],
    age : {
        min_age : {
            type: Number,
            default: null
        },
        max_age : {
            type: Number,
            default: null
        }
    },
    days_free : [String],
    time_available : {
        start : {
            type: String,
            default: null
        },
        end : {
            type: String,
            default: null
        }
    },
    distance: Number
});

module.exports = mongoose.model('match', matchSchema);
