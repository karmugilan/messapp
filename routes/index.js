

var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var mongoose=require("mongoose");
var User = require('../models/user');
var msg91 = require("msg91")("116912ATLI3PbqmS5afec4f0", "KLBYTE", "4" );
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/smsapp', { promiseLibrary: require('bluebird') })
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));
var db = mongoose.connection;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
// login

router.post('/', function(req, res, next) {
    if (req.body.username && req.body.password) {
      User.authenticate(req.body.username, req.body.password, function (error, user) {
         if (error || !user) {
           var err = new Error('Incorrece username and password');
           err.status = 401;
           return next(err);
        }  else {
    
           req.session.userId = user._id;
           return res.redirect('/profile');
         }
       });
     } else {
      var err = new Error('Fill all the fields');
      err.status = 400;
       return next(err);
     }
    });
// render signup
  router.get('/signup',function(req,res){
    res.render('signup.ejs');
  })
  
  // render profile
  router.get('/profile',requiresLogin,function(req,res,next){
   User.findById(req.session.userId,function(err,user){
    if(err){
      return next(err);
    }else{
      res.render('profile.ejs',{user:user});
    }
   })
    
  })
  // save signup
router.post('/signup',function(req,res,next){
  if (req.body.email &&
    req.body.username &&
    req.body.password)
    {

    var userData = {

      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    }
    //use schema.create to insert data into the db
    User.create(userData, function (err, user) {
      if (err) {
        return next(err)
      } else {
        req.session.userId=user._id;
        return res.redirect('/profile');
      }
    });
        
  }else{
    var err = new Error('All fields have to be filled out');
        err.status = 400;
      return next(err);
  }

});
//Adding contacts

router.get('/newcontact', function(req, res, next) {
  res.render('newcontact');
});
router.get('/newcontact',requiresLogin,function(req,res,next){
  User.findById(req.session.userId,function(err,user){
   if(err){
     return next(err);
   }else{
     res.render('newcontact.ejs',{user:user});
   }
  }) 
 }); 
router.post('/newcontact',function(req,res){
  User.findById(req.session.userId, function(err, user) {

    user.contacts.push({
        contactname:req.body.contactname,
        contactnumber:req.body.contactnumber
    })
    user.save(function(err){
      if(err){console.log(err)
      }
  else{
    res.redirect("/viewcontacts");
    console.log("saved");
  }
})
  });
});
   router.get('/viewcontacts',function(req,res,next){
     User.findById(req.session.userId,function(err,user){
       if(err){
         return next(err);
       }else{
         res.render('viewcontact',{user:user})
       }
     })
   })
// message
 router.get('/message', function(req, res, next) {
  res.render('message');
});
router.get('/message',requiresLogin,function(req,res,next){
  User.findById(req.session.userId,function(err,user){
   if(err){
     return next(err);
   }else{
     res.render('message.ejs',{user:user});
   }
  }) 
 })
 router.post('/message',function(req,res,next){
  var mobilenumber =req.body.mobile;
  var message =req.body.message;
  
  msg91.send(mobilenumber, message, function(err, response){
    console.log(err);
    console.log(response);
    res.redirect('/profile');
});
}) ;


//Adding group

router.get('/group', function(req, res, next) {
  res.render('group');
});
router.get('/group',requiresLogin,function(req,res,next){
  User.findById(req.session.userId,function(err,user){
   if(err){
     return next(err);
   }else{
     res.render('group.ejs',{user:user});
   }
  }) 
 }); 
router.post('/group',function(req,res){
  User.findById(req.session.userId, function(err, user) {

    user.groups.push({
        group_name:req.body.groupname
   })
    user.save(function(err){
      if(err){console.log(err)
      }
  else{
    res.redirect("/showgroup");
    console.log("saved");
  }
})
  });
});
   router.get('/showgroup',function(req,res,next){
     User.findById(req.session.userId,function(err,user){
       if(err){
         return next(err);
       }else{
         res.render('showgroup',{user:user})
       }
     })
   })
// middleware
function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
};

router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});


module.exports = router;
