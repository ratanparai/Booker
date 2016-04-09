var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create a Schema
var friendshipSchema = new Schema({
   user1 : {type: String, required: true},
   user2 : {type: String, required: true},
});

// the schema is useless untill a model is created 
var Friendship = mongoose.model('Friendship', friendshipSchema);


// make this available to our Node application
module.exports = Friendship;