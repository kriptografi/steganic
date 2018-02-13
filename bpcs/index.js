module.exports = function (req, res, next) {
    console.log(req.files['image'])
    console.log(req.files['plainFile'])
    console.log(req.body)
}