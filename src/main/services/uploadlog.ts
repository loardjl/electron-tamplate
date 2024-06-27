import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'
import { EventEmitter } from 'events'
import { serverCfg } from '../config/index'
import { CancelTokenSource } from 'axios'
import { Logger } from 'log4js'
import log from '../manager/log'

class Main {
  public isStopped: boolean
  private emitter: EventEmitter
  private serverCfg: any
  private eomsUrl: string
  //创建一个cancelToken的源
  private source: CancelTokenSource
  private logger: Logger

  constructor() {
    this.isStopped = false
    this.serverCfg = serverCfg
    this.emitter = new EventEmitter()
    this.emitter.on('close', () => {
      this.isStopped = true
    })
    this.logger = log
    this.eomsUrl = `http://${this.serverCfg.SOURCE.eoms.http.host}:${this.serverCfg.SOURCE.eoms.http.port}/eoms`
  }
  //开始操作文件
  /**
   *  根据路径复制文件
   * @param envet ipc event
   * @param destPath  前端传过来的路径和文件名称
   * @returns 1：成功 2：失败 3：停止
   */
  async start(_envet, destPath): Promise<number> {
    // 开始复制 初始化停止标志
    this.isStopped = false
    //初始化请求缓存源
    this.source = axios.CancelToken.source()
    try {
      // 获取需要保存的文件路径
      let resDir: any = await axios
        .post(
          this.eomsUrl,
          {
            version: '1.0',
            method: 'get_exception_store_config',
            id: '1',
            params: {}
          },
          {
            cancelToken: this.source.token
          }
        )
        .then(res => {
          return res
        })
        .catch(err => {
          this.logger.error(err)
        })

      if (resDir === undefined) {
        return 2
      }
      //获取文件名和文件路径
      const { fileName, fileDir } = destPath
      const dest = path.join(fileDir[0], fileName)

      //获取当前日期 YYYYMMDD YYYY-MM-DD
      let currentDate1 = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      let currentDate2 = new Date().toISOString().slice(0, 10)

      for (let key in resDir.data.result) {
        console.log(key)
        // 检查是否停止
        if (this.isStopped) {
          return 3
        }
        // 拼接目标路径
        destPath = path.join(dest, key)

        if (key === 'config') {
          for (let config of resDir.data.result[key].app_config_list) {
            let dirPath = config.dir_path
            let appName = config.app_name
            let filterSubDirList = config.filter_sub_dir_list

            let destDir = path.join(destPath, appName)
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true })
            }

            let files = fs.readdirSync(dirPath, { withFileTypes: true })
            for (let file of files) {
              if (this.isStopped) {
                console.log('Process stopped.')
                return 3
              }

              if (file.isDirectory() && filterSubDirList.includes('\\' + file.name)) {
                continue
              }
              let fullSrcPath = path.join(dirPath, file.name)
              let fullDestPath = path.join(destDir, file.name)
              fs.copyFileSync(fullSrcPath, fullDestPath)
            }
          }
        }
        if (key === 'log') {
          for (let log of resDir.data.result[key].app_log_list) {
            let dirPath = log.dir_path
            let appName = log.app_name
            let prefixName = log.prefix_name

            let destDir = path.join(destPath, appName)
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true })
            }

            let files = fs.readdirSync(dirPath, { withFileTypes: true })
            for (let file of files) {
              if (this.isStopped) {
                return 3
              }

              // 检查文件名是否以 prefixName 开头，并且后面跟着当前日期

              let regex = new RegExp(`^${prefixName}[-_](${currentDate1}|${currentDate2})`)

              if (file.isFile() && regex.test(file.name)) {
                let fullSrcPath = path.join(dirPath, file.name)
                let fullDestPath = path.join(destDir, file.name)
                fs.copyFileSync(fullSrcPath, fullDestPath)
              }
            }
          }
          // 新增的处理 'kw_platform' 的逻辑
          let kwPlatform = resDir.data.result[key].kw_platform
          let dirPath = kwPlatform.dir_path
          let appName = kwPlatform.app_name || 'kw_platform'
          let destDir = path.join(destPath, appName)
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true })
          }
          let files = fs.readdirSync(dirPath, { withFileTypes: true })
          for (let prefixName of kwPlatform.prefix_name_list) {
            for (let file of files) {
              if (this.isStopped) {
                return 3
              }

              let regex = new RegExp(`^${prefixName}[-_](${currentDate1}|${currentDate2})`)
              //测试
              // let regex = new RegExp(`^${prefixName}[-_](\\d{8}|\\d{4}-\\d{2}-\\d{2})`);

              if (file.isFile() && regex.test(file.name)) {
                let fullSrcPath = path.join(dirPath, file.name)
                let fullDestPath = path.join(destDir, file.name)
                fs.copyFileSync(fullSrcPath, fullDestPath)
              }
            }
          }
        }
        if (key === 'dump') {
          for (let dump of resDir.data.result[key].dmp_list) {
            let dirPath = dump.dir_path
            let appName = dump.app_name
            let destDir = path.join(destPath, appName)
            let prefixName = dump.prefix_name
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true })
            }
            let files = fs.readdirSync(dirPath, { withFileTypes: true })
            for (let file of files) {
              if (this.isStopped) {
                console.log('Process stopped.')
                return 3
              }
              //正式
              let regex = new RegExp(`^${prefixName}[_]{1,2}(${currentDate1}|${currentDate2})`)
              //测试
              // let regex = new RegExp(`^${prefixName}[_]{1,2}(\\d{8}|\\d{4}-\\d{2}-\\d{2})`);

              if (file.isFile() && regex.test(file.name)) {
                let fullSrcPath = path.join(dirPath, file.name)
                let fullDestPath = path.join(destDir, file.name)
                fs.copyFileSync(fullSrcPath, fullDestPath)
              }
            }
          }
        }
        if (key === 'other') {
          let destDir = path.join(destPath, 'cfg')
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true })
          }

          for (let filePath of resDir.data.result[key].cfg_file_list) {
            if (this.isStopped) {
              return 3
            }
            // 检查文件是否存在 不存在则跳过
            if (!fs.existsSync(filePath)) {
              console.log(`File ${filePath} does not exist.`)
              continue
            }

            // 截取 $RECYCLE\\*\\ * 作为目标路径路径
            let uniquePath = filePath.split('\\')[2]

            // 检查目标路径是否存在，如果不存在则创建
            let destDirPath = path.join(destDir, uniquePath)
            if (!fs.existsSync(destDirPath)) {
              fs.mkdirSync(destDirPath, { recursive: true })
            }
            let fileName = path.basename(filePath)
            let fullDestPath = path.join(destDirPath, fileName)
            fs.copyFileSync(filePath, fullDestPath)
          }
        }
        // 处理其他 key 的逻辑...
      }
      return 1
    } catch (error) {
      console.error(error)
      return 2
    }
  }

  //停止操作文件
  close() {
    this.emitter.emit('close')
    this.source.cancel('Operation canceled by the user.')
  }
}

export default Main
