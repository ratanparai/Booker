var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create a Schema
var socketSchema = new Schema({
   user_id : {type:Schema.Types.ObjectId, ref: 'User'},
   socket_id :String
});

// the schema is useless untill a model is created 
var Socket = mongoose.model('Socket', socketSchema);


// make this available to our Node application
module.exports = Socket;