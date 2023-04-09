const express = require('express');
const multer = require('multer');
const fs = require('fs');
const ejs = require('ejs');
router = express.Router();

const CLUBS = require('../models/clubs_model.js');
const MANAGE = require('../models/manage_model.js');


let privateStorage = multer.diskStorage({
  destination: function (request, file, cb) {
    cb(null, './uploads')
  },
  filename: function (request, file, cb) {
    cb(null, Date.now()+'-'+file.originalname.replace(' ', '-'));
  }
});

let privateUpload = multer({ storage: privateStorage });


function loggedIn(request, response, next) {
  if (request.user) {
    next();
  } else {
    response.redirect('/denied');
  }
}


router.get('/clubs', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render('clubs', {
    user: request.user,
    clubs: CLUBS.getAllClubs(),
    club_category: "all"
  });
})

router.get('/clubs/:category', function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render('clubs', {
    user: request.user,
    clubs: CLUBS.getAllClubs(),
    club_category: request.params.category
  });
})


router.get('/clubs/viewclub/:clubID', function(request, response){
  let clubID = request.params.clubID;
  let club = CLUBS.getClub(clubID);
  let clubEvents = CLUBS.getClubEvents(clubID)
  response.status(200);
  response.setHeader('Content-Type', 'text/html');
  response.render('clubdetails', {
    user: request.user,
    club: club,
    eventsArray: clubEvents
  });
})

//create club
router.post('/clubs/createClub', loggedIn, privateUpload.any(), async function(request, response) {
    console.log(request.body.clubName);
    console.log(request.body.advisorEmail);
    let club = request.body
    let thumbnail_img = request.files[0]
    console.log(thumbnail_img.path)
    club.leaders = [club.leader1Email, club.leader2Email, club.leader3Email, club.leader4Email]
    if(4==4){
      let createdClub = await CLUBS.createClub(club, thumbnail_img);
      console.log(createdClub);
      response.status(200);
      response.setHeader('Content-Type', 'text/html')
      response.redirect("/manage");
    }else{
      response.redirect('/error?code=400');
    }
});

router.post('/clubs/updateClub', loggedIn, function(request, response){
  console.log("updating club: " + request.body.clubName)
  if(MANAGE.isLeader(request.user._json.email, request.body.clubID)){

    CLUBS.updateClub(request.body);
    response.redirect(`/manage/${request.body.clubID}`)
  } else {
    response.redirect('/denied')
  }
})


module.exports = router
