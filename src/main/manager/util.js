const logger = require('./log')
module.exports = {
  // 校验码生成
  generateXORChecksum(buffer) {
    let checksum = 0
    for (let i = 0; i < buffer.length; i++) {
      checksum ^= buffer[i]
    }
    const buf = Buffer.alloc(1)
    buf.writeUInt8(checksum)
    return buf
  }
}
