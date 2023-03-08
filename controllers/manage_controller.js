const express = require('express');
router = express.Router();

function loggedIn(request, response, next) {
  if (request.user) {
    next();
  } else {
    response.redirect('/denied');
  }
}

router.get('/manage', loggedIn, function(request, response){
  response.status(200);
  response.setHeader('Content-Type', 'text/html')
  response.render("management", {
    user: request.user
  });
})

module.exports = router
