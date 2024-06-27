const mqtt = require('mqtt')
const EventEmitter = require('events')
const logger = require('../manager/log')
const emitterClinet = new EventEmitter()

class mqttCient {
  constructor(host, router, clinet_id, config) {
    this.config = config
    // 客户端id
    this.status = -1 // -1未连接 1连接
    this.clientId = clinet_id
    this.client = null
    this.logger = logger
    // 特殊事件用于tcp转http模式
    this.emitterClinet = emitterClinet
    // 连接到 MQTT 代理（broker）
    this.client = mqtt.connect(`mqtt://${host}`, {
      protocolVersion: 5, // 设置协议版本为 MQTT 5
      clientId: clinet_id
    })
    // 收到消息时的处理
    this.client.on('message', (topic_p, message) => {
      try {
        message = JSON.parse(message.toString())
        let data = null
        try {
          data = JSON.parse(message['data'])
        } catch (e) {
          data = message['data']
        }
        const { topic } = data
        this.logger.info(`mqtt消息:`, topic ? topic : topic_p)
        if (topic) {
          this.emitterClinet.emit(topic, data)
        } else {
          this.emitterClinet.emit(topic_p, data)
        }
      } catch (e) {
        this.logger.error(e)
      }
    })
    this.client.on('connect', message => {
      this.status = 1
      this.logger.info('mqtt连接成功')
    })
    this.client.on('close', message => {
      this.status = -1
      this.logger.info('mqtt关闭', message)
    })
    // 处理错误
    this.client.on('error', error => {
      this.logger.error('mqtt连接错误', error)
    })
    this.router = [
      {
        topic: '123',
        context_type: 1 // 1是json 2是分片（json)
      }
    ]
    if (router) {
      this.router = router
    }
    // 订阅所有topic
    this.subscribe()
  }

  // 补充订阅
  addRouter(router) {
    this.router.push(...router)
  }

  /**
   * 订阅所有topic
   */
  subscribe() {
    // 订阅客户端id主题
    this.client.subscribe(this.clientId, err => {
      if (err) {
        this.logger.error('订阅失败')
      }
    })
  }

  /**
   * 发送到mqtt服务器
   * @param topic
   * @param jsonDict
   * @param handle_fun 如果存在该函数不返回任何数据
   * @param properties
   * @returns {Promise<unknown>}
   */
  send(topic, jsonDict, handle_fun, userProperties) {
    // 发布消息到一个主题
    let body = null
    if (jsonDict instanceof Buffer) {
      body = jsonDict
    } else {
      body = JSON.stringify(jsonDict)
    }
    const properties = {
      responseTopic: this.clientId, // 设置 responseTopic
      userProperties: {
        env: this.config['monitor']['env'] //用于和多个服务器中的一个做对应，正式环境要使用
      }
    }
    if (userProperties) {
      // 遍历对象的属性
      for (const key in userProperties) {
        // 判断条件，这里假设要删除包含 'is' 字符串的属性
        const data = userProperties[key]
        if (data === undefined || data === null) {
          delete userProperties[key]
        }
      }
      Object.assign(properties['userProperties'], userProperties)
    }
    this.logger.info('mqtt 发送主题 : ', topic)
    this.client.publish(
      topic,
      body,
      { qos: 2, properties },
      err => {
        if (err) {
          this.logger.error('发送失败', topic, body, err)
        }
      }
      /**
       * 除了它本身的重试机制外还有
       * 1. 失败重试
       * 2. 回调确认，否则重试
       * 3. 消费方确认回调函数，否则重试
       */
    )
    if (handle_fun) {
      handle_fun(this.emitterClinet)
    }
  }

  /**
   * 只是监听
   * @param handle_fun
   * @param topic 如果存在需要订阅一下
   */
  on(topic, handle_fun) {
    this.logger.info('订阅 topic:', topic)
    this.client.subscribe(topic, err => {
      if (err) {
        this.logger.error('订阅失败', err)
      }
    })
    this.emitterClinet.on(topic, data => {
      handle_fun(data)
    })
  }
}
module.exports = mqttCient
