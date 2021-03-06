var jimp = require('jimp')

function generateBitplane(image, x, y, bitplane) {
    result = []
    for (let i = 0; i < 8; i++) {
        result.push([])
        for (let j = 0; j < 8; j++)
            result[i].push((image.getPixelColor(x + j, y + i) & (1<<bitplane)) ? 1 : 0)
    }
    return result
}

function putBitplane(image, x, y, layer, bitplane) {
    for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++) {
            let color = image.getPixelColor(x + j, y + i)
            if (bitplane[i][j])
                color |= 1 << layer
            else
                color &= ~(1 << layer)
            image.setPixelColor(color, x + j, y + i)
        }
}

function conjugate(bitplane) {
    let result = []
    for (let i = 0; i < 8; i++) {
        result[i] = []
        for (let j = 0; j < 8; j++)
            result[i].push(bitplane[i][j] ^ (i % 2) ^ (j % 2))
    }
    return result
}

function pbcToCgc(image) {
    for (let i = 0; i < image.bitmap.height; i++) {
        let before = 0
        for (let j = 0; j < image.bitmap.width; j++) {
            let current = image.getPixelColor(j, i)
            image.setPixelColor(before ^ current, j, i)
            before = current
        }
    }
}

function cgcToPbc(image) {
    for (let i = 0; i < image.bitmap.height; i++)
        for (let j = 0; j < image.bitmap.width; j++) {
            let before = j > 0 ? image.getPixelColor(j - 1, i) : 0
            let current = image.getPixelColor(j, i)
            image.setPixelColor(before ^ current, j, i)
        }
}

function complexity(bitplane) {
    let diff = 0
    for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++) {
            if (i > 0 && bitplane[i-1][j] != bitplane[i][j])
                diff++;
            if (i < 8 - 1 && bitplane[i+1][j] != bitplane[i][j])
                diff++;
            if (j > 0 && bitplane[i][j-1] != bitplane[i][j])
                diff++;
            if (j < 8 - 1 && bitplane[i][j+1] != bitplane[i][j])
                diff++;
        }
    return diff / 224
}

function intToArray(number, size = 8) {
    let array = []
    for (let i = 0; i < size; i++)
        array.push((number >> i) & 1)
    return array
}

function arrayToInt(array) {
    let num = 0
    for (let i = 0; i < array.length; i++)
        num |= array[i] << i
    return num
}

function generateSeed(key){
    let seed = 0
    for (let i = 0; i < key.length; i++)
        seed = seed*7 + key.charCodeAt(i)
    return seed
}

function RandomNumber(seed) {
    this.seedNum = seed % 2147483647
    if (this.seedNum <= 0) 
        this.seedNum += 2147483646
    
    this.lastNum = 15
    this.seedA = 0
    this.seedB = 0
    for (let i = 0; i < 32; i++)
        if (this.seedNum & (1 << i)) {
            if (i % 2 == 0)
                this.seedA |= 1 << Math.floor(i / 2)
            else
                this.seedB |= 1 << Math.floor(i / 2)
        }

    this.next = function() {
        this.lastNum = Math.round(Math.abs((this.lastNum * this.seedA + this.seedB) % 2147483647))
        return this.lastNum
    }.bind(this)
}

function randomShuffle(arr, randomizer) {
    for (let i = 0; i < arr.length; i++) {
        let pos = randomizer() % (arr.length - i)
        if (pos > 0) {
            let temp = arr[i]
            arr[i] = arr[pos + i]
            arr[pos + i] = temp
        }
    }
    return arr
}

function copyImage(image) {
    return new jimp(image.bitmap.width, image.bitmap.height, function(err, im) {
        for (let i = 0; i < image.bitmap.height; i++)
            for (let j = 0; j < image.bitmap.width; j++)
                im.setPixelColor(image.getPixelColor(j,i), j, i)
    })
}

module.exports = { generateBitplane, putBitplane, conjugate, pbcToCgc, cgcToPbc, complexity, intToArray, arrayToInt, copyImage, generateSeed, randomShuffle, RandomNumber }