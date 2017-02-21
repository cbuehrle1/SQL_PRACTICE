var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var path = require("path");
var session = require("express-session");
var startPassport = require('./setup-passport')
var passport = require("passport");
var flash = require("connect-flash");
var app = express();

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Dahc',
  database : 'test1'
});

startPassport();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(flash());

connection.connect(function(err) {
  if (!err) {
    console.log("we connected boys");
  }
  else {
    console.log("ERROR", err);
  }
});

var SECRET = "chad1343413515baNANa13134134%%$#%%4#@"

app.use(session({
  secret: SECRET,
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}

app.use(express.static('public'));

app.get("/", function(req, res) {

  connection.query("SELECT first_name from guy WHERE first_name= 'chad'", function(err, rows, fields) {

  if (!err) {

    var output = rows;
    res.render("index", { guys: output })
  }
  else {
    console.log(err);
  }

  });

});

app.get("/signup", function(req, res) {
  res.render("signup");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/signup", function(req, res) {

  console.log(req.body, "/signup");

  passport.authenticate("local-signup", {
  successRedirect: "/login",
  failureRedirect: "/"
  });

});

app.listen(5000, function() {
  console.log('listening on port 5000.');
});
