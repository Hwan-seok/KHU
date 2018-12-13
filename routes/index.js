var express = require('express');
var router = express.Router();
var db = require('../lib/db');

/* GET home page. */

router.post('/starting' , (req,res) => {
  res.redirect(`/name/${req.body.name}/birth/${req.body.birth}`);
})
router.get('/name/:name/birth/:birth', (req,res) => {
  
  // 렌더링 변수
  var time = new Array(); // 타임스탬프
  var ptArr = new Array(); // 현재 온도
  var wsArr = new Array(); // 풍속
  var rainArr = new Array(); // 강우량
  var probArr = new Array(); // 사망 확률
  var dataLen = 0; // 데이터 개수
  var empty = 0; // 초기값 유뮤, 0 : 자료 있음, 1 : 자료 없음
  var sql = ""; // 쿼리
  var count = 0;
  const name = req.params.name;
  const birth = req.params.birth;

  // 이전 10분간 데이터 찾기
  sql = "SELECT * FROM weatherInfo WHERE time >= DATE_FORMAT(DATE_ADD(now(), INTERVAL -20 MINUTE), '%Y-%m-%d %H:%i:%s')";
  db.query(sql, function(err, rows, fields){
    if(err)
    {
      console.log(err);
    }
    else
    {
      if (rows.length == 0)
      {
        empty = 1;
      }
      else
      {
        for(var i = rows.length - 1; i >= 0; i--)
        {
          probArr.unshift(rows[i].prob);
          time.unshift(rows[i].time);
          ptArr.unshift(rows[i].temperature);
          wsArr.unshift(rows[i].wind);
          rainArr.unshift(rows[i].rain);
          count = count + 1;

          if (count == 10){
            break;
          }
        }
      }

      dataLen = probArr.length;
      res.render('index', {
        empty,
        time,
        ptArr,
        wsArr,
        rainArr,
        probArr,
        dataLen,
        name,
        birth
      });
    }
  });
} )
router.get('/', function(req, res, next) {
  res.render( 'main' );
});

module.exports = router;
