var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mysql = require('mysql');
var flash = require('connect-flash');
var bcrypt = require("bcrypt");

module.exports = function() {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {

  });

  var checkPassword = function(guess, done) {
  bcrypt.compare(guess, this.password, function(err, isMatch){
    done(err, isMatch);
    });
  };

  passport.use('local-signup', new LocalStrategy({
       // by default, local strategy uses username and password, we will override with email
       usernameField : 'email',
       passwordField : 'password',
       passReqToCallback : true // allows us to pass back the entire request to the callback
   },
   function(req, email, password, done) {

       connection.query("select * from users where email = '"+email+"'",function(err,rows){

         console.log(rows);
         console.log("above row object");

         if (err)
           return done(err);

          if (rows.length) {

           return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          }

        else {

           var newUserMysql = new Object();

           var salt = bcrypt.genSaltSync(10);
           var passwordToSave = bcrypt.hashSync(password, salt)

           newUserMysql.email = email;
           newUserMysql.password = passwordToSave; // use the generateHash function in our user model

           var insertQuery = "INSERT INTO users ( email, password ) values ('" + email +"','"+ password +"')";
             console.log(insertQuery);
           connection.query(insertQuery,function(err,rows){
           newUserMysql.id = rows.insertId;

           return done(null, newUserMysql);

          });
        }
   });

  }));

  passport.use('local-login', new LocalStrategy({
       // by default, local strategy uses username and password, we will override with email
       username: 'email',
       password: 'password',
       passReqToCallback : true // allows us to pass back the entire request to the callback
   },
   function(req, email, password, done) { // callback with email and password from our form

    connection.query("SELECT * FROM `users` WHERE `email` = '" + email + "'",function(err,rows){
       if (err) {
         return done(err);
       }

       if (!rows.length) {
         return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
       }

       checkPassword(password, function(err, isMatch) {

         if (err) { return done(err); }
          if (isMatch) {
            return done(null, rows[0]);
          } else {
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
          }
       });

   });



   }));


}
