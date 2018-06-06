var mongoose=require("mongoose");
var bcrypt = require('bcryptjs');
// schema creation
mongoose.connect("mongodb://localhost/smsapp");



var message= new mongoose.Schema({
  message: String,
  sent_at: { type: Date, default: Date.now },
})


var Groups = new mongoose.Schema({
  group_name: String,
  group_type: {type: String},
  messages: [message],
  description: String,
});

var Contact= new mongoose.Schema({

  contactname:String,
  contactnumber:Number,
}) 

var UserSchema=new mongoose.Schema({
  username:String,
  password:String,
  email:String,
  contacts: [Contact],
  groups: { type:[Groups], default: [Groups] },
});



//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
   user.password = hash;

    next();
 })
});

//authenticate input against database
UserSchema.statics.authenticate = function (username, password, callback) {
      User.findOne({ username: username })
        .exec(function (err, user) {
          if (err) {
            return callback(err)
          } else if (!user) {
            var err = new Error('User not found.');
            err.status = 401;
            return callback(err);
          }
          bcrypt.compare(password, user.password, function (err, result) {
            if (result === true) {
              return callback(null, user);
            } else {
              return callback();
            }
          })
        });
    }


var User=mongoose.model('User',UserSchema);
module.exports=User;