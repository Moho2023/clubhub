const express = require('express');
router = express.Router();
const multer = require('multer')
const CLUBS = require('../models/clubs_model.js');
const MANAGE = require('../models/manage_model.js');
const ejs = require("ejs")
const fs = require('fs');

function loggedIn(request, response, next) {
  if (request.user) {
    next();
  } else {
    response.redirect('/denied');
  }
}

let privateStorage = multer.diskStorage({
  destination: function (request, file, cb) {
    cb(null, './uploads')
  },
  filename: function (request, file, cb) {
    cb(null, Date.now()+'-'+file.originalname.replace(' ', '-'));
  }
});

let privateUpload = multer({ storage: privateStorage });

router.get('/manage', loggedIn, function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("management", {
    user: request.user,
    clubs: CLUBS.getAllClubs()
  });
})

router.get('/manage/new', loggedIn, function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("management", {
    user: request.user,
    clubs: CLUBS.getAllClubs()
  });
})

router.get('/manage/:clubID', loggedIn, function(request, response){
  let clubID = request.params.clubID;
  if(MANAGE.isLeader(request.user._json.email, clubID)){
    console.log(MANAGE.getUserRole(request.user._json.email))
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.render("manageClub", {
      user: request.user,
      club: CLUBS.getClub(clubID),
      userRole: MANAGE.getUserRole(request.user._json.email)
    })
  } else {
    response.redirect("/")
  }
})

router.post('/manage/createEvent', loggedIn, function(request, response){
  let newEvent = request.body
  if(MANAGE.isLeader(request.user._json.email, newEvent.clubID) && MANAGE.isApproved(newEvent.clubID)){
    MANAGE.createEvent(newEvent);
    response.redirect(`/manage/${request.body.clubID}`)
  } else {
    response.redirect('/')
  }
})

router.post('/manage/reimburse', loggedIn, privateUpload.any(), async function(request, response){
  let newrequest = request.body
  if(MANAGE.isLeader(request.user._json.email, newrequest.clubID) && MANAGE.isApproved(newrequest.clubID)){
    let createdRequest = await MANAGE.sendReimbursementRequest(newrequest, request.files[0])
    console.log(createdRequest);
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.redirect(`/manage/${request.body.clubID}`)
  } else {
    response.redirect('/')
  }
})

router.post('/manage/announce', loggedIn, function(request, response){
  let announcement = request.body;
  let clubID = announcement.clubID;
  if(MANAGE.isLeader(request.user._json.email, clubID)){
  let now = new Date();
  MANAGE.createAnnouncement(announcement, now);
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.redirect(`/manage/${request.body.clubID}`)
} else {
  response.redirect('/')
}
})

router.post('/manage/sendToAdvisor', loggedIn, function(request, response){
  let email_content = request.body
  let clubID = email_content.clubID
  if(MANAGE.isLeader(request.user._json.email, clubID) && MANAGE.isApproved(clubID)){
    MANAGE.handleEmailDraft(email_content);
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.redirect(`/manage/${request.body.clubID}`)
  } else {
    response.redirect('/')
  }
})

router.post('/manage/sendEmail', loggedIn, function(request, response){
  let email_content = request.body
  let clubID = email_content.clubID
  if(MANAGE.isLeader(request.user._json.email, clubID) && MANAGE.isApproved(clubID)){
    MANAGE.sendEmailAnnouncement(email_content);
    response.status(200);
    response.setHeader('Content-Type', 'text/html')
    response.redirect(`/manage/${request.body.clubID}`)
  } else {
    response.redirect('/error?code=401');
  }
})

module.exports = router
