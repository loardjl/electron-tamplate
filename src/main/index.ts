'use strict'

import { app, session, ipcRenderer, crashReporter } from 'electron'
import InitWindow from './services/windowManager'
import DisableButton from './config/DisableButton'
import path from 'path';
import logger from './manager/log'
import { eapp } from './conn/server.js'
import axios from "axios";
// import {sucess,fail} from "@main/model/pojo/Result";

let mainWindow = null

function onAppReady() {
  mainWindow = new InitWindow()
  mainWindow.initWindow()
  const axios = require("axios");
  function min(target) {
    // cds
    if (target !== 'cds')
      axios.post('http://localhost:25566/goto', {
        type: -1
      })
    // vcs 卡屑
    else if (target !== 'vcs')
      axios.post('http://localhost:15572/goto', {
        type: -1
      })

  }
  eapp.post('/goto', (req, res) => {

    try {
      let { target, type } = req.body;
      logger.info(target, type, '&&&&&&&&&')
      if (type === 1) {
        // 开启自己，
        mainWindow.show_selef();
        res.send({ status: true })
        return;
      } else if (type === -1) {
        mainWindow.hide_self()
        res.send({ status: true })
        return;
      }
      // 打开别人，关闭自己
      if (target === 'kws') {
        // 跳转自己
        res.send({ status: true, data: 'kws' })
        return;
      } else if (target === 'cds') {
        mainWindow.hide_self()
        setTimeout(() => {
          axios.post('http://localhost:25566/goto', {
            type: 1
          })
        }, 100)
        // 关闭其它所有
        min(target)
      } else if (target === 'vcs') {
        mainWindow.hide_self()
        setTimeout(() => {
          axios.post('http://localhost:15572/goto', {
            type: 1
          })
        }, 100)
        // 关闭其它所有
        min(target)
      }
      res.send({ status: true, data: target })
    } catch (e) {
      logger.info(e, '*******')
      res.send({ status: false, data: e.toString() })
    }
  })
  DisableButton.Disablef12()


  if (process.env.NODE_ENV === 'development') {
    const { VUEJS3_DEVTOOLS } = require('electron-devtools-vendor')
    session.defaultSession.loadExtension(VUEJS3_DEVTOOLS, {
      allowFileAccess: true
    })
    console.log('已安装: vue-devtools')
  }
}

// 获取奔溃堆栈文件存放路径
let crashFilePath = '';
let crashDumpsDir = '';
try {
  // electron 低版本
  crashFilePath = path.join(app.getPath('temp'), app.getName() + ' Crashes');
  logger.info('————————crash path:', crashFilePath);

  // electron 高版本
  crashDumpsDir = app.getPath('crashDumps');
  logger.info('————————crashDumpsDir:', crashDumpsDir);
} catch (e) {
  console.error('获取奔溃文件路径失败', e);
}

// 开启crash捕获
crashReporter.start({
  productName: 'Your-Application-Name',
  companyName: 'Your-Company-Name',
  submitURL: '',  // 上传到服务器的地址
  uploadToServer: false, // 不上传服务器
  ignoreSystemCrashHandler: false, // 不忽略系统自带的奔溃处理，为 true 时表示忽略，奔溃时不会生成奔溃堆栈文件
});

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // app.quit()
  })
  app.whenReady().then(onAppReady)
  // 由于9.x版本问题，需要加入该配置关闭跨域问题
  app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')

  app.on('window-all-closed', () => {
    // 所有平台均为所有窗口关闭就退出软件
    app.quit()
  })
  app.on('browser-window-created', () => {
    console.log('window-created')
  })

  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.removeAsDefaultProtocolClient('indicator-real-time-monitoring')
      console.log('由于框架特殊性开发环境下无法使用')
    }
  } else {
    app.setAsDefaultProtocolClient('indicator-real-time-monitoring')
  }
}
