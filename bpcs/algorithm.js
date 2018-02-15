
function setBit(bit, i) {
    return bit |= 1 << i
}

function unsetBit(bit, i) {
    return bit &= ~(1 << i)
}

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

module.exports = function(spec) {
    console.log(spec)

    let image = spec.image
    let plainData = spec.data
    let key = spec.key
    let threshold = 0.3

    let width = image.bitmap.width
    let height = image.bitmap.height

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
                        color = image.getPixelColor(blockI + i, blockJ + j)
                        if (color & (1 << bitplaneI))
                            bitplane[i][j] = 1
                    }
                }

                // convert to cgc, this is optional actually
                bitplane = pbcToCgc(bitplane)

                // // insert message if noisy
                // if (complexity(bitplane) > threshold) {
                //     count++

                //     for (let i = 0; i < 8; i++) {
                //         let mess = plainData.length > messageI ? plainData.readInt8(messageI) : 0
                //         for (let j = 0; j < 8; j++)
                //             bitplane[i][j] = mess & (1<<j) ? 1 : 0
                //         messageI++
                //     }

                //     if (complexity(bitplane) <= threshold)
                //         bitplane = conjugate(bitplane)
                // }

                // convert back to pbc, optional
                bitplane = cgcToPbc(bitplane)

                // flush bitplane to image
                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {
                        color = image.getPixelColor(blockI + i, blockJ + j) & ~(1 << bitplaneI)
                        if (bitplane[i][j])
                            color |= 1 << bitplaneI
                        image.setPixelColor(color, blockI + i, blockJ + j)
                    }
                }
            }

    return image
}