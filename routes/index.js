var express = require('express');
var multer = require('multer')

var router = express.Router();

var upload = multer({ dest: 'uploads/' })

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/stego', require('../bpcs/route'))

module.exports = router;
