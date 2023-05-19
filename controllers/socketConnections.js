const io = require( "socket.io" )();
const socketapi = {
    io: io
};

io.on('connection', function(socket){

    socket.on('announcement', function(data) {
      console.log('announcement:');
    });

});

module.exports = socketapi;


