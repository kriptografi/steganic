var jimp = require('jimp')

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
        
    jimp.read(stegoImage.path).then(function(img) {
        // do stegano
        return img
    }).then(function(img) {
        img.getBuffer(outputMimeType, function(err, buffer) {
            res.set("Content-Type", outputMimeType);
            res.send(buffer);
        })
    })
}