
module.exports = function(spec) {
    let image = spec.image
    let plainFile = spec.plainFile
    let key = spec.key
    
    console.log(image, plainFile, key)

    return image
}