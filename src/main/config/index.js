const path = require('path')
const packageInfo = require('../../../package.json')
const YAML = require('yamljs')

const serverCfg = {
  // 配置文件值
  DC_HTTP: '',
  DC_DECISION_HTTP: '',
  DC_TCP: '',
  DC_TCP_PORT: '',
  M_TCP: '',
  M_TCP_PORT: '',
  VCS_TCP: '',
  VCS_TCP_PORT: '',
  SOURCE: {}
}

function runDev() {
  const config_path = path.join(__dirname, '..', '..', '..', 'resource', 'dev', 'config.yml')
  const nativeObject = YAML.load(config_path)
  const packageInfo = require('../../../package.json')
  nativeObject['packageInfo'] = packageInfo
  settingValue(nativeObject)
}

function runDebug() {
  const config_path = path.join('..', 'resource', 'dev', 'config.yml')
  const nativeObject = YAML.load(config_path)
  const packageInfo = require('../../../package.json')
  nativeObject['packageInfo'] = packageInfo
  settingValue(nativeObject)
}

function run() {
  const config_path = path.join('.', 'config.yml')
  const nativeObject = YAML.load(config_path)
  nativeObject['packageInfo'] = packageInfo
  settingValue(nativeObject)
}
function settingValue(value) {
  serverCfg.DC_HTTP = `http://${value.dc.http.host}:${value.dc.http.port}`
  serverCfg.DC_DECISION_HTTP = `http://${value.dc.http.host}:${value.dc.http.port_decision}`
  serverCfg.DC_TCP = `${value.dc.tcp.host}`
  serverCfg.DC_TCP_PORT = `${value.dc.tcp.port}`
  serverCfg.M_TCP = `${value.m.tcp.host}`
  serverCfg.M_TCP_PORT = `${value.m.tcp.port}`
  serverCfg.VCS_TCP = `${value.vcs.tcp.host}`
  serverCfg.VCS_TCP_PORT = `${value.vcs.tcp.port}`
  serverCfg.SOURCE = value
}

if (process.env.NODE_ENV === 'development') {
  if (process.env.DEV === 'debug') {
    runDebug()
  } else {
    runDev()
  }
} else {
  run()
}

module.exports = { serverCfg, runDev, runDebug, run }
