const express = require('express');
const multer = require('multer');
const fs = require('fs');
const ejs = require('ejs');
const CLUBS = require("../models/clubs_model.js");
const ADMIN = require("../models/admin_model.js");
const MANAGE = require("../models/manage_model.js")
router = express.Router();

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
    response.redirect('/')
  }
}

router.get('/admin', loggedIn, admin_only, function(request, response){
    response.status(200);
    response.setHeader('Content-Type', 'text/html');
    response.render("admin_dashboard", {
        user: request.user,
        clubs: CLUBS.getAllClubs(),
        receipts: MANAGE.getAllReimbursementRequests()
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
