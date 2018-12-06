const db = require('./db.js');
const secret_key = require('../keys/api_option').key;
const requesting = require('request');
const lat = "37.239795";
const lon = "127.083240";
module.exports = (server, app) => {

    const io = require('socket.io', )(server, {
        transports: ['websocket']
    });

    let info = {}
    const CALL = (when, what) => {
        requesting.get({
                // api를 요청할 주소 -- 시크릿키,위도,경도 입력
                url: `https://api2.sktelecom.com/weather/${when}/${what}?appKey=${secret_key}&lat=${lat}&lon=${lon}`,
                json: true
            },
            //api에게 응답 받았을때 실행되는 callback function
            function (err, api_res, api_body) {
                if (err) throw err;
                // api의 대답이 있을경우 실행
                if (api_res) {
                    console.log(api_body);
                  //  api_body.weather.minutely[0]
                }
            });
    }
    io.on('connection', (socket) => { //웹 페이지 연결시 루프 동작
        let API_CALL;


        socket.on("connection", () => {
            API_CALL = setInterval(() => {

                CALL("current","minutely"); //현재날씨 (분별)
                CALL("index","wct"); //체감온도
                CALL("index","heat"); //열지수
                CALL("index","th"); //불쾌지수
                CALL("index","uv"); //자외선지수

            }, 60 * 1000); //1분마다 호출
        });

        socket.on('disconnecting', (reason) => {
            clearInterval(API_CALL); //연결 종료시 해제
        })
    })



}
