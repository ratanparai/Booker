var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');


var SALT_WORK_FACTOR = 10;

// create a Schema
var userSchema = new Schema({
   name : String,
   username : { type: String},
   password : {type: String},
   email : {type: String},
   created_at : Date,
   updated_at : Date,
   profile_picture: String
});

/**
 * Validations
 */
userSchema.path('email').validate(function(email){
    return email.length;
}, 'Email cannot be blank');

userSchema.path('password').validate(function(password){
    return password.length;
}, 'Password cannot be blank');

userSchema.path('username').validate(function(username){
    return username.length;
}, 'username cannot be blank');

userSchema.path('username').validate(function(username, fn){
    var User = mongoose.model('User');
    
    User.find({username : username }).exec(function(err, users){
        fn(!err && users.length === 0);
    });
}, 'username already exists');


// create password hash before saving to database
userSchema.pre('save', function(next){
    var user = this;
    
    // create password hash
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        
        // if error throw it
        if (err) return next(err);
        
        bcrypt.hash(user.password, salt, function(err,hash){
            if (err) return next(err);
            
            user.password = hash;
            next();
        });
    });
});





// method to check if username and password is matched when login
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// the schema is useless untill a model is created 
var User = mongoose.model('User', userSchema);


// make this available to our Node application
module.exports = User;