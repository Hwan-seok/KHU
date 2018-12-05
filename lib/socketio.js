
 const db = require('../lib/db.js');
 const requesting = require('request');
 const secret_key = require('./api_option').key;

module.exports = (server, app) => {

    const io = require('socket.io', )(server, {
        transports: ['websocket']
    });
    const API_CALL= setInterval(() => {
        requesting.get({
            // api를 요청할 주소 -- 시크릿키,위도,경도 입력
            url: `https://api2.sktelecom.com/weather/current/minutely?appKey=${secret_key}&lat=37.239795&lon=127.083240`, 
            json:true
        },
            //api에게 응답 받았을때 실행되는 callback func
            function (err, api_res, api_body) {  
                if (err) throw err;
                 // api의 대답이 있을경우 실행
                if (api_res) {
                    const sql = `INSERT INTO dataset (question,option_1,option_2,option_3,option_4,answer,user_id) VALUES (?,?,?,?,?,?,?)`;
                    db.query(sql, [question, option[0], option[1], option[2], option[3],machine_body.answer,user_id], function (err, result) {
                        if (err) throw err;
                        console.log("dataset successfully inserted into DB")
                    });
                    return response.send( { answer: machine_body.answer } );
                }
            });
    }, 60 * 1000); //1분마다 호출

    io.on('connection', (socket) => { //웹 페이지 연결시 루프 동작
        socket.on('disconnecting', (reason) => {
            clearInterval(API_CALL); //연결 종료시 해제
        })
        socket.on("connection", (roomnum) => { 
            API_CALL();
        })
    })



}
