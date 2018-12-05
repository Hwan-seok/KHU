const passport_IO = require('./passport+socketio.js'),
    passportSocketIo = require("passport.socketio"),
    db = require('../lib/db.js');

module.exports = (server, app) => {

    const io = require('socket.io', )(server, {
        transports: ['websocket']
    });


    io.on('connection', (socket) => { //네임스페이스 연결시 루프 동작
        socket.on('disconnecting', (reason) => {

        })
        socket.on("connection", (roomnum) => { //방 접속시에 현재 방번호 room에 저장
        })
    })



}
