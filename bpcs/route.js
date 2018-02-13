var express = require('express');
var multer = require('multer')
var router = express.Router();

var upload = multer({ dest: 'uploads/' })

var insertParam = upload.fields([
    {name: 'image'},
    {name: 'plainFile'}
])
router.post('/stego',  insertParam, require('./index'))

module.exports = router;
