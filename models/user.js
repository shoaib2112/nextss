var mongoose = require('mongoose');

var User = mongoose.model('User', new mongoose.Schema({
    fname:String,
    lname:String,
    ma:String,
    slid:String,
    role: {type:String, default: 'DAL'}
}));

module.exports = User;