module.exports = function (req, res, next) {
    let stegoImage = req.files['image']
    if (!stegoImage) {
        res.status(500).send('Must provide image file')
        return
    }
    
    let plainFile = req.files['plainFile']
    if (!plainFile) {
        res.status(500).send('Must specify file to insert')
        return
    }

    let key = req.body.key
    if (!key) {
        res.status(500).send('Must specify key')
        return
    }

    let outputType = req.body.outputType
    if (!outputType)
        outputType = 'image/bmp'
    if (!['image/bmp', 'image/png'].includes(outputType))
        outputType = 'image/bmp'

    res.send('inserting image')
}