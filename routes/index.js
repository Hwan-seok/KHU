var express = require('express');
var router = express.Router();
var db = require('../lib/db');

/* GET home page. */
router.get('/', function(req, res, next) {

  // 렌더링 변수
  var time = new Array(); // 타임스탬프
  var ptArr = new Array(); // 현재 온도
  var wsArr = new Array(); // 풍속
  var rainArr = new Array(); // 강우량
  var probArr = new Array(); // 사망 확률
  var empty = 0; // 초기값 유뮤, 0 : 자료 있음, 1 : 자료 없음
  var sql = ""; // 쿼리
  var index;

  // 이전 10분간 데이터 찾기

    sql = "SELECT * FROM weatherInfo WHERE time >= DATE_FORMAT(DATE_ADD(now(), INTERVAL -10 MINUTE), '%Y-%m-%d %H:%i:%s')";

    db.query(sql, function(err, rows, fields){
      if (err) {
        console.log(err);
      } else {
        if (rows.length != 10) {
          empty = 1;
        } else {
          probArr.push(rows[0].prob);
          time.push(rows[0].time);
          ptArr.push(rows[0].temperature);
          wsArr.push(rows[0].wind);
          rainArr.push(rows[0].rain);
        }

        res.render('index', {
          empty,
          time,
          ptArr,
          wsArr,
          rainArr,
          probArr
        });
      }
    })
});

module.exports = router;
