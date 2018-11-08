// set up ========================

var express = require('express');
var app = express();                              // create our app w/ express
var Firebase = require('firebase');
var morgan = require('morgan');      
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override');
var multer  =   require('multer');
var fs = require("fs");

app.use(function(req, res, next) { //allow cross origin requests

    res.setHeader("Access-Control-Allow-Origin", "*");

    res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");

    res.header("Access-Control-Max-Age", "3600");

    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    next();

});

Firebase.initializeApp({

    databaseURL: "https://totapp-isa.firebaseio.com/",

    serviceAccount: './totapp-isa-firebase.json', //this is file that I downloaded from Firebase Console

});

var db = Firebase.database();

var usersRef = db.ref("users");

// configuration

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users

app.use('/public/uploads',express.static(__dirname + '/public/uploads'));

app.use(morgan('dev'));                                         // log every request to the console

app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded

app.use(bodyParser.json());                                     // parse application/json

app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.get('/', function (req, res) {

  res.sendfile('./index.html')

})

// create user

app.post('/api/createUser', function(req, res) {
  // var userEmail = req.body.user_email;
  var data = req.body;
  usersRef.push(data, function(err) {
    if (err) {
      res.send(err)
    } else {
      // var key = Object.keys(snapshot.val())[0];
      // console.log(key);
      res.json({message: "Success: User Save.", result: true});
    }
  });
});

// update user

app.put('/api/updateUser', function(req, res) {
  var uid = "-Ks8HilZxX5vtFPqGu75";
  var data = req.body;
  usersRef.child(uid).update(data, function(err) {
    if (err) {
      res.send(err);
    } else {
      usersRef.child("uid").once("value", function(snapshot) {
        if (snapshot.val() == null) {
          res.json({message: "Error: No user found", "result": false});
        } else {
          res.json({"message":"successfully update data", "result": true, "data": snapshot.val()});
        }
      });
    }
  });
});

  // delete user
  
  app.delete('/api/removeUser', function(req, res) {  
    var uid = "-Ks8HilZxX5vtFPqGu75";
      usersRef.child(uid).remove(function(err) {
        if (err) {
          res.send(err);
        } else {
          res.json({message: "Success: User deleted.", result: true});
        }
      })
    });

  // get users

  app.post('/api/getUsers', function(req, res) {

    var uid = "-Ks8HilZxX5vtFPqGu75";

    if (uid.length != 20) {

      res.json({message: "Error: uid must be 20 characters long."});

    } else {

      usersRef.once("value", function(snapshot) {
      //console.log(snapshot);
      if (snapshot.val() == null) {
        res.json({message: "Error: No user found", "result": false});
          } else {
            res.json({"message":"successfully fetch data", "result": true, "data": snapshot.val()});
          }
        });
      }
    });


// login
app.post('/api/login', function(req, res) {
  User.findOne({ 'user_name' :  req.body.user_name, 'password' : req.body.password }, function(err, user) {
    // if there are any errors, return the error
    if (err)
        return res.send(err);
    // check to see if user exist
    if (user) {
        return res.json(user);
    } else {
        return res.json({"message":"Invalid Username or Password."});
    }
  });
});

//TRY OF FIRESTORE

const admin = require('firebase-admin');

var serviceAccount = require('./totapp-isa-firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db2 = admin.firestore();

var subjectsRef = db2.collection('subjects');
var filesRef = db2.collection('files');

app.get('/api/subjects', function(req, res){
  var query = "";
  //SUBJECT BY COUSECODE//
  if (req.query.subjectCode) {
    console.log('Request has subjectCode param ->', req.query.subjectCode);
    subjectsRef.doc(req.query.subjectCode).get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
        return res.json('Error not found');
      } else {
        var result = [];
        result.push({code: doc.id, data: doc.data()});
        console.log('Document data:', doc.data());
        return res.json(result);
      }
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }
  //SUBJECTS BY SEMESTER//
  else if(req.query.semester) {
    console.log('Request has semester param ->', req.query.semester);
    subjectsRef.where('semester', '==', parseInt(req.query.semester)).get()
    .then(snapshot => {
      var result = [];
      snapshot.forEach(doc => {
        result.push({code: doc.id, data: doc.data()});
        console.log(doc.id, '=>', doc.data());
      });
      return res.json(result);
    })
    .catch(err => {
      console.log('Error getting documents', err);
      return res.json('Error getting subjects', err);
    });
  }
  //ALL SUBJECTS//
  else {
    subjectsRef.get()
    .then((snapshot) => {
      var result = [];
      snapshot.forEach((doc) => {
        result.push({code: doc.id, data: doc.data()});
        console.log(doc.id, '=>', doc.data());
      });
      return res.json(result);
    })
    .catch((err) => {
      console.log('Error getting documents', err);
      return res.json('Error getting subjects', err);
    });
  }
});

app.get('/api/files', function(req, res){
  var query = "";
  //SUBJECT BY COUSECODE//
  if (req.query.subjectCode) {
    console.log('Request has subjectCode param ->', req.query.subjectCode);
    filesRef.where('subject', '==', req.query.subjectCode).get()
    .then((snapshot) => {
      var result = [];
      snapshot.forEach((doc) => {
        result.push({code: doc.id, data: doc.data()});
        console.log(doc.id, '=>', doc.data());
      });
      return res.json(result);
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }
  else if (req.query.author) {
    console.log('Request has author param ->', req.query.author);
    filesRef.where('author', '==', req.query.author).get()
    .then((snapshot) => {
      var result = [];
      snapshot.forEach((doc) => {
        result.push({code: doc.id, data: doc.data()});
        console.log(doc.id, '=>', doc.data());
      });
      return res.json(result);
    })
    .catch(err => {
      console.log('Error getting document', err);
    });
  }
  else {
    filesRef.get()
    .then((snapshot) => {
      var result = [];
      snapshot.forEach((doc) => {
        result.push({code: doc.id, data: doc.data()});
        console.log(doc.id, '=>', doc.data());
      });
      return res.json(result);
    })
    .catch((err) => {
      console.log('Error getting documents', err);
      return res.json('Error getting subjects', err);
    });
  }
});

//app.listen(3000);
app.listen(process.env.PORT)

console.log("port is", process.env.PORT);