const express = require('express');
const ejs = require('ejs');
const methodOverride = require('method-override');

const app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
app.use(express.json()); //Used to parse JSON bodies (needed for POST requests)
app.use(express.urlencoded());
app.use(methodOverride('_method'));
app.use(express.static('public')); //specify location of static assests
app.set('views', __dirname + '/views'); //specify location of templates
app.set('view engine', 'ejs'); //specify templating library

app.use(require('./controllers/auth.js'))
app.use(require('./controllers/admin_controller.js'))
app.use(require('./controllers/club_controller.js'))
app.use(require('./controllers/manage_controller.js'))
app.use(require('./controllers/index.js'))

let socketapi =require('./controllers/socketConnections');
socketapi.io.attach(server);

app.use("", function(request, response) {
  response.redirect('/error?code=400');
});


//..............Start the server...............................//
const port = process.env.PORT || 3000;
app.set("port", port); 

server.listen(port, function() {
  console.log('Server started at http://localhost:'+port+'.')
});
