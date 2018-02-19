var jimp = require('jimp')

function calculateMSE(buffer1, buffer2) {
    let bufferLength = buffer1.length
    let sum = 0

    for (let i = 0; i < bufferLength; i++) {
        sum += Math.pow(buffer1[i]-buffer2[i], 2)
    }

    return sum / bufferLength
}

function calculate(image1, image2) {
    let width = image1.bitmap.width
    let height = image1.bitmap.height
    
    let bufferRed1 = []
    let bufferRed2 = []
    let bufferGreen1 = []
    let bufferGreen2 = []
    let bufferBlue1 = []
    let bufferBlue2 = []
    let bufferAlpha1 = []
    let bufferAlpha2 = []
    
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let color1 = jimp.intToRGBA(image1.getPixelColor(i,j))
            let color2 = jimp.intToRGBA(image2.getPixelColor(i,j))
            
            bufferRed1.push(color1.r)
            bufferRed2.push(color2.r)
            bufferGreen1.push(color1.g)
            bufferGreen2.push(color2.g)
            bufferBlue1.push(color1.b)
            bufferBlue2.push(color2.b)
            bufferAlpha1.push(color1.a)
            bufferAlpha2.push(color2.a)
        }   
    }

    let mseRed = calculateMSE(bufferRed1, bufferRed2)
    let mseGreen = calculateMSE(bufferGreen1, bufferGreen2)
    let mseBlue = calculateMSE(bufferBlue1, bufferBlue2)
    let mseAlpha = calculateMSE(bufferAlpha1, bufferAlpha2)

    let mse = (mseRed + mseGreen + mseBlue + mseAlpha) / 4

    return 20*Math.log10(255) - 10*Math.log1p(mse)
}

module.exports = {calculate}