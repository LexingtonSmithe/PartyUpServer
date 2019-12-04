const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const preferencesSchema = new Schema({
    username: String,
    systems: String,
    device: String,
    role: String,
    party_size : Number,
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
    days_available : [String],
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

module.exports = mongoose.model('preferences', preferencesSchema);
