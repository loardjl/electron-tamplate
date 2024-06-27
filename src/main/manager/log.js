const log4js = require('log4js')
const path = require('path')
const fs = require('fs')

log4js.configure({
  appenders: {
    file: {
      type: 'DateFile',
      filename: 'D:\\kws_applog\\app.log',
      keepFileExt: true,
      fileSizeLimit: 1024,
      alwaysIncludePattern: true,
      numBackups: 3,
      compress: true
    },
    errors: {
      type: 'logLevelFilter',
      appender: 'sliceFileError',
      level: 'error'
    },
    sliceFile: {
      type: 'file',
      filename: 'D:\\kws_applog\\app.log',
      maxLogSize: 104857600, // 100mb,日志文件大小,超过该size则自动创建新的日志文件
      backups: 15, // 仅保留最新的20个日志文件
      compress: true, //  超过maxLogSize,压缩代码
      keepFileExt: true
    },
    sliceFileError: {
      type: 'file',
      filename: 'D:\\kws_applog\\app_error.log',
      maxLogSize: 104857600, // 100mb,日志文件大小,超过该size则自动创建新的日志文件
      backups: 15, // 仅保留最新的20个日志文件
      compress: true, //  超过maxLogSize,压缩代码
      keepFileExt: true
    },
    console: { type: 'console' }
  },
  categories: {
    app: { appenders: ['sliceFile', 'errors'], level: 'info' },
    out: { appenders: ['console'], level: 'info' },
    default: { appenders: ['errors', 'console', 'sliceFile'], level: 'info' }
  }
})

let logger = log4js.getLogger('app')
if (process.env.NODE_ENV === 'development') {
  logger = log4js.getLogger()
}

// 删除指定目录下旧于指定天数的文件
function deleteOldLogs(directory, daysToKeep) {
  const files = fs.readdirSync(directory)
  const currentDate = new Date()

  files.forEach(file => {
    const filePath = path.join(directory, file)
    const stats = fs.statSync(filePath)
    const creationDate = stats.birthtime // 获取文件创建时间

    const timeDiff = Math.abs(currentDate.getTime() - creationDate.getTime())
    const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) // 计算时间差，转换为天数

    if (diffDays > daysToKeep) {
      logger.info(filePath, '删除文件')
      fs.unlinkSync(filePath) // 删除文件
    }
  })
}

// 删除指定目录下旧于7天的日志文件
// deleteOldLogs('D:\\kws_applog', 7)

module.exports = logger
