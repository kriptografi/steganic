var jimp = require('jimp')
var bluebird = require('bluebird')
var fs = bluebird.promisifyAll(require('fs'))
var bpcs = require('./algorithm')

module.exports = function (req, res, next) {
    let stegoImage = req.files['image'][0]
    if (!stegoImage) {
        res.status(500).send('Must provide image file')
        return
    }
    
    let plainFile = req.files['plainFile'][0]
    if (!plainFile) {
        res.status(500).send('Must specify file to insert')
        return
    }

    let key = req.body.key
    if (!key) {
        res.status(500).send('Must specify key')
        return
    }

    let outputMimeType = req.body.outputType
    if (!outputMimeType)
        outputMimeType = 'image/bmp'
    if (outputMimeType == 'image/png')
        outputMimeType = jimp.MIME_PNG
    else
        outputMimeType = jimp.MIME_BMP
        
    jimp.read(stegoImage.path)
    .then(function(plainFile, key, img) {
        return fs.readFileAsync(plainFile.path).then(function (img, key, data) {
            return {'image': img, data, key}
        }.bind(this, img, key))
    }.bind(this, plainFile, key))
    .then(bpcs)
    .then(function(outputMimeType, img) {
        img.getBuffer(outputMimeType, function(err, buffer) {
            res.set("Content-Type", outputMimeType);
            res.send(buffer);
        })
    }.bind(this, outputMimeType))
}