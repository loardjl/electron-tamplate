### 请确保您的 node 版本大于等于 16.

#### 如何安装

```bash
npm config edit
# 该命令会打开npm的配置文件，请在空白处添加，记得去除#号
# electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
# electron_mirror=https://cdn.npmmirror.com/binaries/electron/
# registry=https://registry.npmmirror.com/
# 然后关闭该窗口，重启命令行.
# 使用yarn安装
yarn 或 yarn install

# 启动之后，会在9080端口监听
yarn dev

# build命令在不同系统环境中，需要的的不一样，需要自己根据自身环境进行配置
yarn build

```

---
