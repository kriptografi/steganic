var jimp = require('jimp')
var bluebird = require('bluebird')
var fs = bluebird.promisifyAll(require('fs'))

function conjugate(bitplane) {
    let height = bitplane.length
    if (height <= 0)
        return 0
    let width = bitplane[0].length

    let result = []
    for (let i = 0; i < height; i++) {
        result[i] = []
        for (let j = 0; j < width; j++)
            result[i].push(bitplane[i][j] ^ (i % 2) ^ (j % 2))
    }

    return result
}

function pbcToCgc(bitplane) {
    let height = bitplane.length
    if (height <= 0)
        return 0
    let width = bitplane[0].length

    let result = []
    for (let i = 0; i < height; i++) {
        result.push([bitplane[i][0]])
        for (let j = 1; j < width; j++)
            result[i].push(bitplane[i][j] ^ bitplane[i][j-1])
    }

    return result
}

function cgcToPbc(bitplane) {
    let height = bitplane.length
    if (height <= 0)
        return 0
    let width = bitplane[0].length

    let result = []
    for (let i = 0; i < height; i++) {
        result.push([bitplane[i][0]])
        for (let j = 1; j < width; j++)
            result[i].push(bitplane[i][j] ^ result[i][j-1])
    }

    return result
}

function complexity(bitplane) {
    let height = bitplane.length
    if (height <= 0)
        return 0
    let width = bitplane[0].length

    let diff = 0
    for (let i = 0; i < height; i++)
        for (let j = 0; j < width; j++) {
            if (i > 0 && bitplane[i-1][j] != bitplane[i][j])
                diff++;
            if (i < height - 1 && bitplane[i+1][j] != bitplane[i][j])
                diff++;
            if (j > 0 && bitplane[i][j-1] != bitplane[i][j])
                diff++;
            if (j < width - 1 && bitplane[i][j+1] != bitplane[i][j])
                diff++;
        }
    diff /= 2

    let total = height * (width - 1) + width * (height - 1)
    return diff / total
}

function intToArray(number, size = 8) {
    let array = []
    for (let i = 0; i < size; i++)
        array.push((number >> i) & 1)
    return array
}

module.exports = function(spec) {
    console.log(spec)

    let image = spec.image
    let plainFile = spec.plainFile
    let key = spec.key
    let threshold = spec.threshold ? spec.threshold : 0.5

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
                mapItem |= 1 << (i % 8)
                dataBuffer.writeUInt8(mapItem, 4 + Math.floor(i / 8))
            }
        }
    })
    .then(() => {
        let count = 0
        let messageI = 0

        for (let blockI = 0; blockI + 8 <= height; blockI += 8)
            for (let blockJ = 0; blockJ + 8 <= width; blockJ += 8)
                for (let bitplaneI = 0; bitplaneI < 32; bitplaneI++) {
                    // generate bitplane
                    let bitplane = []
                    for (let i = 0; i < 8; i++) {
                        bitplane.push([0,0,0,0,0,0,0,0])
                        for (let j = 0; j < 8; j++) {
                            color = imageBuffer.getPixelColor(blockI + i, blockJ + j)
                            if (color & (1 << bitplaneI))
                                bitplane[i][j] = 1
                        }
                    }

                    // convert to cgc, this is optional actually
                    bitplane = pbcToCgc(bitplane)

                    // insert message if noisy
                    if (complexity(bitplane) > threshold) {
                        count++

                        for (let i = 0; i < 8; i++) {
                            let mess = dataBuffer.length > messageI ? dataBuffer.readInt8(messageI) : 0
                            for (let j = 0; j < 8; j++)
                                bitplane[i][j] = mess & (1<<j) ? 1 : 0
                            messageI++
                        }

                        if (complexity(bitplane) <= threshold)
                            bitplane = conjugate(bitplane)
                    }

                    // convert back to pbc, optional
                    bitplane = cgcToPbc(bitplane)

                    // flush bitplane to image
                    for (let i = 0; i < 8; i++) {
                        for (let j = 0; j < 8; j++) {
                            color = imageBuffer.getPixelColor(blockI + i, blockJ + j) & ~(1 << bitplaneI)
                            if (bitplane[i][j])
                                color |= 1 << bitplaneI
                                imageBuffer.setPixelColor(color, blockI + i, blockJ + j)
                        }
                    }
                }
        
        if (count > dataBuffer.length)
            return Promise.reject('image too small')
        return imageBuffer
    })
    .then(() => {
        return imageBuffer
    })
}