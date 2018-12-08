var express = require('express');
var router = express.Router();
var db = require('../lib/db')

/* GET home page. */
router.get('/', function(req, res, next) {
  // 자외선지수, 불쾌지수, 열지수, 체감 온도, 바람속도, 현재기온, 하늘 상태, 강우량, 태풍, 낙뢰
  var uvr, discomfort, heat, sensibleTem, windSpeed, presentTem, skyState, rainfall, typhoon, lightning;
  // 사망 확률
  var deathProb;

  // 쿼리문
  var sql = 'SELECT * FROM kkonzi_test.weatherInfo';
  db.query(sql, function(err, rows, fields){
    if (err) {
      console.log(err);
    } else {
      var tmp = rows.length - 1;
      uvr = rows[temp].uvr;
      discomfort = rows[temp].discomfort;
      heat = rows[temp].heat;
      sensibleTem = rows[temp].sensibleTem;
      windSpeed = rows[temp].windSpeed;
      presentTem = rows[temp].presentTem;
      skyState = rows[temp].skyState;
      rainfall = rows[temp].rainfall;
      typhoon = rows[temp].typhoon;
      lightning = rows[temp].lightning;
    }
  })

  deathProb = uvr + discomfort + heat + sensibleTem + windSpeed + presentTem + skyState + rainfall + typhoon + lightning;

  sql = 'INSERT INTO kkonzi_test.deathProb (prob) VALUES (?)';
  var params = deathProb;

  db.query(sql, function(err, rows, fields){
    if (err) {
      console.log(err);
    } else {
      console.log('Success!');
      }
    }
  })

  res.render('index', {title: 'Express'});
});

module.exports = router;
