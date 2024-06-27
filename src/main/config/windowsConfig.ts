import { IsUseSysTitle } from './const'
import { BrowserWindowConstructorOptions, screen } from 'electron'
const fullscreen = process.env.NODE_ENV === 'development' ? false : true

// export const mainWindowConfig: BrowserWindowConstructorOptions = {
//   height: height,
//   useContentSize: true,
//   width: 1600,
//   minWidth: width,
//   show: false,
//   frame: IsUseSysTitle,
//   fullscreen:true, // 是否全屏
//   webPreferences: {
//     contextIsolation: false,
//     nodeIntegration: true,
//     webSecurity: false,
//     // 如果是开发模式可以使用devTools
//     devTools: process.env.NODE_ENV === 'development',
//     // 在macos中启用橡皮动画
//     scrollBounce: process.platform === 'darwin'
//   }
// }
export function mainWindowConfig(size: any): BrowserWindowConstructorOptions {
  return {
    height: size.height,
    useContentSize: true,
    width: 1600,
    minWidth: size.width,
    show: false,
    frame: IsUseSysTitle,
    fullscreen, // 是否全屏
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false,
      // 如果是开发模式可以使用devTools
      devTools: process.env.NODE_ENV === 'development',
      // 在macos中启用橡皮动画
      scrollBounce: process.platform === 'darwin'
    }
  }
}

const otherWindowWidth = 500
// 宽高比 16/9
const otherWindowHeight = Math.floor((otherWindowWidth * 9) / 16)

export const otherWindowConfig: BrowserWindowConstructorOptions = {
  height: otherWindowHeight,
  useContentSize: true,
  width: otherWindowWidth,
  autoHideMenuBar: true,
  minWidth: otherWindowWidth,
  frame: IsUseSysTitle,
  show: false,
  resizable: false,
  webPreferences: {
    contextIsolation: false,
    nodeIntegration: true,
    webSecurity: false,
    // 如果是开发模式可以使用devTools
    devTools: false,
    // 在macos中启用橡皮动画
    scrollBounce: process.platform === 'darwin'
  }
}
