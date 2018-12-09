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
  var index;

  // 이전 10분간 데이터 찾기
  sql = "SELECT * FROM weatherInfo WHERE time >= DATE_FORMAT(DATE_ADD(now(), INTERVAL -10 MINUTE), '%Y-%m-%d %H:%i:%s')";
  db.query(sql, function(err, rows, fields){
  if (err) {
    console.log(err);
  } else {
    if (rows.length == 0) {
      empty = 1;
    } else {
      dataLen = rows.length;
      for (index = 0; index < rows.length; index++){
        var temp = rows[index].time.getMinutesBetween(newDate);

        if(temp == index){
          probArr.push(rows[index].prob);
          time.push(rows[index].time);
          ptArr.push(rows[index].temperature);
          wsArr.push(rows[index].wind);
          rainArr.push(rows[index].rain);
        }
        else {
          empty = 1;
          break;
        }
      }

      if (empty == 1 && probArr.length != 0)
        empty = 0;
      }

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
