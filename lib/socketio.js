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
            return new Promise((resolve, reject) => {
            requesting.get({
                    // api를 요청할 주소 -- 시크릿키,위도,경도 입력
                    url: `https://api2.sktelecom.com/weather/${when}/${what}?appKey=${secret_key}&lat=${lat}&lon=${lon}`,
                    json: true
                },
                //api에게 응답 받았을때 실행되는 callback function
                function (err, api_res, api_body) {
                    //err 존재시 promise reject 호출
                    if (err) reject(err);

                    // api의 response이 있을경우 promise resolve 호출
                    if (api_res) {
                        console.log("call");
                                resolve(api_body);
                        }
                    });
                })
            }
            io.on('connection', (socket) => { //웹 페이지 연결시 루프 동작
                let API_CALL;
                //명시적으로 객체임을 선언 
                let Current_Weather = {};
                let Sensible_T = {};
                let Heat_index = {};
                let Discomport_index = {};
                let Ultra_Violet_index = {};
                let sending_to_client_info = {};
                let client_send = {};
                let sql;

                socket.on("connection", () => {
                    console.log("lala");
                    // API_CALL = setInterval(() => {
                    console.log("lala");


                    const API_bundle = async () => {

                        try {
                            Current_Weather = await CALL("current", "minutely"); //현재날씨 (분별)
                            Sensible_T = await CALL("index", "wct"); //체감온도
                            Heat_index = await CALL("index", "heat"); //열지수
                            Discomport_index = await CALL("index", "th"); //불쾌지수
                            Ultra_Violet_index = await CALL("index", "uv"); //자외선지수
                            console.log("bundle");

                            info = {
                                heat: Heat_index.weather.wIndex.heatIndex[0].current.index, //열지수
                                sensible_temperature: Sensible_T.weather.wIndex.wctIndex[0].current.index, //체감온도
                                discomport: Discomport_index.weather.wIndex.thIndex[0].current.index, //불쾌지수
                                UV: Ultra_Violet_index.weather.wIndex.uvindex[0].day01.index, //자외선지수
                                windspd: Current_Weather.weather.minutely[0].wind.wspd, //바람 속도
                                sky: Current_Weather.weather.minutely[0].sky.code, //하늘 상태
                                rain: Current_Weather.weather.minutely[0].rain.last24hour, //강수량 
                                current_temperature: Current_Weather.weather.minutely[0].temperature.tc, //현재 온도
                                lightning: Current_Weather.weather.minutely[0].lightning, //현재 낙뢰
                                warning: Current_Weather.common.alertYn, //현재 특보 유무
                                typhoon: Current_Weather.common.stormYn, //현재 태풍
                                time: Current_Weather.weather.minutely[0].timeObservation, // 불러온 시각
                                death_prob: 0 //확률
                            }
                            console.log("callback")
                            console.log(info);
                            
                            //  ------------------------------ death_prob 정의 ------------------------------

                            info.death_prob += info.sky.substr(5)*1  //하늘 상태에 따라 확률 증가
    
                            if(info.lightning===1)    //낙뢰시에 확률 증가
                                info.death_prob += 10;
                            if(info.typhoon === "Y")   //태풍시에 확률 증가
                                info.death_prob += 10;
                            if(info.warning === "Y") // 특보 발령시 확률 증가
                                info.death_prob += 5
    
                            //죽을 확률 계산(내맘대로 커스텀)
                            info.death_prob =( 
                                (info.heat/8) + (Math.abs(info.sensible_temperature-15)/2) + (info.discomport/10) + (info.UV/5)
                                + (info.windspd*3) + (info.rain/10) + (Math.abs(info.current_temperature-15)/2) 
                            );

                            //이벤트 기반으로 일정 시간 간격으로 클라이언트에게 보낼 정보 
                            client_send={
                                time : info.time,
                                wind : info.windspd,
                                temperature : info.current_temperature,
                                rain : info.rain,
                                death : info.death_prob
                            };

                            //만약 날이 너무 안좋아서 확률이 100을 넘긴다면 100으로 예외처리
                            if(client_send.death>=100){
                                client_send.death=100;
                            }

                            console.log(client_send)
                        } catch (err) {  //promise err or try err catch
                            console.log("================Error Occured !!================\n",err);
                        }
                    }
                    API_bundle();

                    //     //db에 저장
                    //     sql="INSERT INTO weatherInfo (time,wind,temperature,rain,prob) VALUES (?,?,?,?,?)";
                    //     db.query(sql,[client_send.time,client_send.wind,client_send.temperature,client_send.rain,client_send.death],(err,result)=>{
                    //         if(err) console.log(err);
                    //         socket.emit("weatherInfo_minutely_send_to_client",client_send); // 클라이언트에게 정보 담아서 이벤트 발산
                    //     })
                    // }, 1* 1000); //1분마다 호출
                });

                socket.on('disconnecting', (reason) => {
                    clearInterval(API_CALL); //연결 종료시 해제
                })
            })
        }
