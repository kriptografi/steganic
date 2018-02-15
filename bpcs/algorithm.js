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
        // allocating message buffer
        // offset 0 : data length
        // offset 4 : conjugation map
        // rest of offset : actual data
        dataBuffer = Buffer.alloc(buffer.length + Math.ceil(buffer.length / 64) + 4)
        dataBuffer.writeInt32BE(buffer.length)
        buffer.copy(dataBuffer, 4 + Math.ceil(buffer.length / 64))

        // conjugate data
        for (let i = 0; i < buffer.length; i += 8) {
            let matrix = []
            for (let j = 0; j < 8; j++)
                matrix.push(intToArray(buffer[i*8+j]))

            if (complexity(matrix) <= threshold) {
                let mapItem = dataBuffer.readUInt8(4 + Math.floor(i / 8))
                mapItem |= (1 << (i % 8))
                dataBuffer.writeUInt8(mapItem, 4 + Math.floor(i / 8))
            }
        }
    })
    .then(() => {
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

                        for (let i = 0; i < 8; i++) {
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
        let count = 0
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
                        count++
                        bitplane = conjugate(bitplane)
                        for (let i = 0; i < 8; i++)
                            plainMessage.push(arrayToInt(bitplane[i]))
                    }
                }
        
        let messageBuffer = Buffer.from(plainMessage)
        let messageSize = messageBuffer.readUInt32BE(0)
        let payloadOffset = 4 + Math.ceil(messageSize / 64)

        let actualMessage = Buffer.alloc(messageSize, 0)
        messageBuffer.copy(actualMessage, 0, payloadOffset)
        // for (let i = 0; i < messageSize; i += 8) {
        //     let conjugationMap = messageBuffer.readUInt8(4 + Math.floor(i / 8))
            
        //     let messagePlane = []
        //     for (let j = 0; j < 8; j++) {
        //         let byte = ((i + j) < actualMessage.length) ? actualMessage.readUInt8(i + j) : 0
        //         messagePlane.push(intToArray(byte))
        //     }

        //     if ((conjugationMap >> (i % 8)) & 1) {
        //         messagePlane = conjugate(messagePlane)
        //         for (let j = 0; j < 8; j++)
        //             if ((i + j) < actualMessage.length)
        //                 actualMessage.writeUInt8(arrayToInt(messagePlane[j]), i + j)
        //     }
        // }

        return actualMessage
    })
}

module.exports = {insert, retrieve}