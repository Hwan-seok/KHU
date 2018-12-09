var express = require('express');
var router = express.Router();
var db = require('../lib/db');
require('date-utils');

var newDate = new Date();

/* GET home page. */
router.get('/', function(req, res, next) {

  // 렌더링 변수
  var time = new Array(); // 타임스탬프
  var ptArr = new Array(); // 현재 온도
  var wsArr = new Array(); // 풍속
  var rainArr = new Array(); // 강우량
  var probArr = new Array(); // 사망 확률
  var dataLen = 0; // 데이터 개수
  var empty = 0; // 초기값 유뮤, 0 : 자료 있음, 1 : 자료 없음
  var sql = ""; // 쿼리
  var index = 0;

  // 이전 10분간 데이터 찾기
  sql = "SELECT * FROM weatherInfo WHERE time >= DATE_FORMAT(DATE_ADD(now(), INTERVAL -10 MINUTE), '%Y-%m-%d %H:%i:%s')";
  db.query(sql, function(err, rows, fields){
  if (err) {
    console.log(err);
  } else {
    if (rows.length == 0) {
      empty = 1;
    } else {
      for (var i = rows.length - 1; i >= 0; i--){
        var temp = rows[i].time.getMinutesBetween(newDate);

        if(temp == index){
          probArr.unshift(rows[i].prob);
          time.unshift(rows[i].time);
          ptArr.unshift(rows[i].temperature);
          wsArr.unshift(rows[i].wind);
          rainArr.unshift(rows[i].rain);
          index = index + 1;
        }
        else {
          empty = 1;
          break;
        }
      }

      if (empty == 1 && probArr.length != 0)
        empty = 0;
      }

      dataLen = probArr.length;
      res.render('index', {
        empty,
        time,
        ptArr,
        wsArr,
        rainArr,
        probArr,
        dataLen
      });
    }
  })
});

module.exports = router;
