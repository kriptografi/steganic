
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