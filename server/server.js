var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var path = require("path");
var app = express();

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Dahc',
  database : 'test1'
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

connection.connect(function(err) {
  if (!err) {
    console.log("we connected boys");
  }
  else {
    console.log("ERROR", err);
  }
});

app.use(express.static('public'));

app.get("/", function(req, res) {

  connection.query("SELECT * from guy", function(err, rows, fields) {

  if (!err) {
    connection.end();
    var output = rows;
    res.render("index", { guys: output })
  }
  else {
    console.log(err);
  }

  });

});

app.get("/page2", function(req, res) {

  connection.query("SELECT * from guy", function(err, rows, fields) {

  if (!err) {
    
    var output = rows;
    res.render("page2", { guys: output })
  }
  else {
    console.log(err);
  }

  });

});


app.listen(5000, function() {
  console.log('listening on port 5000.');
});
