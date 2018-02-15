function conjugate(bitplane) {
    let result = []
    for (let i = 0; i < 8; i++) {
        result[i] = []
        for (let j = 0; j < 8; j++)
            result[i].push(bitplane[i][j] ^ (i % 2) ^ (j % 2))
    }
    return result
}

function pbcToCgc(bitplane) {
    let result = []
    for (let i = 0; i < 8; i++) {
        result.push([bitplane[i][0]])
        for (let j = 1; j < 8; j++)
            result[i].push(bitplane[i][j] ^ bitplane[i][j-1])
    }
    return result
}

function cgcToPbc(bitplane) {
    let result = []
    for (let i = 0; i < 8; i++) {
        result.push([bitplane[i][0]])
        for (let j = 1; j < 8; j++)
            result[i].push(bitplane[i][j] ^ result[i][j-1])
    }
    return result
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

module.exports = { conjugate, pbcToCgc, cgcToPbc, complexity, intToArray }