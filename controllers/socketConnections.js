const io = require( "socket.io" )();
const socketapi = {
    io: io
};

io.on('connection', function(socket){
    console.log("client connected")
    socket.on('announcement', function(data) {
      console.log('announcement:');
      io.emit('announcement', data);
    });

});

module.exports = socketapi;


