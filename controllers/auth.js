const express = require('express'),
  router = express.Router();
const fs = require('fs');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const KEYS = require('../config/keys.json');
const ADMIN = require('../models/admin_model.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(__dirname+'/../data/admin_dash.db');
//keeping our secrets out of our main application is a security best practice
//we can add /config/keys.json to our .gitignore file so that we keep it local/private

let userProfile; //only used if you want to see user info beyond username

router.use(session({
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 600000000 //600000 seconds of login time before being logged out
  },
  secret: KEYS["session-secret"]
}));
router.use(passport.initialize());
router.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: KEYS["google-client_id"],
    clientSecret: KEYS["google-client_secret"],
    callbackURL: "http://localhost:3000/auth/google/callback"
    //todo: port==process.env.PORT? :
  },
  function(accessToken, refreshToken, profile, done) {
    userProfile = profile; //so we can see & use details form the profile
    return done(null, userProfile);
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/*
  This triggers the communication with Google
*/
router.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

/*
  This callback is invoked after Google decides on the login results
*/
router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/error?code=401'
  }),
  function(request, response) {
    console.log(userProfile);
    let login_history = JSON.parse(fs.readFileSync(__dirname+'/../config/user_login_history.json'));
    let timern = new Date();
    login_history[timern] = userProfile;
    fs.writeFileSync(__dirname+'/../config/user_login_history.json', JSON.stringify(login_history)); //log everyone who logs in into json file
    db.serialize(() => {
      db.run("INSERT INTO logs (useremail, userevent) VALUES (?, ?)",
        userProfile._json.email,
        'logged in',
        function(err){
          if(err) { throw err;}
        }
      )
    })
    db.all("SELECT * FROM logs", function(err, rows){
      if(err){
        console.log(err);
      } else {
        console.log("*******************");
        console.log(rows);
      }
    })
    response.redirect('/');
  });



router.post('/auth/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
  db.serialize(() => {
    db.run("INSERT INTO logs (useremail, userevent) VALUES (?, ?)",
      userProfile._json.email,
      'logged out',
      function(err){
        if(err) { throw err;}
      }
    )
  })
});

module.exports = router;
