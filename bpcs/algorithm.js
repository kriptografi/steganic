var jimp = require('jimp')
var bluebird = require('bluebird')
var fs = bluebird.promisifyAll(require('fs'))
var util = require('./util')

var conjugate = util.conjugate
var pbcToCgc = util.pbcToCgc
var cgcToPbc = util.cgcToPbc
var complexity = util.complexity
var intToArray = util.intToArray
var arrayToInt = util.arrayToInt
var generateBitplane = util.generateBitplane
var putBitplane = util.putBitplane

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
            'messageCapacity': Math.floor(count * 512.0 / 519.0 - 4)
        }
    })
}

function insert(spec) {
    let image = spec.image
    let plainFile = spec.plainFile
    let key = spec.key
    let threshold = spec.threshold ? spec.threshold : 0.5
    let usingCgc = spec.usingCgc ? spec.usingCgc : false

    let imageBuffer = undefined
    let dataBuffer = undefined
    let width = 0
    let height = 0
    
    return jimp.read(image.path).then(img => {
        // preparing jimp image (convert file to image)
        imageBuffer = img
        width = imageBuffer.bitmap.width
        height = imageBuffer.bitmap.height
    })
    .then(() => {
        // read message file
        return fs.readFileAsync(plainFile.path)
    })
    .then((buffer) => {
        buffer = vigenereEncrypt(buffer,key)

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
        return imageBuffer
    })
}

function retrieve(spec) {
    let image = spec.image
    let key = spec.key
    let threshold = spec.threshold ? spec.threshold : 0.5
    let usingCgc = spec.usingCgc ? spec.usingCgc : false

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

        return vigenereDecrypt(actualMessage, key)
    })
}

function vigenereEncrypt(plaintext, key){
    let ciphertext = Buffer.alloc(plaintext.length)
    let j = 0
    
    for(let i = 0; i < plaintext.length; i++){
        ciphertext[i] = (plaintext[i] + key.charCodeAt(j)) % 256
        j++
        j = j % key.length
    }
    return ciphertext
}

function vigenereDecrypt(ciphertext, key){
    let plaintext = Buffer.alloc(ciphertext.length)
    let j = 0

    for(let i = 0; i < ciphertext.length; i++){
        let x = ciphertext[i] - key.charCodeAt(j)
        if(x < 0){
            x = 256 - (key.charCodeAt(j) - ciphertext[i]) % 256
        }else{
            x = x % 256
        }

        plaintext[i] = x
        j++
        j = j % key.length
    }
    
    return plaintext
}

module.exports = {status, insert, vigenereEncrypt, vigenereDecrypt, retrieve}