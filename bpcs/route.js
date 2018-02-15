var express = require('express')
var multer = require('multer')
var autoreap = require('multer-autoreap')
var router = express.Router()

var upload = multer({ dest: 'uploads/' })

var retrieveParam = upload.fields([
    {name: 'image'}
])
router.post('/stego/retrieve', retrieveParam, require('./index').retrieve, autoreap)

var insertParam = upload.fields([
    {name: 'image'},
    {name: 'plainFile'}
])
router.post('/stego/insert', insertParam, require('./index').insert, autoreap)

module.exports = router;
