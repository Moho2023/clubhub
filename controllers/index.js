const express = require('express');
router = express.Router();
const fs = require('fs')
const CLUBS = require('../models/clubs_model.js')

router.get('/', function(request, response) {
  let eventsJSON = JSON.parse(fs.readFileSync(__dirname+'/../data/events.json'));
  let eventsArray = eventsJSON.events
  console.log(eventsArray)
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("index", {
    user: request.user,
    eventsArray: eventsArray,
    clubs: CLUBS.getAllClubs()
    });
});

router.get('/login', function(request, response) {
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("login", {
    user: request.user
  });
});

router.get('/denied', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("access_denied", {
    user: request.user
  });
});


router.get('/error', function(request, response) {
  const errorCode = request.query.code;
  if (!errorCode) errorCode = 400;
  const errors = {
    '400': "Unknown Client Error",
    '401': "Invalid Login",
    '404': "Resource Not Found",
    '500': "Server problem"
  }

  response.status(errorCode);
  response.setHeader('Content-Type', 'text/html')
  response.render("error", {
    user: request.user,
    "errorCode": errorCode,
    "details": errors[errorCode]
  });
});


module.exports = router
