const express = require('express');
const multer = require('multer');
const fs = require('fs');
const ejs = require('ejs');
const CLUBS = require("../models/clubs_model.js");
const ADMIN = require("../models/admin_model.js");
const MANAGE = require("../models/manage_model.js")
router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(__dirname+'/../data/admin_dash.db');

function loggedIn(request, response, next) {
  if (request.user) {
    next();
  } else {
    response.redirect('/denied');
  }
}

//middleware to check if admin
function admin_only(request, response, next){
  if(ADMIN.isAdmin(request.user._json.email)){
    next();
  } else {
    response.redirect('/error?code=401')
  }
}

router.get('/admin', loggedIn, admin_only, function(request, response){
    let logsdata;
    db.all("SELECT * FROM logs", function(err, rows){
      if(err){
        console.log(err);
        response.redirect('/error?code=500')
      } else {
        logsdata = rows;
        response.status(200);
    response.setHeader('Content-Type', 'text/html');
    response.render("admin_dashboard", {
        user: request.user,
        clubs: CLUBS.getAllClubs(),
        receipts: MANAGE.getAllReimbursementRequests(),
        logdata: logsdata
      })
      }
    })
    
  })


  router.get('/admin/approve/:clubID', loggedIn, admin_only, function(request, response){
    ADMIN.approveClub(request.params.clubID);
    response.status(200);
    response.setHeader('Content-Type', 'text/html');
    response.redirect('/admin')
  })

  router.get('/admin/approveBudget/:requestID', loggedIn, admin_only, function(request, response){
    ADMIN.approveBudget(request.params.requestID);
    response.status(200)
    response.setHeader('Content-Type', 'text/html')
    response.redirect('/admin')
  })









  module.exports = router
