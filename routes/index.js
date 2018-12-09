var express = require('express');
var router = express.Router();
var db = require('../lib/db');

/* GET home page. */
router.get('/', function(req, res, next) {
  // 자외선지수, 불쾌지수, 열지수, 체감 온도, 바람속도, 현재기온, 하늘 상태, 강우량, 태풍, 낙뢰, 특보, 현재 시간
  var uvr, discomfort, heat, sensibleTem, windSpeed, presentTem, skyState, rainfall, typhoon, lightning, alert, time;

  // 쿼리문
  var sql = 'SELECT * FROM kkonzi_test.weatherInfo WHERE kkonzi_test.time > DATE_FORMAT(DATE_ADD(now(), INTERVAL -1 MINUTE), "%Y-%m-%d %H:%i:%s")'';
  db.query(sql, function(err, rows, fields){
    if (err) {
      console.log(err);
    } else {
      if (rows.length == 0){

      }
      else {

      }
      var tmp = rows.length - 1;
      time = rows[temp].time;
      uvr = rows[temp].UV;
      discomfort = rows[temp].discomfort;
      heat = rows[temp].heat;
      sensibleTem = rows[temp].SensibleT;
      windSpeed = rows[temp].wspd;
      presentTem = rows[temp].CurrentT;
      skyState = rows[temp].sky;
      rainfall = rows[temp].rain;
      typhoon = rows[temp].typhoon;
      lightning = rows[temp].lightning;
      alert = rows[temp].alert;
    }
  })

  res.render('index', {title: 'Express'});
});

module.exports = router;
