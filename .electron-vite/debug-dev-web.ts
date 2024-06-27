import Portfinder from "portfinder";
import config from "../config";
import {createServer} from "vite";
import {join} from "path";
import chalk from "chalk";

function startRenderer(): Promise<void> {
    return new Promise((resolve, reject) => {
        Portfinder.basePort = config.dev.port || 9080;
        Portfinder.getPort(async (err, port) => {
            if (err) {
                reject("PortError:" + err);
            } else {
                const server = await createServer({
                    configFile: join(__dirname, "vite.config.ts"),
                });
                process.env.PORT = String(port);
                await server.listen(port);
                console.log(
                    "\n\n" +
                    chalk.blue(
                        `${
                            config.dev.chineseLog
                                ? "  正在准备主进程，请等待..."
                                : "  Preparing main process, please wait..."
                        }`
                    ) +
                    "\n\n"
                );
                resolve();
            }
        });
    });
}

startRenderer()