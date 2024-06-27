// 加密
const crypto = require('crypto');

const algorithm = 'aes-256-cbc'; // 使用 AES-256-CBC 加密算法
const key = Buffer.from('uj12223245lhxnjsurekgy9211963891'); // 使用一个 32 字节（256 位）的密钥
const iv = Buffer.from('1154167832123456'); // 使用一个 16 字节的初始化向量（IV）
const header = '2049672011' // 加密过后的文件，前几个字符串用于表达是已经加过密的
const fs = require('fs')

// 加密函数
function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// 解密函数
function decrypt(encrypted) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

/**
 * 通过项目的packaeg json获取多个需要加密的文件
 * @param package_path
 */
function encrypt_files(package_path) {
    let json = require(package_path);
    let code_files = json['code_files'];
    console.log(`共${code_files.length}个文件`)
    for (let file of code_files) {
        let data = fs.readFileSync(file);
        let code = data.toString();
        let h = code.substring(0,10);
        if (h===header) {
            console.log(`${file}是已经被加密过的！`)
            continue
        }
        // 加密
        const encryptedText = encrypt(code);
        let data_js_code = header+encryptedText;
        fs.writeFileSync(file,data_js_code);
    }
    console.log(`加密完成`)
}
function encrypt_file(file_path) {
    let code_file = file_path;
    let data = fs.readFileSync(code_file);
    let code = data.toString();
    let h = code.substring(0,10);
    if (h===header) {
        console.log(`已经被加密过！`)
    } else {
        // 加密
        const encryptedText = encrypt(code);
        let data_js_code = header+encryptedText;
        fs.writeFileSync(code_file,data_js_code);
    }
    console.log(`加密完成`)
}
module.exports.encrypt_files = encrypt_files
module.exports.encrypt_file = encrypt_file

// encrypt_file('./main.js')
// // 要加密的明文
// const originalText = 'console.log(666);';
// // 加密
// const encryptedText = encrypt(originalText);
//
// console.log('Encrypted:', encryptedText);
