function vigenereEncrypt(plaintext, key){
    let ciphertext = Buffer.alloc(plaintext.length)
    let j = 0
    
    for(let i = 0; i < plaintext.length; i++){
        ciphertext[i] = (plaintext[i] + key.charCodeAt(j)) % 256
        j++
        j = j % key.length
    }
    return ciphertext
}

function vigenereDecrypt(ciphertext, key){
    let plaintext = Buffer.alloc(ciphertext.length)
    let j = 0

    for(let i = 0; i < ciphertext.length; i++){
        let x = ciphertext[i] - key.charCodeAt(j)
        if(x < 0){
            x = 256 - (key.charCodeAt(j) - ciphertext[i]) % 256
        }else{
            x = x % 256
        }

        plaintext[i] = x
        j++
        j = j % key.length
    }

    return plaintext
}

module.exports = {vigenereDecrypt, vigenereEncrypt}