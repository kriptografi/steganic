
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

function tooglePbcCgc(bitplane) {
    let height = bitplane.length
    if (height <= 0)
        return 0
    let width = bitplane[0].length

    let result = []
    for (let i = 0; i < height; i++) {
        result[i] = [bitplane[i][0]]
        for (let j = 1; j < width; j++)
            result[i].push(bitplane[i][j] ^ bitplane[i][j-1])
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

    let width = image.bitmap.width
    let height = image.bitmap.height

    for (let i = 0; i < height; i++)
        for (let j = 0; j < width; j++)
            image.setPixelColor(0x000000, j, i)

    return image
}