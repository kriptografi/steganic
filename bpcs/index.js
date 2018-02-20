var bpcs = require('./algorithm')

function insert(req, res, next) {
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
        
    bpcs.insert({
        'image': stegoImage,
        'plainFile': plainFile,
        'key': key,
        'threshold': threshold,
        'usingEncryption': req.body.usingEncryption,
        'usingRandomBlock': req.body.usingRandomBlock
    }).then((img) => {
        img.result.getBuffer(outputMimeType, function(err, buffer) {
            res.set("Content-Type", outputMimeType);
            res.set("X-Steganic-PSNR", img.quality)
            res.send(buffer);
        })
    }).catch(error => {
        console.log(error)
        res.status(500).send(error)
    })
}

function retrieve(req, res, next) {
    let stegoImage = req.files['image'][0]
    if (!stegoImage) {
        res.status(500).send('Must provide image file')
        return
    }

    let key = req.body.key
    if (!key) {
        res.status(500).send('Must specify key')
        return
    }

    let threshold = Number(req.body.threshold)
    if (!threshold || threshold < 0 || threshold > 1) {
        res.status(500).send('Invalid threshold value')
        return
    }
        
    bpcs.retrieve({
        'image': stegoImage,
        'key': key,
        'threshold': threshold,
        'usingDecryption': req.body.usingDecryption,
        'usingRandomBlock': req.body.usingRandomBlock
    }).then((buffer) => {
        res.header('Content-Type', 'application/x-binary')
        res.header('X-Steganic-Filename', buffer.filename)
        res.send(buffer.message)
    }).catch(error => {
        res.status(500).send(error)
    })
}

module.exports = {insert, retrieve}