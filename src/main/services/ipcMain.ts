import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import { IsUseSysTitle } from '../config/const'
import { winURL, preloadURL, staticPaths } from '../config/StaticPath'
import { updater } from './HotUpdater'
import { updater as updaterTest } from './HotUpdaterTest'
import DownloadFile from './downloadFile'
import Update from './checkupdate'
import { otherWindowConfig } from '../config/windowsConfig'
import { UpdateStatus } from 'electron_updater_node_core'
import fs from 'node:fs'
import path from 'node:path'
import UploadLog from './uploadlog'

// trim_start todo 请不要删除这两行注释 打包的时候需要
import { io, run } from '../conn/server.js'
import logger from '@main/manager/log'
run()
// trim_end

export default {
  Mainfunc() {
    const allUpdater = new Update()

    const uploadlog = new UploadLog()

    ipcMain.handle('upload-log', async (event, destPath) => {
      console.log('upload-log', destPath)
      const res = await uploadlog.start(event, destPath)
      if (res === 1) {
        return { state: 1, message: '上传成功' }
      } else if (res === 2) {
        return { state: 2, message: '上传失败' }
      } else {
        return { state: 0, message: '上传停止' }
      }
    })

    ipcMain.handle('cancel-upload', () => {
      console.log('cancelupload-log')
      if (uploadlog) {
        uploadlog.close()
      }
    })

    ipcMain.handle('IsUseSysTitle', async () => {
      return IsUseSysTitle
    })
    ipcMain.handle('windows-mini', (event, args) => {
      BrowserWindow.fromWebContents(event.sender)?.minimize()
    })
    ipcMain.handle('window-max', async (event, args) => {
      if (BrowserWindow.fromWebContents(event.sender)?.isMaximized()) {
        BrowserWindow.fromWebContents(event.sender)?.restore()
        return { status: false }
      } else {
        BrowserWindow.fromWebContents(event.sender)?.maximize()
        return { status: true }
      }
    })
    ipcMain.handle('window-close', async (event, args) => {
      BrowserWindow.fromWebContents(event.sender)?.close()
    })
    ipcMain.handle('check-update', event => {
      allUpdater.checkUpdate(BrowserWindow.fromWebContents(event.sender))
    })
    ipcMain.handle('confirm-update', () => {
      allUpdater.quitAndInstall()
    })
    if (process.env.NODE_ENV !== 'development') {
      ipcMain.handle('app-close', async (event, args) => {
        // trim_start todo 请不要删除这两行注释 打包的时候需要
        io.disconnectSockets()
        // trim_end
        app.quit()
      })
    }
    ipcMain.handle('get-static-path', (event, args) => {
      return staticPaths
    })
    ipcMain.handle('open-messagebox', async (event, arg) => {
      const res = await dialog.showMessageBox(BrowserWindow.fromWebContents(event.sender), {
        type: arg.type || 'info',
        title: arg.title || '',
        buttons: arg.buttons || [],
        message: arg.message || '',
        noLink: arg.noLink || true
      })
      return res
    })
    ipcMain.handle('open-errorbox', (event, arg) => {
      dialog.showErrorBox(arg.title, arg.message)
    })
    ipcMain.handle('hot-update', (event, arg) => {
      updater(BrowserWindow.fromWebContents(event.sender))
    })
    ipcMain.handle('hot-update-test', async (event, arg) => {
      console.log('hot-update-test')
      try {
        const updateInfo = await updaterTest(BrowserWindow.fromWebContents(event.sender))
        if (updateInfo === UpdateStatus.Success) {
          app.quit()
        } else if (updateInfo === UpdateStatus.HaveNothingUpdate) {
          console.log('不需要更新')
        } else if (updateInfo === UpdateStatus.Failed) {
          console.error('更新出错')
        }
      } catch (error) {
        // 更新出错
        console.error('更新出错')
      }
    })
    ipcMain.handle('start-download', (event, downloadUrl) => {
      new DownloadFile(BrowserWindow.fromWebContents(event.sender), downloadUrl).start()
    })
    ipcMain.handle('open-win', (event, arg) => {
      const ChildWin = new BrowserWindow({
        titleBarStyle: IsUseSysTitle ? 'default' : 'hidden',
        ...Object.assign(otherWindowConfig, {})
      })
      // 开发模式下自动开启devtools
      if (process.env.NODE_ENV === 'development') {
        ChildWin.webContents.openDevTools({ mode: 'undocked', activate: true })
      }
      ChildWin.loadURL(winURL + `#${arg.url}`)
      ChildWin.once('ready-to-show', () => {
        ChildWin.show()
        if (arg.IsPay) {
          // 检查支付时候自动关闭小窗口
          const testUrl = setInterval(() => {
            const Url = ChildWin.webContents.getURL()
            if (Url.includes(arg.PayUrl)) {
              ChildWin.close()
            }
          }, 1200)
          ChildWin.on('close', () => {
            clearInterval(testUrl)
          })
        }
      })
      // 渲染进程显示时触发
      ChildWin.once('show', () => {
        ChildWin.webContents.send('send-data-test', arg.sendData)
      })
    })
    ipcMain.handle('setLogo', (event, arg) => {
      fs.writeFileSync(path.join(__dirname, '../../../resource/ti.txt'), arg, 'utf-8')
    })
    ipcMain.handle('setRealLogo', (event, arg) => {
      logger.info('setRealLogo', arg)
      fs.writeFileSync(path.join(__dirname, '../../../../../ti.txt'), arg, 'utf-8')
    })
    ipcMain.handle('getLogo', (event, arg) => {
      const imgPath = path.join(__dirname, '../../../../../ti.txt')
      try {
        const res = fs.readFileSync(imgPath, 'utf-8')
        logger.info('getLogo', res)
        return { status: true, data: res }
      } catch (error) {
        logger.error('getLogo', error)
        return { status: false, data: '' }
      }
    })
    ipcMain.handle('reload', (event, arg) => {
      const YAML = require('yamljs')
      let config_path = path.join(__dirname, '..', '..', '..', 'resource', 'dev', 'config.yml')
      if (process.env.NODE_ENV !== 'development') {
        config_path = path.join('.', 'config.yml')
      }
      const configObj = YAML.load(config_path)
      if (arg.type === 1 && arg.password !== configObj['password']) {
        return { status: false, message: 'Authentication error' }
      }
      configObj['rules'] = arg.rules
      fs.writeFileSync(config_path, YAML.stringify(configObj, 4), 'utf-8')
      BrowserWindow.fromWebContents(event.sender)?.reload()
    })
    ipcMain.handle('checkAuth', (event, arg) => {
      const YAML = require('yamljs')
      let config_path = path.join(__dirname, '..', '..', '..', 'resource', 'dev', 'config.yml')
      if (process.env.NODE_ENV !== 'development') {
        config_path = path.join('.', 'config.yml')
      }
      const configObj = YAML.load(config_path)
      if (arg.type === 1 && arg.password !== configObj['password']) {
        return { status: false, message: 'Authentication error' }
      } else {
        return { status: true }
      }
    })
    ipcMain.handle('open-directory', async (event, arg) => {
      const res = await dialog.showOpenDialog({ properties: ['openDirectory'] })
      return res
    })
    app.on('before-quit', () => {
      console.log('before-quit')
      const YAML = require('yamljs')
      let config_path = path.join(__dirname, '..', '..', '..', 'resource', 'dev', 'config.yml')
      if (process.env.NODE_ENV !== 'development') {
        config_path = path.join('.', 'config.yml')
      }
      const configObj = YAML.load(config_path)
      configObj['rules'] = '0'
      fs.writeFileSync(config_path, YAML.stringify(configObj, 4), 'utf-8')
      close()
    })
  }
}
