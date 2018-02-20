var jimp = require('jimp')
var bluebird = require('bluebird')
var fs = bluebird.promisifyAll(require('fs'))
var util = require('./util')
var psnr = require('./psnr')
var cipher = require('./cipher')

var conjugate = util.conjugate
var pbcToCgc = util.pbcToCgc
var cgcToPbc = util.cgcToPbc
var complexity = util.complexity
var intToArray = util.intToArray
var arrayToInt = util.arrayToInt
var generateBitplane = util.generateBitplane
var putBitplane = util.putBitplane
var copyImage = util.copyImage
var calculatePSNR = psnr.calculate

function status(spec) {
    let image = spec.image
    let threshold = spec.threshold

    return jimp.read(image.path).then(img => {
        let width = img.bitmap.width
        let height = img.bitmap.height

        for (let blockI = 0; blockI + 8 <= height; blockI += 8)
            for (let blockJ = 0; blockJ + 8 <= width; blockJ += 8)
                for (let bitplaneI = 0; bitplaneI < 32; bitplaneI++) {
                    let bitplane = generateBitplane(imageBuffer, blockJ, blockI, bitplaneI)
                    if (complexity(bitplane) > threshold)
                        count++
                }
        
        return {
            'capacity': count * 8,
            'messageCapacity': Math.floor(8 * count - 4 - 4/7)*7/8
        }
    })
}

function insert(spec) {
    let image = spec.image
    let plainFile = spec.plainFile
    let key = spec.key
    let threshold = spec.threshold ? spec.threshold : 0.5
    let usingCgc = spec.usingCgc ? spec.usingCgc : false
    let usingEncrypt = spec.usingEncryption ? spec.usingEncryption : false
    let usingRandom = spec.usingRandomBlock ? spec.usingRandomBlock : false

    let initialImageBuffer = undefined
    let imageBuffer = undefined
    let dataBuffer = undefined
    let width = 0
    let height = 0
    
    return jimp.read(image.path).then(img => {
        // preparing jimp image (convert file to image)
        imageBuffer = img
        initialImageBuffer = copyImage(imageBuffer)
        width = imageBuffer.bitmap.width
        height = imageBuffer.bitmap.height
    })
    .then(() => {
        // read message file
        return fs.readFileAsync(plainFile.path)
    })
    .then(buffer => {
        let filename = plainFile.originalname
        let dataBuffer = Buffer.alloc(buffer.length + filename.length + 1)
        buffer.copy(dataBuffer, filename.length + 1)
        dataBuffer.write(filename)
        dataBuffer.writeUInt8(0, filename.length)

        return dataBuffer
    })
    .then(buffer => {
        if (usingEncrypt)
            buffer = cipher.vigenereEncrypt(buffer,key)

        dataBuffer = Buffer.alloc(buffer.length + 4, 0)
        dataBuffer.writeInt32BE(buffer.length)
        buffer.copy(dataBuffer, 4)

        return dataBuffer
    })
    .then(dataBuffer => {
        let count = 0
        let messageI = 0
        
        if (usingCgc)
            pbcToCgc(imageBuffer)

        for (let blockI = 0; blockI + 8 <= height; blockI += 8)
            for (let blockJ = 0; blockJ + 8 <= width; blockJ += 8)
                for (let bitplaneI = 0; bitplaneI < 32; bitplaneI++) {
                    // generate bitplane
                    let bitplane = generateBitplane(imageBuffer, blockJ, blockI, bitplaneI)

                    // insert message if noisy
                    if (complexity(bitplane) > threshold) {
                        count++

                        bitplaneI[0] = intToArray(0xff, 8)
                        for (let i = 1; i < 8; i++) {
                            let mess = dataBuffer.length > messageI ? dataBuffer.readUInt8(messageI) : 0
                            for (let j = 0; j < 8; j++)
                                bitplane[i][j] = (mess & (1<<j)) ? 1 : 0
                            messageI++
                        }

                        if (complexity(bitplane) <= threshold)
                            bitplane = conjugate(bitplane)
                    }

                    // flush bitplane to image
                    putBitplane(imageBuffer, blockJ, blockI, bitplaneI, bitplane)
                }

        if (usingCgc)
            cgcToPbc(imageBuffer)

        if (count < dataBuffer.length)
            return Promise.reject('image too small')

        let psnr = calculatePSNR(initialImageBuffer, imageBuffer)   

        return {result: imageBuffer, quality: psnr}
    })
}

function retrieve(spec) {
    let image = spec.image
    let key = spec.key
    let threshold = spec.threshold ? spec.threshold : 0.5
    let usingCgc = spec.usingCgc ? spec.usingCgc : false
    let usingDecrypt = spec.usingDecryption ? spec.usingDecryption : false
    let usingRandom = spec.usingRandomBlock ? spec.usingRandomBlock : false

    let imageBuffer = undefined
    let width = 0
    let height = 0

    return jimp.read(image.path).then(img => {
        // preparing jimp image (convert file to image)
        imageBuffer = img
        width = imageBuffer.bitmap.width
        height = imageBuffer.bitmap.height
    })
    .then(() => {
        let plainMessage = []

        if (usingCgc)
            pbcToCgc(imageBuffer)

        for (let blockI = 0; blockI + 8 <= height; blockI += 8)
            for (let blockJ = 0; blockJ + 8 <= width; blockJ += 8)
                for (let bitplaneI = 0; bitplaneI < 32; bitplaneI++) {
                    // generate bitplane
                    let bitplane = generateBitplane(imageBuffer, blockJ, blockI, bitplaneI)

                    // retrieve message if noisy
                    if (complexity(bitplane) > threshold) {
                        if (arrayToInt(bitplane[0]) != 0xff)
                            bitplane = conjugate(bitplane)
                        for (let i = 1; i < 8; i++)
                            plainMessage.push(arrayToInt(bitplane[i]))
                    }
                }
        
        let messageBuffer = Buffer.from(plainMessage)
        let messageSize = messageBuffer.readUInt32BE(0)
        let actualMessage = Buffer.alloc(messageSize, 0)

        messageBuffer.copy(actualMessage, 0, 4)

        return usingDecrypt ? cipher.vigenereDecrypt(actualMessage, key) : actualMessage
    }).then(buffer => {
        let filename = ''
        let filenameSize = 0
        for(filenameSize = 0; filenameSize < 256 && filenameSize < buffer.length; filenameSize++) {
            let byte = buffer.readUInt8(filenameSize)
            if (byte == 0) {
                break
            } else
                filename += String.fromCharCode(byte)
        }

        return {
            filename,
            message: buffer.slice(filenameSize + 1)
        }
    })
}

module.exports = {status, insert, retrieve}