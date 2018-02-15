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

    let threshold = Math.abs(Number(req.body.threshold))
    if (!threshold)
        threshold = 0.5
    if (threshold > 1)
        threshold = 1.0

    let outputMimeType = req.body.outputType
    if (!outputMimeType)
        outputMimeType = 'image/bmp'
        
    bpcs({
        'image': stegoImage,
        'plainFile': plainFile,
        'key': key,
        'threshold': threshold
    }).then((img) => {
        img.getBuffer(outputMimeType, function(err, buffer) {
            res.set("Content-Type", outputMimeType);
            res.send(buffer);
        })
    }).catch(error => {
        res.status(500).send(error)
    })
}