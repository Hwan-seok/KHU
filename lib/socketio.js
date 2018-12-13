const db = require('./db.js');
const secret_key = require('../keys/api_option').key;
const requesting = require('request');
const lat = "37.239795";
const lon = "127.083240";
module.exports = (server, app) => {

    const io = require('socket.io')(server, {
        transports: ['websocket'] // websocket 사용시 polling 사용을 배제하고 안정적인 websocket만 사용함
    });
    //명시적 형 선언 
    let Current_Weather = {};
    let Sensible_T = {};
    let Heat_index = {};
    let Discomport_index = {};
    let Ultra_Violet_index = {};
    let sending_to_client_info = {};
    let client_send = {};
    let client_name = "";
    let client_birth ;
    let Destiny;
    let sql;

    let info = {}

    const req_API = (when, what) => {
        //async await 사용하기 위하여 promise 사용
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
                        console.log("calling api");
                        resolve(api_body);
                    }
                });
        })

    }
    const API_bundle = async () => {

        try {
            Current_Weather = await req_API("current", "minutely"); //현재날씨 (분별)
            Sensible_T = await req_API("index", "wct"); //체감온도
            Heat_index = await req_API("index", "heat"); //열지수
            Discomport_index = await req_API("index", "th"); //불쾌지수
            Ultra_Violet_index = await req_API("index", "uv"); //자외선지수

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
            console.log("API INFO \n", info);

            //  ------------------------------ death_prob 정의 ------------------------------

            info.death_prob += info.sky.substr(5) * 1  //하늘 상태에 따라 확률 증가

            if (info.lightning === 1)    //낙뢰시에 확률 증가
                info.death_prob += 1.5;
            if (info.typhoon === "Y")   //태풍시에 확률 증가
                info.death_prob += 1.5;
            if (info.warning === "Y") // 특보 발령시 확률 증가
                info.death_prob += 1

            //죽을 확률 계산(내맘대로 커스텀)
            info.death_prob = (
                (info.heat / 50) + (Math.abs(info.sensible_temperature - 15) / 10) + (info.discomport / 10) + (info.UV / 10)
                + info.windspd*1 + (info.rain / 10) + (Math.abs(info.current_temperature - 15) / 10)
            );

            //이벤트 기반으로 일정 시간 간격으로 클라이언트에게 보낼 정보 
            client_send = {
                time: info.time,
                wind: info.windspd,
                temperature: info.current_temperature,
                rain: info.rain,
                death: info.death_prob
            };
            function getRandom_add_prob(min, max) {
                return Math.random() * (max - min) + min;
              }
              

              // 심장이 크게 뛰며 확률이 증가하거나 감소 할 수 있음
               Math.random() * 2 >= 1  ?  client_send.death += getRandom_add_prob(0,5) :  client_send.death -= getRandom_add_prob(0,5) ;
               
               
               //운명의 장난으로 죽을 확률이 증가하거나 감소함 
              const rand = Math.floor(Math.random() * 6) //생년월일 중 한자리 뽑음
              
              Destiny=client_birth.charAt(rand)/3;  //명시적 형 변환
              if(Destiny==0)Destiny=1; //사용자 잘못 입력했을때 예외처리
               Math.random() * 2 >= 1  ?  client_send.death += Destiny :  client_send.death -= Destiny ;


            //만약 날이 너무 안좋아서 확률이 100을 넘긴다면 100으로 예외처리
            if (client_send.death >= 100) {
                client_send.death = 100;
            }

            console.log("client send data \n",client_send)
              
            app.get("socket").emit("weatherInfo_minutely_send_to_client", client_send); // 클라이언트에게 정보 담아서 이벤트 발산
            console.log("emit");

            //db에 저장
            sql = "INSERT INTO weatherInfo (time,wind,temperature,rain,prob) VALUES (?,?,?,?,?)";
            db.query(sql, [client_send.time, client_send.wind, client_send.temperature, client_send.rain, client_send.death], (err, result) => {
                if (err) console.log(err);
            })
        } catch (err) {  //promise err or try err catch
            console.log("================Error Occured !!================\n", err);
        }
    }

    let call_interval;

    const Start_Interval = (second, CALL) => {
        CALL(); //처음 불러올때 한번 호출하고
        call_interval = setInterval(CALL, second * 1000); //그 후에 1분마다 호출
    }   

    io.on('connection', (socket) => { //프론트와 소켓 연결시 이벤트 루프 동작

        app.set("socket", socket);
        socket.on("connection", (client_data) => {
            console.log("SOCKET CONNECTED");
            client_name = client_data.name;
            client_birth = client_data.birth;  
            Start_Interval(60, API_bundle); //소켓 연결후 interval 활성화하여 1분마다 API 호출

        });

        socket.on('disconnect', (reason) => {
            console.log("disconnected");
            clearInterval(call_interval); //연결 종료시 interval 해제
        })
    })

}
