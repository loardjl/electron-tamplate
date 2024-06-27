import rollupOptions from "./rollup.config";

process.env.NODE_ENV = "development";
process.env.DEV = "debug";
import { spawn ,exec} from "child_process";

const mainOpt = rollupOptions(process.env.NODE_ENV, "main");


// 预处理代码
function do_code() {
    // var args = [
    //   "type=do",
    //   "files=../dist/main/services/ipcMain.ts",
    // ];
    exec(' node .electron-vite/trimer.js  type=do-onces files=src/main/services/ipcMain.ts ', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });

}
//**********************后端代码启动
import { run } from '../src/main/conn/server.js';
run();
// do_code();
//**********************后端代码启动
