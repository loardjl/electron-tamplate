class BaseSqlModel {
  constructor() {
    this.db = require('../conn/DB')
    this.logger = require('../manager/log')
    this.tableName = ''
  }

  // initindex() {
  //     let sql = `SELECT name FROM sqlite_master WHERE type='index' AND name='date_time_index'`
  //     let stmt = this.db.prepare(sql);
  //     let t = stmt.get();
  //     if (!t || !t.name) {
  //         let sql = `CREATE INDEX date_time_index ON video_log (date_time)`;
  //         let stmt = this.db.prepare(sql);
  //         stmt.run();
  //     }
  // }

  /**
   * 新增数据
   * @param {Object} obj 插入对象，key数据库列名
   */
  insertOne(obj) {
    let sql = `insert into ${this.tableName} `
    const keys = Object.keys(obj)
    sql += `(${keys.join(',')}) values`
    const varr = keys.map(data => {
      return `@${data}`
    })
    sql += ` (${varr.join(',')}) `
    this.logger.info(sql, obj)
    const stmt = this.db.prepare(sql)
    stmt.run(obj)
  }

  insertMany(arr) {
    if (arr.length <= 0) {
      return
    }
    let sql = `insert into ${this.tableName} `
    const keys = Object.keys(arr[0])
    sql += `(${keys.join(',')}) values`
    const varr = keys.map(data => {
      return `@${data}`
    })
    sql += ` (${varr.join(',')}) `
    this.logger.info(sql, arr)
    const stmt = this.db.prepare(sql)
    const insertall = this.db.transaction(datas => {
      for (const item of datas) {
        stmt.run(item)
      }
    })
    insertall(arr)
  }

  getFindSql(con = {}, fields = [], options = {}) {
    let sql = 'select'
    if (fields.length > 0) {
      sql += ` ${fields.join(',')}`
    } else {
      sql += ' *'
    }
    sql += ` from ${this.tableName}`
    sql += this.getConSql(con)
    if (Object.keys(options).length > 0) {
      if (options.order) {
        const orderarr = []
        for (const k in options.order) {
          if (options.order[k] == 1) {
            orderarr.push(` ${k} ASC`)
          } else {
            orderarr.push(`${k} DESC`)
          }
        }
        sql += ` order by ${orderarr.join(',')}`
      }

      if (options.limit) {
        sql += ` limit ${options.limit}`
      }
      if (Number.isInteger(options.offset)) {
        sql += ` offset ${options.offset}`
      }
    }
    return sql
  }

  getConSql(con) {
    let sql = ''
    if (Object.keys(con).length > 0) {
      sql += ' where'
      for (const k in con) {
        if (typeof con[k] === 'object') {
          if (con[k].op == 'between') {
            sql += ` ${k} between ${con[k].value[0]} and ${con[k].value[1]} and`
          }
        } else {
          if (typeof con[k] === 'string') {
            sql += ` ${k} = "${con[k]}" and`
          } else {
            sql += ` ${k} = ${con[k]} and`
          }
        }
      }
      sql = sql.slice(0, sql.length - 3)
    }
    return sql
  }

  /**
   * 查询
   * @param {Object} con 查询条件
   * @param {Array} fields 要查询的字段
   * @param {Object} options limit skip
   * @returns
   */
  find(con = {}, fields = [], options = {}) {
    const sql = this.getFindSql(con, fields, options)
    this.logger.info(sql, fields, options)
    const stmt = this.db.prepare(sql)
    const data = stmt.all()
    return data
  }

  findOne(con = {}, fields = [], options = {}) {
    const sql = this.getFindSql(con, fields, options)
    console.log(sql, con, fields, options)
    const stmt = this.db.prepare(sql)
    const data = stmt.get()
    return data
  }

  /**
   * 更新
   * @param {*} con
   * @param {*} obj
   */
  update(con = {}, obj = {}) {
    let sql = `update ${this.tableName} set `
    const arr = []
    for (const k in obj) {
      arr.push(` ${k} =@${k} `)
    }
    sql += arr.join(',')
    sql += this.getUpdateConSql(con, obj)
    const stmt = this.db.prepare(sql)
    const formateCon = {}
    for (const k in con) {
      if (obj[k]) {
        formateCon[k + '_k'] = con[k]
      } else {
        formateCon[k] = con[k]
      }
    }
    this.logger.info(sql, formateCon, obj)
    stmt.run({ ...formateCon, ...obj })
  }

  getUpdateConSql(con = {}, updateObj = {}) {
    let sql = ''
    if (Object.keys(con).length > 0) {
      sql += ' where '
      for (const k in con) {
        if (updateObj[k]) {
          sql += `${k} =@${k}_k and`
        } else {
          sql += `${k} =@${k} and`
        }
      }
      sql = sql.slice(0, sql.length - 3)
    }
    return sql
  }

  // 删除
  del(con = {}) {
    let sql = ` delete from ${this.tableName} `
    sql += this.getUpdateConSql(con)
    this.logger.info(sql, con)
    const stmt = this.db.prepare(sql)
    stmt.run(con)
  }

  // count
  count(con = {}) {
    let sql = `SELECT COUNT(*) AS 'count' from ${this.tableName} `
    sql += this.getConSql(con)
    const stmt = this.db.prepare(sql)
    const data = stmt.get()
    return data.count
  }
}

module.exports = BaseSqlModel
