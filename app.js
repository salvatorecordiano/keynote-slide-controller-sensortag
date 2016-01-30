var applicationName = "Keynote Slide Controller BLE";
var allowedKeys = ["left", "right"];

// include
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var robot = require('robotjs');
var sensorTag = require('sensortag');

// init
var app = express();

// configure app
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// use middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// define routes
app.get('/', function(req, res){
    res.render('index', {
      applicationName: applicationName
    });   
});
app.get('/keyboard/:key', function(req, res){
  var key = req.params.key.toLowerCase();
  var index = allowedKeys.indexOf(key);
  var response = { target: 'keyboard', key: null };
  if(index != -1)
  {
    console.log("Event -> Keyboard -> " + key);
    robot.keyTap(key);
    response = { target: 'keyboard', key: key };
  }
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(response));
});

// server listen
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log(applicationName);
  console.log('Server started on port ' + port);
  sensorTagPlugin();
});


function sensorTagPlugin()
{
  sensorTag.discover(function(tag) {
    // when you disconnect from a tag, exit the program:
    tag.on('disconnect', function() {
      console.log('SensorTag is disconnected');
      sensorTagPlugin();
    });

    // attempt to connect to the tag
    function connectAndSetUpMe() {      
       console.log('SensorTag is setting up');
       // when you connect, call notifyMe
       tag.connectAndSetUp(notifyMe);
     }

    function notifyMe() {
      // start the button listener
      tag.notifySimpleKey(listenForButton);
     }

    // when you get a button change, print it out:
    function listenForButton() {
      tag.on('simpleKeyChange', function(left, right) {
        if (left) {
          console.log("Event -> Keyboard -> LEFT");
          robot.keyTap('left');
        }  
        else if (right) {    // if right, send the right key
          console.log("Event -> Keyboard -> RIGHT");
          robot.keyTap('right');
        }
       });
    }
    // Now that you've defined all the functions, start the process:
    connectAndSetUpMe();
  });
}

module.exports = app;