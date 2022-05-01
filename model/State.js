// Import mongoose
const mongoose = require('mongoose');

// Create Schema
const Schema = mongoose.Schema;

// Define Schema
// REMEMBER: no id field necessary!
const stateSchema = new Schema({
    stateCode: {
        type: String,
        required: true,
        unique: true
    },
    funfacts: [{
        type: String
    }]
});

module.exports = mongoose.model('State', stateSchema);