import express from 'express';
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/index', function(req, res, next) {
  res.render('index');
});

router.get('/request_form', function(req, res, next) {
  res.render('request_form');
});

export default router;
