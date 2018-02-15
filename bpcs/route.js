var express = require('express');
var multer = require('multer')
var router = express.Router();

var upload = multer({ dest: 'uploads/' })

var retrieveParam = upload.fields([
    {name: 'image'}
])
router.post('/stego/retrieve', retrieveParam, require('./index').retrieve)

var insertParam = upload.fields([
    {name: 'image'},
    {name: 'plainFile'}
])
router.post('/stego/insert', insertParam, require('./index').insert)

module.exports = router;
