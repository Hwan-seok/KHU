var express = require('express');
var router = express.Router();
var mysql = require('mysql');

/* GET home page. */
router.get('/', function(req, res, next) {

  // connection.query('SELECT * FROM ');

  // 자외선지수, 불쾌지수, 열지수, 체감 온도, 바람속도, 현재기온, 하늘 상태, 강우량, 태풍, 낙뢰
  var uvr, discomfort, heat, sensibleTem, windSpeed, presentTem, skyState, rainfall, typhoon, lightning;
  // 사망 확률
  var deathProb;

  deathProb = uvr + discomfort + heat + sensibleTem + windSpeed + presentTem + skyState + rainfall + typhoon + lightning;
  res.render('index', {title: 'Express'});
});

module.exports = router;
