var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mysql = require('mysql');
var flash = require('connect-flash');
var bcrypt = require("bcrypt");

module.exports = function() {

  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Dahc',
    database : 'test1'
  });

  passport.serializeUser(function(user, done) {

    done(null, user.user_id);
  });

  passport.deserializeUser(function(id, done) {

    connection.query("select * from users where user_id = "+id,function(err,rows){
			done(err, rows[0]);
		});
  });

  var checkPassword = function(guess, storedPassword, done) {
  bcrypt.compare(guess, storedPassword, function(err, isMatch){
    done(err, isMatch);
    });
  };

  passport.use('local-signup', new LocalStrategy({

       username: 'username',
       password: 'password',
       passReqToCallback : true

      }, function(req, username, password, done) {

       connection.query("select * from users where username = '"+username+"'",function(err,rows) {

        if (err) {
          return done(err);
        }

        if (rows.length) {

          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

        }

        else {

           var newUserMysql = new Object();

           var salt = bcrypt.genSaltSync(10);
           var passwordToSave = bcrypt.hashSync(password, salt)

           newUserMysql.username = username;
           newUserMysql.password = passwordToSave;

           var insertQuery = "INSERT INTO users ( username, password ) values ('" + username +"','"+ passwordToSave +"')";

           console.log(insertQuery);

           connection.query(insertQuery,function(err,rows){

             newUserMysql.id = rows.insertId;

             return done(null, newUserMysql);

          });
        }
   });

  }));

  passport.use('local-login', new LocalStrategy({

       username: 'username',
       password: 'password',
       passReqToCallback : true
   },
   function(req, username, password, done) {

    connection.query("SELECT * FROM `users` WHERE `username` = '" + username + "'",function(err,rows){
       if (err) {
         return done(err);
       }

       if (!rows.length) {
         return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
       }

       checkPassword(password, rows[0].password, function(err, isMatch) {

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
