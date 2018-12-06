const secret_key = require('../keys/api_option').key;
const requesting = require('request');

module.exports = (io) => {
    let info = {}
    setInterval(() => {
        requesting.get({
                // api를 요청할 주소 -- 시크릿키,위도,경도 입력
                url: `https://api2.sktelecom.com/weather/current/minutely?appKey=${secret_key}&lat=37.239795&lon=127.083240`,
                json: true
            },
            //api에게 응답 받았을때 실행되는 callback func
            function (err, api_res, api_body) {
                if (err) throw err;
                // api의 대답이 있을경우 실행
                if (api_res) {
                    console.log(api_body);
                    io.emit("new_info_in", info) // api 호출 정보 클라이언트에게 전송
                }
            });
    }, 60 * 1000); //1분마다 호출
}