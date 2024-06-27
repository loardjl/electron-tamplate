
## timer.js 功能
他需要这样使用：
1. 在特定代码加上注释（成对）
```javascript
// trim_start todo 请不要删除这两行注释 打包的时候需要
     import { io, run } from '../conn/server.js';
     if (process.env.NODE_ENV !== "development") {
      run();
  }
// trim_end
```
2. 使用命令
` node .electron-vite/trimer.js  type=do-onces files=src/main/services/ipcMain.ts`可以对成对注释的代码，在特定的执行结果后取消和加上注释，从而让后端代码不被打包进mian.js
