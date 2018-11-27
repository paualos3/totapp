// set up ========================

var express = require('express');
var app = express();                              // create our app w/ express
var Firebase = require('firebase');
var morgan = require('morgan');      
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override');
var multer  =   require('multer');
var fs = require("fs");

//TRY OF FIRESTORE

app.use(bodyParser.json({limit: '10mb'}))

const admin = require('firebase-admin');

var serviceAccount = require('./totapp-isa-firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db2 = admin.firestore();

const subjectsRef = db2.collection('subjects');
const filesRef = db2.collection('files');

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

app.post('/api/files', function(req, res){
  const {author, subject, url} = req.body;
  const autor = req.body.author;
  const assig = req.body.subject;
  const urll = req.body.url;
  console.log('autor', autor);
  console.log('assig', assig);
  console.log('urll', urll);
  console.log('author', author);
  console.log('subject', subject);
  console.log('url', url);
  /**var data = {
    author: self.author,
    subject: self.author,
    url: self.url
  };

  // Add a new document in collection "cities" with ID 'LA'
  var setDoc = filesRef.doc('LA').set(data);**/
  const date = new Date()
  db2.collection('files').add({
    author: author,
    subject: subject,
    url: url,
    created_at: date
    /*author: 'author',
    subject: 'subject',
    url: 'url'*/
  }).then(ref => {
    console.log('Added document with ID: ', ref.id);
  });
});

//app.listen(3000);
app.listen(process.env.PORT)

console.log("port is", process.env.PORT);